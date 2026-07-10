import { useState } from "react";
import type { Article } from "../types";

interface NewsFeedProps {
  articles: Article[];
  selectedId: string | null;
  onSelect: (article: Article) => void;
}

function timeAgo(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

// Some news source CDNs block hotlinked images (403/406 responses) even
// though the article data itself is fine. Rather than show a broken
// image icon, this hides the thumbnail entirely if it fails to load.
function ArticleThumbnail({ src }: { src: string }) {
  const [failed, setFailed] = useState(false);
  if (failed) return null;

  return (
    <div className="w-16 h-16 rounded bg-surface-container flex-shrink-0 overflow-hidden">
      <img
        src={src}
        alt=""
        onError={() => setFailed(true)}
        className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all"
      />
    </div>
  );
}

export default function NewsFeed({ articles, selectedId, onSelect }: NewsFeedProps) {
  return (
    <section className="h-full flex flex-col gap-4 overflow-hidden p-2">
      <div className="flex justify-between items-center px-2">
        <h2 className="font-headline-sm text-on-surface uppercase tracking-widest text-[14px]">
          Top Intelligence
        </h2>
        <button className="text-primary font-label-caps hover:underline">View All</button>
      </div>

      <div className="flex-1 overflow-y-auto space-y-4 pr-2">
        {articles.map((article) => {
          const isSelected = article.id === selectedId;
          return (
            <article
              key={article.id}
              onClick={() => onSelect(article)}
              className={`bg-surface-card p-card-padding rounded-r-lg group cursor-pointer hover:bg-surface-container-highest transition-colors ${
                isSelected
                  ? "border-l-2 border-primary"
                  : "border border-outline-variant/30 rounded-lg"
              }`}
            >
              <div className="flex justify-between items-start mb-2">
                <span className="font-label-caps text-on-surface-variant uppercase">
                  {article.source} • {timeAgo(article.publishedAt)}
                </span>
                {isSelected && (
                  <span
                    className="material-symbols-outlined text-primary text-[18px]"
                    style={{ fontVariationSettings: "'FILL' 1" }}
                  >
                    bookmark
                  </span>
                )}
              </div>
              <div className="flex gap-4">
                <div className="flex-1">
                  <h3 className="font-headline-sm text-[16px] text-[#F0F6FC] mb-2 leading-tight">
                    {article.headline}
                  </h3>
                  <p className="font-body-md text-on-surface-variant line-clamp-2">
                    {article.excerpt}
                  </p>
                </div>
                {article.imageUrl && <ArticleThumbnail src={article.imageUrl} />}
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
