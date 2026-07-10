import type { Article, CountryMention, ChatMessage } from "../types";
import { COUNTRY_LOOKUP } from "../data/mockData";

// Three ways this can run, checked in order:
//  1. VITE_GEMINI_PROXY_URL set -> call your own serverless proxy (production-safe)
//  2. VITE_GEMINI_API_KEY set -> call Gemini directly from the browser (fine for a
//     personal project running locally; NOT safe for a publicly deployed site,
//     since the key would be visible to anyone who opens dev tools)
//  3. Neither set -> mock/demo responses
const GEMINI_PROXY_ENDPOINT = import.meta.env.VITE_GEMINI_PROXY_URL as string | undefined;
const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY as string | undefined;
const GEMINI_MODEL = "gemini-2.5-flash";
const GEMINI_DIRECT_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;

async function callGeminiDirect(opts: {
  systemInstruction?: string;
  contents: { role: "user" | "model"; parts: { text: string }[] }[];
  jsonResponse?: boolean;
}): Promise<string> {
  const body: Record<string, unknown> = {
    contents: opts.contents,
  };
  if (opts.systemInstruction) {
    body.system_instruction = { parts: [{ text: opts.systemInstruction }] };
  }
  if (opts.jsonResponse) {
    body.generationConfig = { responseMimeType: "application/json" };
  }

  const res = await fetch(GEMINI_DIRECT_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-goog-api-key": GEMINI_API_KEY as string,
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const errText = await res.text().catch(() => res.statusText);
    throw new Error(`Gemini API error (${res.status}): ${errText}`);
  }

  const data = await res.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (typeof text !== "string") {
    throw new Error("Gemini API returned an unexpected response shape");
  }
  return text;
}

/**
 * Gemini's free tier caps gemini-2.5-flash at just 20 requests/day total
 * (shared between extraction and chat), so this caches extraction
 * results per article — re-selecting an article you've already viewed
 * this session costs nothing instead of burning another request.
 */
const EXTRACTION_CACHE_KEY = "gemini_extraction_cache_v1";

function readExtractionCache(articleId: string): { countries: CountryMention[]; topic: string } | null {
  try {
    const raw = sessionStorage.getItem(EXTRACTION_CACHE_KEY);
    if (!raw) return null;
    const cache = JSON.parse(raw);
    return cache[articleId] ?? null;
  } catch {
    return null;
  }
}

function writeExtractionCache(articleId: string, result: { countries: CountryMention[]; topic: string }) {
  try {
    const raw = sessionStorage.getItem(EXTRACTION_CACHE_KEY);
    const cache = raw ? JSON.parse(raw) : {};
    cache[articleId] = result;
    sessionStorage.setItem(EXTRACTION_CACHE_KEY, JSON.stringify(cache));
  } catch {
    // sessionStorage unavailable — safe to ignore, just no caching this session.
  }
}

/**
 * Extracts mentioned countries + a primary topic from an article using
 * Gemini Flash. Falls back to the article's pre-set `countries` field
 * (used in mock mode) if no proxy or API key is configured.
 */
export async function extractArticleContext(
  article: Article
): Promise<{ countries: CountryMention[]; topic: string }> {
  const fallback = { countries: article.countries, topic: article.tags[0] ?? "General" };

  if (!GEMINI_PROXY_ENDPOINT && !GEMINI_API_KEY) {
    return fallback;
  }

  const cached = readExtractionCache(article.id);
  if (cached) return cached;

  const prompt = `Read this news article and return ONLY valid JSON, no markdown fences, no preamble:
{
  "countryIsoCodes": string[],  // ISO 3166-1 alpha-3 codes of countries meaningfully discussed
  "topic": string  // one short primary topic label, e.g. "Trade Policy"
}

Article headline: ${article.headline}
Article body: ${article.content}`;

  try {
    let rawText: string;

    if (GEMINI_PROXY_ENDPOINT) {
      const res = await fetch(GEMINI_PROXY_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });
      if (!res.ok) throw new Error(res.statusText);
      const data = await res.json();
      rawText = data.text;
    } else {
      rawText = await callGeminiDirect({
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        jsonResponse: true,
      });
    }

    const parsed = JSON.parse(rawText);
    const countries: CountryMention[] = (parsed.countryIsoCodes ?? [])
      .map((iso: string) => COUNTRY_LOOKUP[iso])
      .filter(Boolean);

    const result = { countries, topic: parsed.topic ?? "General" };
    writeExtractionCache(article.id, result);
    return result;
  } catch (err) {
    console.error("Gemini extraction failed, falling back to article defaults", err);
    return fallback;
  }
}

/**
 * Sends a chat message + article context + history to Gemini Flash and
 * returns the assistant's reply. Falls back to a canned response in
 * mock mode.
 */
export async function sendChatMessage(
  article: Article | null,
  history: ChatMessage[],
  userMessage: string
): Promise<string> {
  if (!GEMINI_PROXY_ENDPOINT && !GEMINI_API_KEY) {
    await new Promise((r) => setTimeout(r, 600));
    return article
      ? `(Mock response — add a Gemini API key to .env for real answers) Based on "${article.headline}", here's some context on your question: ${userMessage}`
      : `(Mock response) Select an article first so I have context to work with.`;
  }

  const systemContext = article
    ? `You are a geopolitical/economic analyst assistant embedded in a news dashboard. The user currently has this article open:\nHeadline: ${article.headline}\nBody: ${article.content}\nAnswer questions about it conversationally, and give broader geopolitical/economic context where relevant. Keep responses concise (2-4 short paragraphs max).`
    : `You are a geopolitical/economic analyst assistant. No article is currently selected — let the user know you can help once they pick one, but still answer general questions if asked.`;

  try {
    if (GEMINI_PROXY_ENDPOINT) {
      const res = await fetch(GEMINI_PROXY_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          system: systemContext,
          history: history.map((m) => ({ role: m.role, content: m.content })),
          message: userMessage,
        }),
      });
      if (!res.ok) throw new Error(res.statusText);
      const data = await res.json();
      return data.text as string;
    }

    // Direct mode: build Gemini's expected contents array from chat history.
    const contents = [
      ...history
        .filter((m) => !m.pending)
        .map((m) => ({
          role: (m.role === "assistant" ? "model" : "user") as "user" | "model",
          parts: [{ text: m.content }],
        })),
      { role: "user" as const, parts: [{ text: userMessage }] },
    ];

    return await callGeminiDirect({ systemInstruction: systemContext, contents });
  } catch (err) {
    console.error("Gemini chat failed", err);
    const message = err instanceof Error ? err.message : "";
    if (message.includes("429") || message.includes("RESOURCE_EXHAUSTED")) {
      return "You've hit Gemini's free-tier daily limit (20 requests/day, shared between chat and country-detection). It resets in a few hours — mock responses will work in the meantime.";
    }
    return "Sorry, I couldn't reach the analyst assistant right now — check your API key / network and try again.";
  }
}
