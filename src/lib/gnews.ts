import type { Article } from "../types";
import { MOCK_ARTICLES } from "../data/mockData";

// GNews supports CORS from all origins, so this is called directly from
// the browser — no proxy needed for a personal project. If you later
// stand up a serverless proxy for production hardening, set
// VITE_NEWS_PROXY_URL and it takes priority over the direct key below.
const GNEWS_PROXY_ENDPOINT = import.meta.env.VITE_NEWS_PROXY_URL as string | undefined;
const GNEWS_API_KEY = import.meta.env.VITE_GNEWS_API_KEY as string | undefined;
const GNEWS_DIRECT_URL = "https://gnews.io/api/v4/search";

// GNews's free tier is 100 requests/day. Two things can burn through that
// fast during development: React StrictMode intentionally double-invokes
// effects in dev mode, and every browser refresh re-triggers the fetch.
// This cache makes repeated calls within the window reuse the same
// result instead of hitting the API again, both across StrictMode's
// double-fire and across page reloads (via sessionStorage).
const CACHE_KEY = "gnews_cache_v1";
const CACHE_TTL_MS = 10 * 60 * 1000; // 10 minutes

function readCache(): { articles: Article[]; fetchedAt: number } | null {
  try {
    const raw = sessionStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (Date.now() - parsed.fetchedAt > CACHE_TTL_MS) return null;
    return parsed;
  } catch {
    return null;
  }
}

function writeCache(articles: Article[]) {
  try {
    sessionStorage.setItem(CACHE_KEY, JSON.stringify({ articles, fetchedAt: Date.now() }));
  } catch {
    // sessionStorage unavailable (e.g. private browsing) — safe to ignore,
    // it just means no caching this session.
  }
}

// Tracks an in-flight request so StrictMode's double-invoke (or two
// components calling this at once) share one network call instead of
// firing two.
let inFlightRequest: Promise<Article[]> | null = null;

export async function fetchArticles(query = "geopolitics OR economy OR trade"): Promise<Article[]> {
  const cached = readCache();
  if (cached) return cached.articles;

  if (inFlightRequest) return inFlightRequest;

  inFlightRequest = fetchArticlesUncached(query).finally(() => {
    inFlightRequest = null;
  });
  return inFlightRequest;
}

async function fetchArticlesUncached(query: string): Promise<Article[]> {
  if (GNEWS_PROXY_ENDPOINT) {
    const res = await fetch(`${GNEWS_PROXY_ENDPOINT}?q=${encodeURIComponent(query)}`);
    if (!res.ok) {
      console.error("Failed to fetch news via proxy, falling back to mock data", res.statusText);
      return MOCK_ARTICLES;
    }
    const data = await res.json();
    const mapped = mapGNewsArticles(data.articles);
    writeCache(mapped);
    return mapped;
  }

  if (GNEWS_API_KEY) {
    try {
      const url = `${GNEWS_DIRECT_URL}?q=${encodeURIComponent(query)}&lang=en&max=10&token=${GNEWS_API_KEY}`;
      const res = await fetch(url);
      if (!res.ok) {
        const body = await res.text().catch(() => res.statusText);
        throw new Error(`GNews API error (${res.status}): ${body}`);
      }
      const data = await res.json();
      const mapped = mapGNewsArticles(data.articles);
      const result = mapped.length > 0 ? mapped : MOCK_ARTICLES;
      if (mapped.length > 0) writeCache(result);
      return result;
    } catch (err) {
      console.error("GNews fetch failed, falling back to mock data", err);
      return MOCK_ARTICLES;
    }
  }

  // No API key or proxy configured — use mock data.
  return new Promise((resolve) => setTimeout(() => resolve(MOCK_ARTICLES), 400));
}

function mapGNewsArticles(articles: any[]): Article[] {
  return (articles ?? []).map(
    (a: any, i: number): Article => ({
      id: `gnews-${i}-${a.publishedAt ?? Date.now()}`,
      source: a.source?.name ?? "Unknown",
      publishedAt: a.publishedAt,
      headline: a.title,
      excerpt: a.description ?? "",
      content: a.content ?? a.description ?? "",
      imageUrl: a.image,
      countries: [], // populated later via Gemini extraction
      tags: [],
    })
  );
}
