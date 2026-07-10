// Vercel serverless function — proxies Gemini so the API key stays on the
// server. Deployed at /api/gemini. Handles both the country-extraction
// call (body has `prompt`) and the chat call (body has `message`),
// since the frontend uses one proxy URL for both.
const GEMINI_MODEL = "gemini-2.5-flash";
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: "GEMINI_API_KEY not configured on the server" });
  }

  const { prompt, system, history, message } = req.body;

  try {
    let body;

    if (prompt) {
      // Country/topic extraction call.
      body = {
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        generationConfig: { responseMimeType: "application/json" },
      };
    } else if (message) {
      // Chat call.
      const contents = [
        ...(history ?? []).map((m) => ({
          role: m.role === "assistant" ? "model" : "user",
          parts: [{ text: m.content }],
        })),
        { role: "user", parts: [{ text: message }] },
      ];
      body = { contents };
      if (system) body.system_instruction = { parts: [{ text: system }] };
    } else {
      return res.status(400).json({ error: "Request must include either `prompt` or `message`" });
    }

    const response = await fetch(GEMINI_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": apiKey,
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json(data);
    }

    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (typeof text !== "string") {
      return res.status(502).json({ error: "Unexpected Gemini response shape" });
    }

    return res.status(200).json({ text });
  } catch (err) {
    return res.status(500).json({ error: "Failed to reach Gemini", details: String(err) });
  }
}
