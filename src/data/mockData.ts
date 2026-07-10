import type { Article, Stock, CountryMention } from "../types";

// Reference country data used both for mock mode and as a lookup table
// once the Gemini extraction step returns ISO codes.
export const COUNTRY_LOOKUP: Record<string, CountryMention> = {
  DEU: { iso: "DEU", name: "Germany", capital: "Berlin", capitalCoords: [13.405, 52.52], currency: "EUR" },
  CHN: { iso: "CHN", name: "China", capital: "Beijing", capitalCoords: [116.4074, 39.9042], currency: "CNY" },
  USA: { iso: "USA", name: "United States", capital: "Washington, D.C.", capitalCoords: [-77.0369, 38.9072], currency: "USD" },
  NLD: { iso: "NLD", name: "Netherlands", capital: "Amsterdam", capitalCoords: [4.9041, 52.3676], currency: "EUR" },
  TWN: { iso: "TWN", name: "Taiwan", capital: "Taipei", capitalCoords: [121.5654, 25.033], currency: "TWD" },
  GBR: { iso: "GBR", name: "United Kingdom", capital: "London", capitalCoords: [-0.1276, 51.5072], currency: "GBP" },
  JPN: { iso: "JPN", name: "Japan", capital: "Tokyo", capitalCoords: [139.6917, 35.6895], currency: "JPY" },
  IND: { iso: "IND", name: "India", capital: "New Delhi", capitalCoords: [77.209, 28.6139], currency: "INR" },
  FRA: { iso: "FRA", name: "France", capital: "Paris", capitalCoords: [2.3522, 48.8566], currency: "EUR" },
  KOR: { iso: "KOR", name: "South Korea", capital: "Seoul", capitalCoords: [126.978, 37.5665], currency: "KRW" },
  BRA: { iso: "BRA", name: "Brazil", capital: "Brasília", capitalCoords: [-47.8825, -15.7942], currency: "BRL" },
  RUS: { iso: "RUS", name: "Russia", capital: "Moscow", capitalCoords: [37.6173, 55.7558], currency: "RUB" },
};

