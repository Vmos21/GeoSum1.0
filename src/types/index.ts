export interface CountryMention {
  iso: string; // ISO 3166-1 alpha-3 (matches world atlas topojson ids)
  name: string;
  capital: string;
  capitalCoords: [number, number]; // [longitude, latitude]
  currency: string; // ISO 4217 code, e.g. "USD"
}

export interface Article {
  id: string;
  source: string;
  publishedAt: string; // ISO date string
  headline: string;
  excerpt: string;
  content: string; // full body used for AI context
  imageUrl?: string;
  countries: CountryMention[]; // populated after AI extraction
  tags: string[];
}

export interface Stock {
  ticker: string;
  companyName: string;
  countryIso: string;
  countryFlagUrl?: string;
  price: number;
  currency: string;
  changePercent: number;
}

export interface GoldPrice {
  pricePerOz: number;
  currency: string;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  pending?: boolean;
}
