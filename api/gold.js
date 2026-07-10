// Vercel serverless function — proxies gold-api.com + frankfurter.dev.
// Deployed at /api/gold. Neither upstream API needs a key, so this
// mainly exists for caching + a stable same-origin URL, but keeping it
// consistent with the other proxies makes the architecture uniform.
export default async function handler(req, res) {
  const currency = req.query.currency || "USD";

  try {
    const goldRes = await fetch("https://api.gold-api.com/price/XAU");
    const goldData = await goldRes.json();
    const usdPrice = goldData.price;

    if (typeof usdPrice !== "number") {
      return res.status(502).json({ error: "Unexpected gold-api.com response shape" });
    }

    let pricePerOz = usdPrice;

    if (currency !== "USD") {
      const fxRes = await fetch(
        `https://api.frankfurter.dev/v1/latest?base=USD&symbols=${currency}`
      );
      const fxData = await fxRes.json();
      const rate = fxData.rates?.[currency];

      if (typeof rate !== "number") {
        return res.status(502).json({ error: `No FX rate available for ${currency}` });
      }

      pricePerOz = usdPrice * rate;
    }

    res.setHeader("Cache-Control", "s-maxage=30, stale-while-revalidate=15");
    return res.status(200).json({ pricePerOz });
  } catch (err) {
    return res.status(500).json({ error: "Failed to reach gold/FX APIs", details: String(err) });
  }
}