export const MOCK_ARTICLES: Article[] = [
  {
    id: "1",
    source: "Reuters",
    publishedAt: new Date(Date.now() - 12 * 60 * 1000).toISOString(),
    headline: "EU-Asia Trade Pact: Strategic Realignment Underway",
    excerpt: "Brussels and Beijing have preliminary agreements on tech tariffs that could reshape semiconductor trade flows across the continent.",
    content: "Brussels and Beijing have reached preliminary agreements on tech tariffs that could reshape semiconductor trade flows across the continent. Officials from Germany's economic ministry confirmed the framework was discussed at length during closed-door sessions this week, with particular focus on setting a pricing floor for chip exports. Analysts expect the DAX to react to any formal announcement, given the heavy weighting of industrial and tech firms in the index.",
    imageUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuC_IIUJiVeF_yfeXp8KJ7co6IrwwSyXfihsoqoCmr6keClfORjKt2Rt9u7Vs7ExnnegpMPvfqk07G3PlOrCDtYAZ497zzCZUnlVdXEsfXsWTRwgn-meoAT_VIx9meIVj2ZPX-ogfzfhrkI4ZZW762gL3ievI72M-j7-v-Eo1RnC57DSyUHOgtlHkPkDni-Ktx4xl3mNR7N3U7uyGoOF7wKxMmrCXVC9g_PqHv-QfBzOS3XcKo0Vr1dulw",
    countries: [COUNTRY_LOOKUP.DEU, COUNTRY_LOOKUP.CHN],
    tags: ["Trade Policy", "Semiconductors", "EU-CN Relations"],
  },
  {
    id: "2",
    source: "Bloomberg",
    publishedAt: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
    headline: "Semiconductor Supply Chain Faces New Logistics Hurdle",
    excerpt: "Port congestions in Southeast Asia are predicted to impact Q3 shipments for major chipmakers, with Taiwan and the Netherlands most exposed.",
    content: "Port congestions in Southeast Asia are predicted to impact Q3 shipments for major chipmakers. Taiwan Semiconductor Manufacturing Company and ASML are among the firms most exposed, as delays ripple through lithography equipment shipments bound for fabs in the region. Industry analysts note the bottleneck may push delivery timelines back by several weeks.",
    imageUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuBS0mUUzx4FHQz5DCKFc7pawIfG5wkBKhixSTUghZqJXUEAYq0db1L52jqtIdrO9ss0nOzuQtPw8h3pnFoCxTMI4XJAtHaYXyk_WyQc_aj5h3-yuq4Cuxq3QdTimQP345O5vo41UcYR2umqyBsoH0LUMSZlCF87LD0C3m2tXt5opMWUVEELwNoMw6yMU71K_9O5lDbr4B9GRCJyYbaXSqtQOLgj4XntHYYUV34CwCc_S4ke6H7AlKdHiw",
    countries: [COUNTRY_LOOKUP.TWN, COUNTRY_LOOKUP.NLD],
    tags: ["Supply Chain", "Semiconductors", "Logistics"],
  },
  {
    id: "3",
    source: "Financial Times",
    publishedAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
    headline: "UK Energy Policy Shift Sparks Cross-Channel Tensions",
    excerpt: "A new North Sea drilling framework has drawn criticism from EU energy ministers over shared maritime resource claims.",
    content: "A new North Sea drilling framework introduced by the UK government has drawn criticism from EU energy ministers over shared maritime resource claims. The policy accelerates licensing for offshore blocks near contested boundary lines, prompting Germany's energy ministry to request formal talks. BP shares rose on the announcement, while European energy majors watched closely for signs of retaliatory measures.",
    imageUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuDxfhgQGMqLN7F5TDnRl0Y4lH3WFWFQLsTW18N8vq9pHOcW3jeWv6M2Ax_BxvJwkFgTedaFD4vZSDqiKvlc-wOK0XWT10q4JWKDOLI-w7WYPn8hLK6TjAinWs2aM5d0jA3GlCs23uhTO7u7PupQ_6d3YZbBlQPyZ9DIu2iYz5Ik59FtVZA58FEKmlPtHNcGn4on699cGrmhaA-vXWjBUyOoojyErVhHwYVJcCA6OK1VYSjLQ_zoOYOGSw",
    countries: [COUNTRY_LOOKUP.GBR, COUNTRY_LOOKUP.DEU],
    tags: ["Energy Policy", "EU-UK Relations", "Maritime Law"],
  },
  {
    id: "4",
    source: "Nikkei Asia",
    publishedAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
    headline: "Japan-Korea Chip Alliance Deepens Amid US Export Curbs",
    excerpt: "Tokyo and Seoul are coordinating on advanced memory production as Washington tightens semiconductor export controls to China.",
    content: "Tokyo and Seoul are coordinating on advanced memory chip production as Washington tightens semiconductor export controls affecting China-bound shipments. Japanese and Korean trade officials met this week to align on materials supply and equipment standards, aiming to reduce reliance on single-source suppliers. Samsung and SK Hynix are both expected to expand domestic capacity, while Japanese materials firms see rising demand for photoresists and etching chemicals.",
    imageUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuC_IIUJiVeF_yfeXp8KJ7co6IrwwSyXfihsoqoCmr6keClfORjKt2Rt9u7Vs7ExnnegpMPvfqk07G3PlOrCDtYAZ497zzCZUnlVdXEsfXsWTRwgn-meoAT_VIx9meIVj2ZPX-ogfzfhrkI4ZZW762gL3ievI72M-j7-v-Eo1RnC57DSyUHOgtlHkPkDni-Ktx4xl3mNR7N3U7uyGoOF7wKxMmrCXVC9g_PqHv-QfBzOS3XcKo0Vr1dulw",
    countries: [COUNTRY_LOOKUP.JPN, COUNTRY_LOOKUP.KOR, COUNTRY_LOOKUP.CHN],
    tags: ["Semiconductors", "Export Controls", "Asia-Pacific"],
  },
  {
    id: "5",
    source: "The Economic Times",
    publishedAt: new Date(Date.now() - 7 * 60 * 60 * 1000).toISOString(),
    headline: "India Emerges as Key Node in Diversified Manufacturing Push",
    excerpt: "Global electronics assemblers are accelerating investment in Indian manufacturing hubs as firms seek alternatives to single-country supply chains.",
    content: "Global electronics assemblers are accelerating investment in Indian manufacturing hubs as firms seek alternatives to concentrated supply chains. New Delhi's production-linked incentive scheme has drawn fresh commitments from smartphone and component makers, with several US-based firms citing diversification strategy directly tied to ongoing trade tensions with China. Analysts note the Nifty's IT and manufacturing sub-indices could see meaningful re-rating if commitments convert to actual capacity.",
    imageUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuBS0mUUzx4FHQz5DCKFc7pawIfG5wkBKhixSTUghZqJXUEAYq0db1L52jqtIdrO9ss0nOzuQtPw8h3pnFoCxTMI4XJAtHaYXyk_WyQc_aj5h3-yuq4Cuxq3QdTimQP345O5vo41UcYR2umqyBsoH0LUMSZlCF87LD0C3m2tXt5opMWUVEELwNoMw6yMU71K_9O5lDbr4B9GRCJyYbaXSqtQOLgj4XntHYYUV34CwCc_S4ke6H7AlKdHiw",
    countries: [COUNTRY_LOOKUP.IND, COUNTRY_LOOKUP.USA, COUNTRY_LOOKUP.CHN],
    tags: ["Manufacturing", "Supply Chain", "Trade Diversification"],
  },
  {
    id: "6",
    source: "Le Monde",
    publishedAt: new Date(Date.now() - 9 * 60 * 60 * 1000).toISOString(),
    headline: "France Pushes EU Defense Spending Coordination",
    excerpt: "Paris is lobbying fellow EU members for a joint procurement framework as defense budgets rise across the bloc.",
    content: "Paris is lobbying fellow EU members for a joint procurement framework as defense budgets rise across the bloc in response to ongoing regional security concerns. French officials argue fragmented national programs waste resources that could otherwise strengthen collective capability. Germany has signaled cautious support, while smaller member states worry about French defense contractors dominating any joint framework. Markets are watching Dassault and Thales for contract flow implications.",
    imageUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuDxfhgQGMqLN7F5TDnRl0Y4lH3WFWFQLsTW18N8vq9pHOcW3jeWv6M2Ax_BxvJwkFgTedaFD4vZSDqiKvlc-wOK0XWT10q4JWKDOLI-w7WYPn8hLK6TjAinWs2aM5d0jA3GlCs23uhTO7u7PupQ_6d3YZbBlQPyZ9DIu2iYz5Ik59FtVZA58FEKmlPtHNcGn4on699cGrmhaA-vXWjBUyOoojyErVhHwYVJcCA6OK1VYSjLQ_zoOYOGSw",
    countries: [COUNTRY_LOOKUP.FRA, COUNTRY_LOOKUP.DEU],
    tags: ["Defense Policy", "EU Coordination", "Procurement"],
  },
  {
    id: "7",
    source: "Reuters",
    publishedAt: new Date(Date.now() - 11 * 60 * 60 * 1000).toISOString(),
    headline: "Brazil's Agricultural Exports Reshape Global Grain Flows",
    excerpt: "Record soybean and corn harvests are shifting trade routes as buyers diversify away from traditional Northern Hemisphere suppliers.",
    content: "Record soybean and corn harvests in Brazil are shifting global grain trade routes as major buyers diversify away from traditional Northern Hemisphere suppliers. Chinese purchasers in particular have increased Brazilian sourcing over the past two seasons, citing both price and reduced exposure to geopolitical friction elsewhere. Brazilian agribusiness stocks have rallied on the sustained demand, while logistics bottlenecks at key ports remain a watch item for exporters.",
    imageUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuC_IIUJiVeF_yfeXp8KJ7co6IrwwSyXfihsoqoCmr6keClfORjKt2Rt9u7Vs7ExnnegpMPvfqk07G3PlOrCDtYAZ497zzCZUnlVdXEsfXsWTRwgn-meoAT_VIx9meIVj2ZPX-ogfzfhrkI4ZZW762gL3ievI72M-j7-v-Eo1RnC57DSyUHOgtlHkPkDni-Ktx4xl3mNR7N3U7uyGoOF7wKxMmrCXVC9g_PqHv-QfBzOS3XcKo0Vr1dulw",
    countries: [COUNTRY_LOOKUP.BRA, COUNTRY_LOOKUP.CHN],
    tags: ["Agriculture", "Trade Flows", "Commodities"],
  },
  {
    id: "8",
    source: "Bloomberg",
    publishedAt: new Date(Date.now() - 14 * 60 * 60 * 1000).toISOString(),
    headline: "Russia-China Energy Corridor Expansion Faces Financing Scrutiny",
    excerpt: "A planned pipeline expansion linking Russian gas fields to Chinese industrial hubs is drawing scrutiny over financing terms and sanctions exposure.",
    content: "A planned pipeline expansion linking Russian gas fields to Chinese industrial hubs is drawing scrutiny over financing terms and sanctions exposure for participating banks. Chinese state energy firms are reportedly negotiating longer-term pricing arrangements than typical spot contracts, aiming to secure supply stability. Analysts note the deal's structure could set a precedent for how future Russia-China energy infrastructure projects are financed amid ongoing Western sanctions regimes.",
    imageUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuBS0mUUzx4FHQz5DCKFc7pawIfG5wkBKhixSTUghZqJXUEAYq0db1L52jqtIdrO9ss0nOzuQtPw8h3pnFoCxTMI4XJAtHaYXyk_WyQc_aj5h3-yuq4Cuxq3QdTimQP345O5vo41UcYR2umqyBsoH0LUMSZlCF87LD0C3m2tXt5opMWUVEELwNoMw6yMU71K_9O5lDbr4B9GRCJyYbaXSqtQOLgj4XntHYYUV34CwCc_S4ke6H7AlKdHiw",
    countries: [COUNTRY_LOOKUP.RUS, COUNTRY_LOOKUP.CHN],
    tags: ["Energy", "Sanctions", "Infrastructure Financing"],
  },
  {
    id: "9",
    source: "Financial Times",
    publishedAt: new Date(Date.now() - 18 * 60 * 60 * 1000).toISOString(),
    headline: "US-EU Digital Tax Standoff Resumes Ahead of G7 Meeting",
    excerpt: "Washington has renewed threats of retaliatory tariffs against European digital services taxes targeting US tech firms.",
    content: "Washington has renewed threats of retaliatory tariffs against European digital services taxes that primarily target large US technology firms. French and German officials have defended the levies as necessary given the mismatch between where tech profits are booked and where user value is generated. The dispute is expected to feature prominently at the upcoming G7 finance ministers meeting, with markets watching for signs of an escalation or a negotiated framework.",
    imageUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuDxfhgQGMqLN7F5TDnRl0Y4lH3WFWFQLsTW18N8vq9pHOcW3jeWv6M2Ax_BxvJwkFgTedaFD4vZSDqiKvlc-wOK0XWT10q4JWKDOLI-w7WYPn8hLK6TjAinWs2aM5d0jA3GlCs23uhTO7u7PupQ_6d3YZbBlQPyZ9DIu2iYz5Ik59FtVZA58FEKmlPtHNcGn4on699cGrmhaA-vXWjBUyOoojyErVhHwYVJcCA6OK1VYSjLQ_zoOYOGSw",
    countries: [COUNTRY_LOOKUP.USA, COUNTRY_LOOKUP.FRA, COUNTRY_LOOKUP.DEU],
    tags: ["Trade Policy", "Digital Tax", "US-EU Relations"],
  },
  {
    id: "10",
    source: "Nikkei Asia",
    publishedAt: new Date(Date.now() - 22 * 60 * 60 * 1000).toISOString(),
    headline: "Taiwan Strait Tensions Prompt Chipmaker Contingency Planning",
    excerpt: "Major semiconductor firms are quietly accelerating diversification plans as regional security concerns around Taiwan persist.",
    content: "Major semiconductor firms are quietly accelerating geographic diversification plans as regional security concerns around the Taiwan Strait persist. TSMC's expansion of fabrication capacity in Japan and planned US facilities are seen by analysts as hedges against disruption risk, even as the company maintains its core Taiwan operations remain central to its roadmap. Japanese and Korean suppliers stand to benefit from any acceleration in regional capacity diversification.",
    imageUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuC_IIUJiVeF_yfeXp8KJ7co6IrwwSyXfihsoqoCmr6keClfORjKt2Rt9u7Vs7ExnnegpMPvfqk07G3PlOrCDtYAZ497zzCZUnlVdXEsfXsWTRwgn-meoAT_VIx9meIVj2ZPX-ogfzfhrkI4ZZW762gL3ievI72M-j7-v-Eo1RnC57DSyUHOgtlHkPkDni-Ktx4xl3mNR7N3U7uyGoOF7wKxMmrCXVC9g_PqHv-QfBzOS3XcKo0Vr1dulw",
    countries: [COUNTRY_LOOKUP.TWN, COUNTRY_LOOKUP.JPN, COUNTRY_LOOKUP.KOR],
    tags: ["Geopolitical Risk", "Semiconductors", "Supply Chain Resilience"],
  },
];

