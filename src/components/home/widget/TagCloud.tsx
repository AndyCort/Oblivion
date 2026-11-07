import styled from "styled-components";
import { Link } from "react-router-dom";
import { useLocale } from "../../../i18n/useLocale";
import { useRemoteArticles } from "../../../api/mdArticles";
import { useCardStyle } from "../../../stores/themeStore";

export function TagCloud({ className, "data-card": customCard }: { className?: string; "data-card"?: string } = {}) {
  const { cardStyle } = useCardStyle();
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
    <Widget data-card={customCard ?? cardStyle} className={className}>
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
  min-width: 0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  line-height: var(--leading-ui);
  box-sizing: border-box;
  padding: clamp(8px, 1.8vw, 24px) clamp(6px, 1.6vw, 20px);

  @media (max-width: 48rem) {
    border-radius: 12px;
  }

  .title {
    font-size: clamp(0.6rem, 1.2vw, var(--text-meta));
    font-weight: var(--weight-strong);
    letter-spacing: normal;
    text-transform: uppercase;
    color: var(--text-3);
    flex-shrink: 0;
  }

  .tags {
    display: flex;
    flex-wrap: wrap;
    align-content: flex-start;
    overflow: hidden;
    gap: clamp(3px, 0.8vw, 8px);
    margin-top: clamp(4px, 1.4vw, 14px);
    flex: 1;
  }

  .tag-chip {
    &:focus-visible { outline: 2px solid var(--main-color); outline-offset: 3px; }
    &:hover { background: oklch(from var(--main-color) l c h / 0.18); }

    display: inline-flex;
    max-width: 100%;
    overflow-wrap: anywhere;
    align-items: center;
    gap: clamp(2px, 0.6vw, 6px);
    padding: clamp(2px, 0.5vw, 4px) clamp(4px, 1vw, 10px);
    border-radius: 999px;
    font-size: clamp(0.6rem, 1.2vw, var(--text-caption));
    background: oklch(from var(--main-color) l c h / 0.10);
    color: var(--text-1);

    small {
      font-size: clamp(0.55rem, 1vw, var(--text-caption));
      flex-shrink: 0;
      color: var(--text-2);
    }
  }
`;
