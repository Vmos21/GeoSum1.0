import { useEffect, useRef, useState } from "react";
import { Panel, PanelGroup, type ImperativePanelHandle } from "react-resizable-panels";
import type { Article, Stock } from "./types";
import { fetchArticles } from "./lib/gnews";
import { extractArticleContext } from "./lib/gemini";
import { fetchGoldPrices } from "./lib/goldApi";
import { fetchTopStocksForCountries } from "./lib/stocksApi";
import { DEFAULT_WATCHLIST } from "./data/mockData";

import WorldMap from "./components/WorldMap";
import NewsFeed from "./components/NewsFeed";
import GoldTicker from "./components/GoldTicker";
import EquityWatchlist from "./components/EquityWatchlist";
import ChatPanel from "./components/ChatPanel";
import ResizeHandle from "./components/ResizeHandle";

// Polling intervals, tuned to each API's free-tier limits so we never
// run over quota even if the app is left open all day.
const NEWS_POLL_MS = 15 * 60 * 1000; // GNews free tier: 100 req/day -> max ~96/day at this rate
const GOLD_POLL_MS = 60 * 1000; // gold-api.com has no rate limit, so poll often
const STOCKS_POLL_MS = 20 * 60 * 1000; // Twelve Data free tier: 800 req/day

function App() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  const [goldPrices, setGoldPrices] = useState<Record<string, number>>({});
  const [stocks, setStocks] = useState<Stock[]>(DEFAULT_WATCHLIST);
  const [loading, setLoading] = useState(true);
  const [chatCollapsed, setChatCollapsed] = useState(false);
  const [lastNewsUpdate, setLastNewsUpdate] = useState<Date | null>(null);
  const [isExtractingContext, setIsExtractingContext] = useState(false);

  const chatPanelRef = useRef<ImperativePanelHandle>(null);

  // USD is always shown; add every mentioned country's currency alongside it.
  const goldCurrencies = Array.from(
    new Set(["USD", ...(selectedArticle?.countries.map((c) => c.currency) ?? [])])
  );

  function toggleChatCollapse() {
    const panel = chatPanelRef.current;
    if (!panel) return;
    if (panel.isCollapsed()) {
      panel.expand();
    } else {
      panel.collapse();
    }
  }

  useEffect(() => {
    let cancelled = false;

    function loadArticles() {
      fetchArticles()
        .then((fetched) => {
          if (cancelled) return;
          setArticles(fetched);
          setLastNewsUpdate(new Date());
        })
        .finally(() => {
          if (!cancelled) setLoading(false);
        });
    }

    loadArticles();
    const interval = setInterval(loadArticles, NEWS_POLL_MS);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, []);

  useEffect(() => {
    if (!selectedArticle) {
      setStocks(DEFAULT_WATCHLIST);
      return;
    }

    let cancelled = false;
    let pollInterval: ReturnType<typeof setInterval> | undefined;

    async function loadArticleContext(article: Article) {
      setIsExtractingContext(true);
      const { countries } = await extractArticleContext(article);
      if (cancelled) return;
      setIsExtractingContext(false);

      setSelectedArticle((prev) => (prev && prev.id === article.id ? { ...prev, countries } : prev));

      async function refreshStocks() {
        const relatedStocks = await fetchTopStocksForCountries(countries.map((c) => c.iso));
        if (!cancelled) setStocks(relatedStocks);
      }

      await refreshStocks();
      pollInterval = setInterval(refreshStocks, STOCKS_POLL_MS);
    }

    loadArticleContext(selectedArticle);
    return () => {
      cancelled = true;
      if (pollInterval) clearInterval(pollInterval);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedArticle?.id]);

  useEffect(() => {
    let cancelled = false;

    function loadGoldPrices() {
      fetchGoldPrices(goldCurrencies).then((prices) => {
        if (!cancelled) setGoldPrices(prices);
      });
    }

    loadGoldPrices();
    const interval = setInterval(loadGoldPrices, GOLD_POLL_MS);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [goldCurrencies.join(",")]);

  return (
    <div className="bg-surface-container-lowest text-on-surface h-full flex flex-col overflow-hidden">
      {/* Top ticker bar - fixed, not resizable */}
      <div className="px-container-margin py-4 flex justify-between items-center border-b border-outline-variant/30 flex-shrink-0 z-30">
        <GoldTicker prices={goldPrices} currencies={goldCurrencies} />
        <div className="flex gap-4">
          <div className="flex items-center gap-2 font-label-caps text-[10px] text-on-surface-variant">
            <span className="w-1.5 h-1.5 rounded-full bg-indicator-positive"></span> SYSTEM NOMINAL
          </div>
          <div className="flex items-center gap-2 font-label-caps text-[10px] text-on-surface-variant">
            <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></span>
            {lastNewsUpdate
              ? `LIVE SYNC · ${lastNewsUpdate.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`
              : "LIVE SYNC"}
          </div>
        </div>
      </div>

      {/* Resizable workspace: map | news (top), chat (bottom) */}
      <PanelGroup direction="vertical" className="flex-1 min-h-0 px-container-margin py-3">
        <Panel defaultSize={70} minSize={35}>
          <div className="h-full flex flex-col overflow-y-auto pr-1">
            <PanelGroup direction="horizontal" className="min-h-[380px]">
              <Panel defaultSize={60} minSize={30}>
                <WorldMap highlightedCountries={selectedArticle?.countries ?? []} isLoading={isExtractingContext} />
              </Panel>
              <ResizeHandle direction="horizontal" />
              <Panel defaultSize={40} minSize={22}>
                <NewsFeed
                  articles={articles}
                  selectedId={selectedArticle?.id ?? null}
                  onSelect={setSelectedArticle}
                />
              </Panel>
            </PanelGroup>

            {loading && (
              <div className="text-on-surface-variant font-body-md text-center py-8">
                Loading intelligence feed...
              </div>
            )}

            <EquityWatchlist stocks={stocks} />
          </div>
        </Panel>

        <ResizeHandle direction="vertical" />

        <Panel
          ref={chatPanelRef}
          defaultSize={30}
          minSize={18}
          collapsible
          collapsedSize={6}
          onCollapse={() => setChatCollapsed(true)}
          onExpand={() => setChatCollapsed(false)}
        >
          <ChatPanel
            article={selectedArticle}
            collapsed={chatCollapsed}
            onToggleCollapse={toggleChatCollapse}
          />
        </Panel>
      </PanelGroup>
    </div>
  );
}

export default App;