export const MOCK_STOCKS: Record<string, Stock[]> = {
  DEU: [
    { ticker: "SAP", companyName: "SAP SE", countryIso: "DEU", price: 164.2, currency: "EUR", changePercent: 1.42 },
    { ticker: "SIE", companyName: "Siemens AG", countryIso: "DEU", price: 178.9, currency: "EUR", changePercent: 0.64 },
    { ticker: "VOW3", companyName: "Volkswagen AG", countryIso: "DEU", price: 112.35, currency: "EUR", changePercent: -0.81 },
  ],
  CHN: [
    { ticker: "BABA", companyName: "Alibaba Group", countryIso: "CHN", price: 72.44, currency: "USD", changePercent: -2.15 },
    { ticker: "TCEHY", companyName: "Tencent Holdings", countryIso: "CHN", price: 41.8, currency: "USD", changePercent: 0.55 },
    { ticker: "PDD", companyName: "PDD Holdings", countryIso: "CHN", price: 98.6, currency: "USD", changePercent: 1.93 },
  ],
  NLD: [
    { ticker: "ASML", companyName: "ASML Holding", countryIso: "NLD", price: 892.1, currency: "EUR", changePercent: 0.88 },
    { ticker: "SHELL", companyName: "Shell plc", countryIso: "NLD", price: 31.4, currency: "EUR", changePercent: -0.32 },
    { ticker: "INGA", companyName: "ING Group", countryIso: "NLD", price: 15.62, currency: "EUR", changePercent: 0.47 },
  ],
  TWN: [
    { ticker: "TSM", companyName: "Taiwan Semiconductor", countryIso: "TWN", price: 128.5, currency: "USD", changePercent: -0.45 },
    { ticker: "UMC", companyName: "United Microelectronics", countryIso: "TWN", price: 7.82, currency: "USD", changePercent: 0.26 },
    { ticker: "HTHIY", companyName: "HTC Corporation", countryIso: "TWN", price: 1.14, currency: "USD", changePercent: -1.72 },
  ],
  GBR: [
    { ticker: "BP", companyName: "BP plc", countryIso: "GBR", price: 465.3, currency: "GBP", changePercent: 1.12 },
    { ticker: "HSBA", companyName: "HSBC Holdings", countryIso: "GBR", price: 612.9, currency: "GBP", changePercent: 0.38 },
    { ticker: "GSK", companyName: "GSK plc", countryIso: "GBR", price: 1487.5, currency: "GBP", changePercent: -0.19 },
  ],
  JPN: [
    { ticker: "7203.T", companyName: "Toyota Motor Corp", countryIso: "JPN", price: 2891, currency: "JPY", changePercent: 0.72 },
    { ticker: "6758.T", companyName: "Sony Group Corp", countryIso: "JPN", price: 3145, currency: "JPY", changePercent: 1.05 },
    { ticker: "8306.T", companyName: "Mitsubishi UFJ Financial", countryIso: "JPN", price: 1678, currency: "JPY", changePercent: -0.28 },
  ],
  KOR: [
    { ticker: "005930.KS", companyName: "Samsung Electronics", countryIso: "KOR", price: 74800, currency: "KRW", changePercent: 0.94 },
    { ticker: "000660.KS", companyName: "SK Hynix", countryIso: "KOR", price: 189200, currency: "KRW", changePercent: 2.31 },
    { ticker: "005380.KS", companyName: "Hyundai Motor", countryIso: "KOR", price: 218500, currency: "KRW", changePercent: -0.53 },
  ],
  IND: [
    { ticker: "TCS.NS", companyName: "Tata Consultancy Services", countryIso: "IND", price: 3842, currency: "INR", changePercent: 0.61 },
    { ticker: "RELIANCE.NS", companyName: "Reliance Industries", countryIso: "IND", price: 2967, currency: "INR", changePercent: 1.18 },
    { ticker: "INFY.NS", companyName: "Infosys Ltd", countryIso: "IND", price: 1745, currency: "INR", changePercent: -0.42 },
  ],
  FRA: [
    { ticker: "MC.PA", companyName: "LVMH", countryIso: "FRA", price: 782.4, currency: "EUR", changePercent: 0.35 },
    { ticker: "AIR.PA", companyName: "Airbus SE", countryIso: "FRA", price: 168.9, currency: "EUR", changePercent: 1.27 },
    { ticker: "TTE.PA", companyName: "TotalEnergies", countryIso: "FRA", price: 61.2, currency: "EUR", changePercent: -0.18 },
  ],
  BRA: [
    { ticker: "PETR4.SA", companyName: "Petrobras", countryIso: "BRA", price: 38.9, currency: "BRL", changePercent: 1.62 },
    { ticker: "VALE3.SA", companyName: "Vale S.A.", countryIso: "BRA", price: 64.3, currency: "BRL", changePercent: -0.87 },
    { ticker: "ITUB4.SA", companyName: "Itaú Unibanco", countryIso: "BRA", price: 32.1, currency: "BRL", changePercent: 0.44 },
  ],
  RUS: [
    { ticker: "GAZP.ME", companyName: "Gazprom", countryIso: "RUS", price: 168.5, currency: "RUB", changePercent: -1.03 },
    { ticker: "LKOH.ME", companyName: "Lukoil", countryIso: "RUS", price: 6845, currency: "RUB", changePercent: 0.29 },
    { ticker: "SBER.ME", companyName: "Sberbank", countryIso: "RUS", price: 271.4, currency: "RUB", changePercent: 0.67 },
  ],
};

export const DEFAULT_WATCHLIST: Stock[] = [
  ...MOCK_STOCKS.DEU.slice(0, 1),
  ...MOCK_STOCKS.CHN.slice(0, 1),
  ...MOCK_STOCKS.NLD.slice(0, 1),
  ...MOCK_STOCKS.TWN.slice(0, 1),
  ...MOCK_STOCKS.GBR.slice(0, 1),
];

export const MOCK_GOLD_PRICE_USD = 2024.5;

// Rough static FX rates for mock/demo mode (USD base).
// Replaced by live rates once a real FX API key is wired in.
export const MOCK_FX_RATES: Record<string, number> = {
  USD: 1,
  EUR: 0.92,
  GBP: 0.79,
  CNY: 7.24,
  TWD: 32.1,
  JPY: 156.3,
  INR: 86.4,
  KRW: 1428,
  BRL: 5.68,
  RUB: 91.2,
};
