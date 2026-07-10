# Geopolitics Summarizer

A web platform that turns geopolitical and economic news into a visual, explorable experience — an interactive world map, live gold/equity data, and an AI analyst you can chat with about any article.

## Status

Runs fully in **mock/demo mode** out of the box — no API keys needed to see it working. Real data sources (GNews, Gemini Flash, gold price, stocks) plug in via serverless proxy URLs in `.env`.

## Quick start

```bash
npm install
npm run dev
```

Open the printed `http://localhost:5173/` URL. You'll see mock articles, a highlighted world map, a gold ticker, and a working (mocked) AI chat.

## Going live with real data

Runs fully live once you add a couple of free API keys — no servers to stand up, no credit cards needed.

**1. Gemini (AI chat + country detection)**
- Get a free key: [aistudio.google.com/apikey](https://aistudio.google.com/apikey)
- Paste into `VITE_GEMINI_API_KEY` in `.env`
- ⚠️ **Free tier is just 20 requests/day total** for `gemini-2.5-flash`, shared between chat messages and article country-detection. This runs out fast — the app caches each article's country-detection result for the session (re-selecting an article you've viewed is free), but chat messages always count. If you see a "quota exceeded" message, it resets in a few hours; mock responses take over automatically in the meantime.

**2. GNews (live news articles, polled every 15 min)**
- Get a free key: [gnews.io/register](https://gnews.io/register) — 100 requests/day
- Paste into `VITE_GNEWS_API_KEY` in `.env`

**3. Twelve Data (live stock quotes, polled every 20 min)**
- Get a free key: [twelvedata.com](https://twelvedata.com/) — 800 requests/day
- Paste into `VITE_TWELVE_DATA_API_KEY` in `.env`

**Gold price** needs no key at all — it uses [gold-api.com](https://gold-api.com) (free, unlimited, CORS-enabled) for the USD price and [frankfurter.app](https://frankfurter.app) (free, no key) to convert into other currencies. It polls every 60 seconds.

Copy `.env.example` to `.env`, drop in whichever keys you have, and restart `npm run dev`. Each data source works independently — set one, two, or all three; anything left blank keeps using mock data for that feature.

**Important:** all of the above call their APIs directly from the browser using your key. That's completely fine for local development or personal use, but if you deploy this publicly (GitHub Pages, Vercel, etc.), anyone can read your keys from dev tools. For a public deployment, swap to the serverless proxy pattern below instead.

## Deploying publicly (Vercel — keeps your API keys hidden)

The `api/` folder in this project contains ready-to-go serverless proxy functions (`api/news.js`, `api/gemini.js`, `api/gold.js`, `api/stocks.js`). Deploying to Vercel automatically turns these into a real backend — your API keys stay server-side, never visible to anyone visiting the site.

**1. Push this repo to GitHub** (if you haven't already).

**2. Import it on Vercel**
- Go to [vercel.com/new](https://vercel.com/new)
- Select your GitHub repo
- Vercel auto-detects Vite — leave the build settings as default and click Deploy

**3. Add environment variables** (Vercel dashboard → your project → Settings → Environment Variables)

Server-side keys (no `VITE_` prefix — these stay hidden, only your serverless functions can read them):
| Name | Value |
|---|---|
| `GNEWS_API_KEY` | your GNews key |
| `GEMINI_API_KEY` | your Gemini key |
| `TWELVE_DATA_API_KEY` | your Twelve Data key |

Frontend proxy URLs (these ARE safe to expose — they're just relative paths, not secrets):
| Name | Value |
|---|---|
| `VITE_NEWS_PROXY_URL` | `/api/news` |
| `VITE_GEMINI_PROXY_URL` | `/api/gemini` |
| `VITE_GOLD_PROXY_URL` | `/api/gold` |
| `VITE_STOCKS_PROXY_URL` | `/api/stocks` |

**4. Redeploy** (Vercel dashboard → Deployments → ⋯ → Redeploy) so the new environment variables take effect.

**5. Visit your live URL** — Vercel gives you one automatically (like `your-project.vercel.app`). Open it, select an article, and everything should work exactly like local dev, except now backed by hidden server-side keys instead of ones sitting in the browser.

Your local `.env` (with direct `VITE_..._API_KEY` values) keeps working for `npm run dev` — the two setups don't conflict. Direct keys are for local development; proxy URLs are for the public deployment.

### Polling intervals (tuned to stay within free-tier limits)
| Data | Interval | Why |
|---|---|---|
| News | 15 min | GNews free tier caps at 100 req/day |
| Stocks | 20 min | Twelve Data free tier caps at 800 req/day |
| Gold price | 60 sec | No rate limit on gold-api.com |
| Gemini | — | No polling — only fires on article select / chat message. Free tier caps at 20 req/day total, shared between both. |

## Project structure

```
src/
├── components/       # WorldMap, NewsFeed, GoldTicker, EquityWatchlist, ChatPanel
├── lib/              # API clients (gnews, gemini, goldApi, stocksApi) — mock-fallback pattern
├── data/             # Mock data used when no proxy is configured
├── types/            # Shared TypeScript types
├── App.tsx           # Wires everything together, holds top-level state
└── main.tsx
```

## Tech stack

- React + Vite + TypeScript
- Tailwind CSS (v3, config-based) — colors/tokens match the original Stitch design
- react-simple-maps — world map + country highlighting + capital markers
- Gemini Flash — country/topic extraction from articles + chat assistant

## Deploying

See `PROJECT_SPEC.md` for the original design brief, and ask for a walkthrough of GitHub Pages deployment (needs the `base` path set in `vite.config.ts` to match your repo name) or Vercel/Netlify (simpler — no `base` config needed).
