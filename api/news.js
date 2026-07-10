// Vercel serverless function — proxies GNews so the API key stays on the
// server. Deployed at /api/news. Reads GNEWS_API_KEY from Vercel's
// environment variables (set WITHOUT the VITE_ prefix so it never gets
// bundled into client-side code).
export default async function handler(req, res) {
  const apiKey = process.env.GNEWS_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: "GNEWS_API_KEY not configured on the server" });
  }

  const query = req.query.q || "geopolitics OR economy OR trade";

  try {
    const url = `https://gnews.io/api/v4/search?q=${encodeURIComponent(
      query
    )}&lang=en&max=10&token=${apiKey}`;
    const response = await fetch(url);
    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json(data);
    }

    // Cache at the edge for 10 minutes to save quota across visitors.
    res.setHeader("Cache-Control", "s-maxage=600, stale-while-revalidate=60");
    return res.status(200).json(data);
  } catch (err) {
    return res.status(500).json({ error: "Failed to reach GNews", details: String(err) });
  }
}
