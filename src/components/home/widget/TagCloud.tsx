import styled from "styled-components";
import { Link } from "react-router-dom";
import { useLocale } from "../../../i18n/useLocale";
import { useRemoteArticles } from "../../../api/mdArticles";

export function TagCloud({ className }: { className?: string } = {}) {
  const { t } = useLocale();
  const mdArticles = useRemoteArticles();
  const tagCounts = new Map<string, number>();
  for (const article of mdArticles) {
    for (const tag of article.tags ?? []) {
      tagCounts.set(tag, (tagCounts.get(tag) ?? 0) + 1);
    }
  }
  const topTags = [...tagCounts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6);
  if (topTags.length === 0) return null;

  return (
    <Widget data-card className={className}>
      <div className="title" data-slot="title">
        {t("home.tags.title")}
      </div>
      <div className="tags">
        {topTags.map(([tag, count]) => (
          <Link to={`/search?s=${encodeURIComponent(tag)}`} data-tag className="tag-chip" key={tag}>
            {tag}
            <small>{count}</small>
          </Link>
        ))}
      </div>
    </Widget>
  );
}

const Widget = styled.div`
  width: 100%;
  height: 100%;

  .title {
    font-size: 0.8rem;
    font-weight: 700;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: var(--text-3);
  }

  .tags {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    margin-top: 14px;

    @media (max-width: 768px) {
      gap: 8px;
      margin-top: 10px;
    }
  }

  .tag-chip {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    min-height: 44px;
    max-width: 100%;
    padding: 4px 10px;
    border-radius: 999px;
    font-size: 0.875rem;
    background: color-mix(in srgb, var(--main-color) 10%, oklch(0 0 0 / 0));
    color: var(--text-1);
    transition: background-color 0.2s ease;
    &:hover { background: color-mix(in srgb, var(--main-color) 22%, transparent); }
    &:focus-visible { outline: 2px solid var(--main-color); outline-offset: 3px; }

    @media (max-width: 768px) {
      padding: 3px 8px;
      font-size: 0.875rem;
    }

    small {
      font-size: 0.75rem;
      color: var(--text-3);
    }
  }
`;
