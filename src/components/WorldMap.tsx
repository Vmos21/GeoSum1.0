import { useEffect, useRef, useState } from "react";
import { ComposableMap, Geographies, Geography, Marker } from "react-simple-maps";
import type { CountryMention } from "../types";

// Public CDN-hosted world topojson (no API key needed).
const GEO_URL = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";

// world-atlas assigns each country a numeric ISO 3166-1 numeric code as its
// feature `id` (NOT the 3-letter alpha code we use elsewhere in the app).
// This maps the numeric codes for countries we track back to alpha-3, so
// highlighting actually matches. Extend this as more countries are added
// to COUNTRY_LOOKUP in data/mockData.ts.
const NUMERIC_ID_TO_ISO3: Record<string, string> = {
  "276": "DEU", // Germany
  "156": "CHN", // China
  "840": "USA", // United States
  "528": "NLD", // Netherlands
  "158": "TWN", // Taiwan
  "826": "GBR", // United Kingdom
  "392": "JPN", // Japan
  "356": "IND", // India
  "250": "FRA", // France
  "410": "KOR", // South Korea
  "76": "BRA", // Brazil
  "643": "RUS", // Russia
};

interface WorldMapProps {
  highlightedCountries: CountryMention[];
  isLoading?: boolean;
}

export default function WorldMap({ highlightedCountries, isLoading }: WorldMapProps) {
  const highlightedIsoSet = new Set(highlightedCountries.map((c) => c.iso));
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 450 });

  // Keep the map's SVG viewBox in sync with the actual panel size, so it
  // always fills the available space instead of letterboxing to a fixed
  // aspect ratio.
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (entry) {
        const { width, height } = entry.contentRect;
        if (width > 0 && height > 0) setDimensions({ width, height });
      }
    });

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // Empirically-tuned scale factor for geoEqualEarth (react-simple-maps'
  // default projection) that fills the container width without excessive
  // polar whitespace, given our measured container dimensions.
  const scale = dimensions.width / 5.5;

  return (
    <section className="h-full w-full bg-surface-elevated overflow-hidden relative group border border-outline-variant/30">
      <div className="absolute top-4 left-4 z-10 flex gap-2">
        <div className="bg-surface-container-highest/80 backdrop-blur px-3 py-1 rounded text-[10px] font-label-caps text-primary border border-primary/20">
          LIVE INTEL FEED
        </div>
        {isLoading && (
          <div className="bg-surface-container-highest/80 backdrop-blur px-3 py-1 rounded text-[10px] font-label-caps text-secondary border border-secondary/20 flex items-center gap-1.5">
            <span className="material-symbols-outlined animate-spin text-[12px]">sync</span>
            Analyzing article...
          </div>
        )}
      </div>

      <div
        ref={containerRef}
        className={`w-full h-full bg-map-water relative overflow-hidden transition-opacity ${
          isLoading ? "opacity-60" : "opacity-100"
        }`}
      >
        <ComposableMap
          width={dimensions.width}
          height={dimensions.height}
          projectionConfig={{ scale, center: [10, 10] }}
          style={{ width: "100%", height: "100%", display: "block" }}
        >
          <Geographies geography={GEO_URL}>
            {({ geographies }) =>
              geographies.map((geo) => {
                const iso3 = NUMERIC_ID_TO_ISO3[geo.id as string];
                const isHighlighted = !!iso3 && highlightedIsoSet.has(iso3);
                return (
                  <Geography
                    key={geo.rsmKey}
                    geography={geo}
                    fill={isHighlighted ? "#ffba20" : "#2D333B"}
                    stroke="#111417"
                    strokeWidth={0.5}
                    style={{
                      default: { outline: "none" },
                      hover: { outline: "none", fill: isHighlighted ? "#ffdca1" : "#37393d" },
                      pressed: { outline: "none" },
                    }}
                  />
                );
              })
            }
          </Geographies>

          {highlightedCountries.map((country) => (
            <Marker key={country.iso} coordinates={country.capitalCoords}>
              <g className="cursor-pointer">
                <circle r={5} fill="#ffdca1" opacity={0.6}>
                  <animate attributeName="r" values="4;8;4" dur="1.8s" repeatCount="indefinite" />
                  <animate attributeName="opacity" values="0.6;0;0.6" dur="1.8s" repeatCount="indefinite" />
                </circle>
                <circle r={3.5} fill="#ffdca1" stroke="white" strokeWidth={1} />
                <title>
                  {country.capital}, {country.iso}
                </title>
              </g>
            </Marker>
          ))}
        </ComposableMap>
      </div>

      <div className="absolute bottom-4 left-4 font-label-caps text-label-caps text-on-surface-variant flex items-center gap-4">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-primary"></span> Mentioned
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-map-land"></span> Unmentioned
        </div>
      </div>
    </section>
  );
}
