import { Link } from "react-router-dom";
import styled from "styled-components";
import { useLocale } from "../../../i18n/useLocale";
import { getLocalizedField } from "../../../i18n/utils";
import { useRemoteArticles } from "../../../api/mdArticles";
import { useCardStyle } from "../../../stores/themeStore";

export function LatestArticle({ className, "data-card": customCard }: { className?: string; "data-card"?: string } = {}) {
  const { cardStyle } = useCardStyle();
  const { locale, t } = useLocale();
  const mdArticles = useRemoteArticles();
  const latest = mdArticles[0];
  if (!latest) return null;

  return (
    <Widget data-card={customCard ?? cardStyle} className={className}>
      <div className="title" data-slot="title">
        {t("home.latest.title")}
      </div>
      <Link to={`/articles/${encodeURIComponent(latest.id)}`} className="widget-link">
        <span className="article-name">
          {getLocalizedField(latest.title, locale)}
        </span>
        <time className="article-meta" dateTime={latest.date.slice(0, 10)}>{latest.date.slice(0, 10)}</time>
      </Link>
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

  .widget-link {
    &:focus-visible { outline: 2px solid var(--main-color); outline-offset: 4px; }

    color: inherit;
    text-decoration: none;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    gap: clamp(3px, 1vw, 8px);
    margin-top: clamp(4px, 1vw, 8px);
    flex: 1;
    min-height: 0;
  }

  .article-name {
    font-size: clamp(0.72rem, 1.6vw, var(--text-body));
    font-weight: var(--weight-strong);
    color: var(--text-1);
    line-height: var(--leading-ui);
    display: -webkit-box;
    -webkit-line-clamp: 2;
    line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
    transition: color 0.2s ease;

    overflow-wrap: anywhere;
  }

  .article-meta {
    font-size: clamp(0.6rem, 1.2vw, var(--text-meta));
    color: var(--text-3);
  }
`;
