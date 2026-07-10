interface GoldTickerProps {
  prices: Record<string, number>; // currency code -> price per oz
  currencies: string[]; // ordered list of currencies to display (USD first, then mentioned countries)
}

export default function GoldTicker({ prices, currencies }: GoldTickerProps) {
  return (
    <div className="flex items-center gap-2 bg-surface-container-low px-3 py-2 rounded-lg border border-outline-variant overflow-x-auto no-scrollbar">
      <span className="font-label-caps text-gold-ticker flex-shrink-0 pr-1">XAU</span>
      {currencies.map((currency, i) => {
        const price = prices[currency];
        return (
          <div key={currency} className="flex items-center gap-2 flex-shrink-0">
            {i > 0 && <div className="h-4 w-px bg-outline-variant"></div>}
            <span className="font-label-caps text-on-surface-variant">{currency}</span>
            <span className="font-ticker-data text-on-surface">
              {price !== undefined
                ? price.toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })
                : "—"}
            </span>
          </div>
        );
      })}
    </div>
  );
}
