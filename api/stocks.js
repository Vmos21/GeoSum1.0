// Vercel serverless function — proxies Twelve Data so the API key stays
// on the server. Deployed at /api/stocks.
//
// NOTE: this ticker map is a duplicate of TICKERS_BY_COUNTRY in
// src/lib/stocksApi.ts (kept separate since Vercel functions here run as
// plain JS, not the frontend's TypeScript). If you change tickers in one
// place, update the other to match.
const TICKERS_BY_COUNTRY = {
  DEU: [
    { symbol: "SAP", companyName: "SAP SE", currency: "USD" },
    { symbol: "SIEGY", companyName: "Siemens AG", currency: "USD" },
    { symbol: "VWAGY", companyName: "Volkswagen AG", currency: "USD" },
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
  FRA: [
    { symbol: "LVMUY", companyName: "LVMH", currency: "USD" },
    { symbol: "EADSY", companyName: "Airbus SE", currency: "USD" },
    { symbol: "TTE", companyName: "TotalEnergies", currency: "USD" },
  ],
  BRA: [
    { symbol: "PBR", companyName: "Petrobras", currency: "USD" },
    { symbol: "VALE", companyName: "Vale S.A.", currency: "USD" },
    { symbol: "ITUB", companyName: "Itaú Unibanco", currency: "USD" },
  ],
};

async function fetchQuote(def, apiKey) {
  try {
    const params = new URLSearchParams({ symbol: def.symbol, apikey: apiKey });
    const res = await fetch(`https://api.twelvedata.com/quote?${params.toString()}`);
    if (!res.ok) return null;

    const data = await res.json();
    if (data.status === "error" || data.code) return null;

    const price = parseFloat(data.close);
    const changePercent = parseFloat(data.percent_change);
    if (isNaN(price) || isNaN(changePercent)) return null;

    return {
      ticker: def.symbol,
      companyName: def.companyName,
      price,
      currency: def.currency,
      changePercent,
    };
  } catch {
    return null;
  }
}

export default async function handler(req, res) {
  const apiKey = process.env.TWELVE_DATA_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: "TWELVE_DATA_API_KEY not configured on the server" });
  }

  const countriesParam = req.query.countries || "";
  const countryIsoCodes = countriesParam.split(",").filter(Boolean);

  if (countryIsoCodes.length === 0) {
    return res.status(200).json({ stocks: [] });
  }

  try {
    const results = await Promise.all(
      countryIsoCodes.map(async (iso) => {
        const tickerDefs = TICKERS_BY_COUNTRY[iso];
        if (!tickerDefs) return [];

        const quotes = await Promise.all(tickerDefs.map((def) => fetchQuote(def, apiKey)));
        return quotes
          .filter((q) => q !== null)
          .map((q) => ({ ...q, countryIso: iso }));
      })
    );

    res.setHeader("Cache-Control", "s-maxage=300, stale-while-revalidate=60");
    return res.status(200).json({ stocks: results.flat() });
  } catch (err) {
    return res.status(500).json({ error: "Failed to reach Twelve Data", details: String(err) });
  }
}
