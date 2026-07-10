import type { Stock } from "../types";

const CURRENCY_SYMBOLS: Record<string, string> = {
  USD: "$",
  EUR: "€",
  GBP: "£",
  CNY: "¥",
  TWD: "NT$",
};

interface EquityWatchlistProps {
  stocks: Stock[];
}

export default function EquityWatchlist({ stocks }: EquityWatchlistProps) {
  return (
    <section className="mt-section-gap">
      <h2 className="font-label-caps text-on-surface-variant mb-4 flex items-center gap-2 uppercase tracking-widest text-[12px]">
        <span className="material-symbols-outlined text-[18px]">monitoring</span> GLOBAL EQUITY
        WATCHLIST
      </h2>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {stocks.length === 0 && (
          <div className="col-span-full text-on-surface-variant font-body-md py-8 text-center">
            Select an article to see related equities.
          </div>
        )}
        {stocks.map((stock) => {
          const isPositive = stock.changePercent >= 0;
          const symbol = CURRENCY_SYMBOLS[stock.currency] ?? stock.currency + " ";
          return (
            <div
              key={stock.ticker}
              className="bg-surface-card p-4 rounded-lg border border-outline-variant/30 hover:border-primary/50 transition-colors cursor-pointer group"
            >
              <div className="flex justify-between items-center mb-2">
                <span className="font-ticker-data text-on-surface">{stock.ticker}</span>
                <span className="text-[10px] font-label-caps text-on-surface-variant uppercase">
                  {stock.countryIso}
                </span>
              </div>
              <div className="flex justify-between items-end mt-4">
                <span className="font-ticker-data text-xl text-on-surface">
                  {symbol}
                  {stock.price.toFixed(2)}
                </span>
                <span
                  className={`px-2 py-0.5 rounded font-ticker-data text-[12px] ${
                    isPositive
                      ? "bg-indicator-positive/10 text-indicator-positive"
                      : "bg-indicator-negative/10 text-indicator-negative"
                  }`}
                >
                  {isPositive ? "+" : ""}
                  {stock.changePercent.toFixed(2)}%
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
