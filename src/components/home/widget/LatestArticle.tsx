import { Link } from "react-router-dom";
import styled from "styled-components";
import { useLocale } from "../../../i18n/useLocale";
import { getLocalizedField } from "../../../i18n/utils";
import { useRemoteArticles } from "../../../api/mdArticles";
import { ArrowUpRight } from "lucide-react";

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
        {latest.summary && <p className="article-summary">{getLocalizedField(latest.summary, locale)}</p>}
        <span className="read-more">{t("articles.readMore")}<ArrowUpRight size={16} aria-hidden="true" /></span>
      </Link>
    </Widget>
  );
}

const Widget = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;

  .title {
    font-size: 0.8rem;
    font-weight: 700;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: var(--text-3);
  }

  .widget-link {
    color: inherit;
    text-decoration: none;
    display: flex;
    flex-direction: column;
    gap: 8px;
    margin-top: 16px;
    flex: 1;
    border-radius: 8px;

    &:focus-visible { outline: 2px solid var(--main-color); outline-offset: 6px; }
    &:hover .article-name { text-decoration: underline; text-underline-offset: 4px; }
  }

  .article-name {
    font-size: 1.125rem;
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
      font-size: 1.0625rem;
    }
  }

  .article-meta {
    font-size: 0.8125rem;
    color: var(--text-3);
  }

  .article-summary {
    font-size: 0.9375rem;
    line-height: 1.65;
    color: var(--text-1);
    margin: 0;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  .read-more {
    margin-top: auto;
    padding-top: 12px;
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 0.875rem;
    color: var(--text-1);
  }
`;
