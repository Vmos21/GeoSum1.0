import { MOCK_GOLD_PRICE_USD, MOCK_FX_RATES } from "../data/mockData";

// gold-api.com: free, no key, no rate limit, CORS-enabled — called directly.
const GOLD_PROXY_ENDPOINT = import.meta.env.VITE_GOLD_PROXY_URL as string | undefined;
const GOLD_API_URL = "https://api.gold-api.com/price/XAU";

// frankfurter.dev: free, no key, CORS-enabled ECB exchange rates — used to
// convert the USD gold price into other currencies. Note: the older
// frankfurter.app domain has stopped serving CORS headers, so we use the
// current .dev domain instead.
const FX_API_URL = "https://api.frankfurter.dev/v1/latest";

async function fetchGoldPriceUsd(): Promise<number> {
  const res = await fetch(GOLD_API_URL);
  if (!res.ok) throw new Error(`gold-api.com error: ${res.statusText}`);
  const data = await res.json();
  const price = data.price;
  if (typeof price !== "number") throw new Error("Unexpected gold-api.com response shape");
  return price;
}

async function fetchFxRates(currencies: string[]): Promise<Record<string, number>> {
  const targets = currencies.filter((c) => c !== "USD");
  if (targets.length === 0) return {};

  const res = await fetch(`${FX_API_URL}?base=USD&symbols=${targets.join(",")}`);
  if (!res.ok) throw new Error(`frankfurter.dev error: ${res.statusText}`);
  const data = await res.json();
  return data.rates as Record<string, number>;
}

/**
 * Returns the current gold price per troy ounce in the requested currency.
 * Falls back to static mock FX rates if the live APIs are unreachable.
 */
export async function fetchGoldPrice(currency = "USD"): Promise<number> {
  if (GOLD_PROXY_ENDPOINT) {
    const res = await fetch(`${GOLD_PROXY_ENDPOINT}?currency=${currency}`);
    if (!res.ok) {
      console.error("Failed to fetch gold price via proxy, falling back to mock", res.statusText);
      return MOCK_GOLD_PRICE_USD * (MOCK_FX_RATES[currency] ?? 1);
    }
    const data = await res.json();
    return data.pricePerOz as number;
  }

  try {
    const usdPrice = await fetchGoldPriceUsd();
    if (currency === "USD") return usdPrice;

    const rates = await fetchFxRates([currency]);
    const rate = rates[currency];
    if (typeof rate !== "number") throw new Error(`No FX rate returned for ${currency}`);
    return usdPrice * rate;
  } catch (err) {
    console.error("Live gold price fetch failed, falling back to mock", err);
    return MOCK_GOLD_PRICE_USD * (MOCK_FX_RATES[currency] ?? 1);
  }
}

/**
 * Fetches gold price for multiple currencies at once, so the UI can show
 * all of them simultaneously (e.g. USD + every mentioned country's
 * currency) instead of a single toggled value. Makes just one call to
 * gold-api.com and one to the FX API, rather than one round-trip per
 * currency.
 */
export async function fetchGoldPrices(currencies: string[]): Promise<Record<string, number>> {
  const uniqueCurrencies = Array.from(new Set(currencies));

  if (GOLD_PROXY_ENDPOINT) {
    const prices = await Promise.all(uniqueCurrencies.map((c) => fetchGoldPrice(c)));
    const result: Record<string, number> = {};
    uniqueCurrencies.forEach((c, i) => (result[c] = prices[i]));
    return result;
  }

  try {
    const usdPrice = await fetchGoldPriceUsd();
    const nonUsd = uniqueCurrencies.filter((c) => c !== "USD");
    const rates = nonUsd.length > 0 ? await fetchFxRates(nonUsd) : {};

    const result: Record<string, number> = {};
    for (const currency of uniqueCurrencies) {
      if (currency === "USD") {
        result[currency] = usdPrice;
      } else if (typeof rates[currency] === "number") {
        result[currency] = usdPrice * rates[currency];
      } else {
        // FX API didn't return this currency — fall back to mock rate for
        // just this one, rather than failing the whole batch.
        result[currency] = MOCK_GOLD_PRICE_USD * (MOCK_FX_RATES[currency] ?? 1);
      }
    }
    return result;
  } catch (err) {
    console.error("Live gold price batch fetch failed, falling back to mock", err);
    const result: Record<string, number> = {};
    uniqueCurrencies.forEach((c) => {
      result[c] = MOCK_GOLD_PRICE_USD * (MOCK_FX_RATES[c] ?? 1);
    });
    return result;
  }
}
