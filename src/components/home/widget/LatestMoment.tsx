import { Link } from "react-router-dom";
import styled from "styled-components";
import { ArrowRight } from "lucide-react";
import { useLocale } from "../../../i18n/useLocale";
import { getLocalizedField } from "../../../i18n/utils";
import { useMoments } from "../../../hooks/useMoments";

export function LatestMoment({ className }: { className?: string } = {}) {
  const { moments } = useMoments();
  const { locale, t } = useLocale();
  const latest = moments[0];
  if (!latest) return null;
  const content = getLocalizedField(latest.content, locale);

  return (
    <Widget data-card className={className}>
      <div className="title" data-slot="title">
        {t("home.moment.title")}
      </div>
      <Link to="/moment" className="widget-link">
        <span className="moment-meta">
          {latest.mood} {latest.date}{latest.location ? ` · ${latest.location}` : ""}
        </span>
        <p className="moment-text">
          {content.length > 64 ? `${content.slice(0, 64)}…` : content}
        </p>
        <span className="view-all">
          {t("home.moment.viewAll")}
          <ArrowRight size={16} aria-hidden="true" />
        </span>
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
    &:hover .view-all { text-decoration: underline; text-underline-offset: 4px; }
  }

  .moment-meta {
    font-size: 0.8125rem;
    color: var(--text-3);
  }

  .moment-text {
    margin: 0;
    font-size: 1rem;
    line-height: 1.75;
    color: var(--text-1);
    display: -webkit-box;
    -webkit-line-clamp: 3;
    line-clamp: 3;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  .view-all {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    font-size: 0.875rem;
    color: var(--text-1);
    margin-top: auto;
    padding-top: 8px;

    svg {
      transition: transform 0.2s ease;
    }
  }
`;
