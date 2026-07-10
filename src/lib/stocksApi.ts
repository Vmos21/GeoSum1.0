import type { Stock } from "../types";
import { MOCK_STOCKS, DEFAULT_WATCHLIST } from "../data/mockData";

// Twelve Data supports CORS from the browser, so this is called directly —
// no proxy needed for a personal project. Set VITE_STOCKS_PROXY_URL to
// route through your own serverless proxy instead, for production use.
const STOCKS_PROXY_ENDPOINT = import.meta.env.VITE_STOCKS_PROXY_URL as string | undefined;
const TWELVE_DATA_API_KEY = import.meta.env.VITE_TWELVE_DATA_API_KEY as string | undefined;
const TWELVE_DATA_URL = "https://api.twelvedata.com/quote";

interface TickerDef {
  symbol: string;
  exchange?: string; // Twelve Data "exchange" param, e.g. "NSE", "KRX"
  companyName: string;
  currency: string;
}

// Real tickers per country. US-listed ADRs are used where available since
// they're the most reliably covered on Twelve Data's free tier; local
// exchange tickers are used where no solid ADR exists. Russia is
// intentionally omitted — most Russian ADRs were delisted/suspended from
// US markets after 2022 sanctions, so live quotes aren't reliably
// available; it stays on mock data.
const TICKERS_BY_COUNTRY: Record<string, TickerDef[]> = {
  DEU: [
    { symbol: "SAP", companyName: "SAP SE", currency: "USD" }, // NYSE ADR
    { symbol: "SIEGY", companyName: "Siemens AG", currency: "USD" }, // OTC ADR
    { symbol: "VWAGY", companyName: "Volkswagen AG", currency: "USD" }, // OTC ADR
  ],
  CHN: [
    { symbol: "BABA", companyName: "Alibaba Group", currency: "USD" },
    { symbol: "TCEHY", companyName: "Tencent Holdings", currency: "USD" },
    { symbol: "PDD", companyName: "PDD Holdings", currency: "USD" },
  ],
  NLD: [
    { symbol: "ASML", companyName: "ASML Holding", currency: "USD" },
    { symbol: "SHEL", companyName: "Shell plc", currency: "USD" },
    { symbol: "ING", companyName: "ING Group", currency: "USD" },
  ],
  TWN: [
    { symbol: "TSM", companyName: "Taiwan Semiconductor", currency: "USD" },
    { symbol: "UMC", companyName: "United Microelectronics", currency: "USD" },
    { symbol: "ASX", companyName: "ASE Technology Holding", currency: "USD" },
  ],
  GBR: [
    { symbol: "BP", companyName: "BP plc", currency: "USD" },
    { symbol: "HSBC", companyName: "HSBC Holdings", currency: "USD" },
    { symbol: "GSK", companyName: "GSK plc", currency: "USD" },
  ],
  JPN: [
    { symbol: "TM", companyName: "Toyota Motor Corp", currency: "USD" },
    { symbol: "SONY", companyName: "Sony Group Corp", currency: "USD" },
    { symbol: "MUFG", companyName: "Mitsubishi UFJ Financial", currency: "USD" },
  ],
  // South Korea (KOR) and India (IND) are intentionally omitted here.
  // Twelve Data's free tier only covers US-exchange data plus a small,
  // undocumented "trial" whitelist of international symbols — Samsung,
  // SK Hynix, Hyundai (KRX) and TCS, Reliance (NSE) aren't in that
  // whitelist and return 404. Rather than guess which symbols happen to
  // be trial-eligible, both countries fall back to mock data cleanly.
  // Infosys is the exception — it also trades as a NYSE ADR (INFY),
  // so it's included in the FRA-style US-ADR list below instead.
  FRA: [
    { symbol: "LVMUY", companyName: "LVMH", currency: "USD" }, // OTC ADR
    { symbol: "EADSY", companyName: "Airbus SE", currency: "USD" }, // OTC ADR
    { symbol: "TTE", companyName: "TotalEnergies", currency: "USD" }, // NYSE ADR
  ],
  BRA: [
    { symbol: "PBR", companyName: "Petrobras", currency: "USD" },
    { symbol: "VALE", companyName: "Vale S.A.", currency: "USD" },
    { symbol: "ITUB", companyName: "Itaú Unibanco", currency: "USD" },
  ],
};

async function fetchSingleQuote(def: TickerDef): Promise<Stock | null> {
  try {
    const params = new URLSearchParams({ symbol: def.symbol, apikey: TWELVE_DATA_API_KEY as string });
    if (def.exchange) params.set("exchange", def.exchange);

    const res = await fetch(`${TWELVE_DATA_URL}?${params.toString()}`);
    if (!res.ok) return null;

    const data = await res.json();
    if (data.status === "error" || data.code) return null; // Twelve Data returns { code, message } on failure

    const price = parseFloat(data.close);
    const changePercent = parseFloat(data.percent_change);
    if (isNaN(price) || isNaN(changePercent)) return null;

    return {
      ticker: def.symbol,
      companyName: def.companyName,
      countryIso: "", // filled in by caller
      price,
      currency: def.currency,
      changePercent,
    };
  } catch {
    return null;
  }
}

/**
 * Returns top 3 stocks per country for the given list of country ISO codes.
 * Falls back to mock data per-country if no proxy/key is configured, or
 * per-ticker if an individual live quote fails.
 */
export async function fetchTopStocksForCountries(countryIsoCodes: string[]): Promise<Stock[]> {
  if (countryIsoCodes.length === 0) {
    return DEFAULT_WATCHLIST;
  }

  if (STOCKS_PROXY_ENDPOINT) {
    const res = await fetch(`${STOCKS_PROXY_ENDPOINT}?countries=${countryIsoCodes.join(",")}`);
    if (!res.ok) {
      console.error("Failed to fetch stocks via proxy, falling back to mock", res.statusText);
      return countryIsoCodes.flatMap((iso) => MOCK_STOCKS[iso] ?? []);
    }
    const data = await res.json();
    return data.stocks as Stock[];
  }

  if (!TWELVE_DATA_API_KEY) {
    return countryIsoCodes.flatMap((iso) => MOCK_STOCKS[iso] ?? []);
  }

  const results = await Promise.all(
    countryIsoCodes.map(async (iso) => {
      const tickerDefs = TICKERS_BY_COUNTRY[iso];
      if (!tickerDefs) return MOCK_STOCKS[iso] ?? [];

      const quotes = await Promise.all(tickerDefs.map(fetchSingleQuote));
      return quotes.map((quote, i) =>
        quote ? { ...quote, countryIso: iso } : (MOCK_STOCKS[iso]?.[i] ?? null)
      );
    })
  );

  return results.flat().filter((s): s is Stock => s !== null);
}
