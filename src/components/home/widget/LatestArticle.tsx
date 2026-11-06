import { Link } from "react-router-dom";
import styled from "styled-components";
import { useLocale } from "../../../i18n/useLocale";
import { getLocalizedField } from "../../../i18n/utils";
import { useRemoteArticles } from "../../../api/mdArticles";

export function LatestArticle({ className }: { className?: string } = {}) {
  const { locale, t } = useLocale();
  const mdArticles = useRemoteArticles();
  const latest = mdArticles[0];
  if (!latest) return null;

  return (
    <Widget data-card className={className}>
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

  .title {
    font-size: 0.72rem;
    font-weight: 700;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: var(--text-3);
  }

  .widget-link {
    &:focus-visible { outline: 2px solid var(--main-color); outline-offset: 4px; }

    color: inherit;
    text-decoration: none;
    display: flex;
    flex-direction: column;
    gap: 8px;
    margin-top: 8px;
  }

  .article-name {
    font-size: 0.95rem;
    font-weight: 600;
    color: var(--text-1);
    line-height: 1.5;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
    transition: color 0.2s ease;

    @media (max-width: 768px) {
      font-size: 0.88rem;
      line-height: 1.4;
    }
  }

  .article-meta {
    font-size: 0.75rem;
    color: var(--text-3);
  }
`;
