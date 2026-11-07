import { Link } from "react-router-dom";
import styled from "styled-components";
import { ArrowRight } from "lucide-react";
import { useLocale } from "../../../i18n/useLocale";
import { getLocalizedField } from "../../../i18n/utils";
import { useMoments } from "../../../hooks/useMoments";
import { useCardStyle } from "../../../stores/themeStore";

export function LatestMoment({
  className,
  "data-card": customCard,
}: { className?: string; "data-card"?: string } = {}) {
  const { cardStyle } = useCardStyle();
  const { moments } = useMoments();
  const { locale, t } = useLocale();
  const latest = moments[0];
  if (!latest) return null;
  const content = getLocalizedField(latest.content, locale);

  return (
    <Widget data-card={customCard ?? cardStyle} className={className}>
      <div className="title" data-slot="title">
        {t("home.moment.title")}
      </div>
      <Link to="/moment" className="widget-link">
        <span className="moment-meta">
          {latest.mood} {latest.date}
          {latest.location ? ` · ${latest.location}` : ""}
        </span>
        <p className="moment-text">
          {content.length > 64 ? `${content.slice(0, 64)}…` : content}
        </p>
        <span className="view-all">
          {t("home.moment.viewAll")}
          <ArrowRight size={12} aria-hidden="true" />
        </span>
      </Link>
    </Widget>
  );
}

const Widget = styled.div`
  width: 100%;
  height: 100%;
  min-width: 0;
  line-height: var(--leading-ui);
  box-sizing: border-box;
  padding: clamp(10px, 2vw, 24px) clamp(8px, 1.8vw, 20px);

  @media (max-width: 48rem) {
    border-radius: 12px;
  }

  .title {
    font-size: clamp(0.6rem, 1.2vw, var(--text-meta));
    font-weight: var(--weight-strong);
    letter-spacing: normal;
    text-transform: uppercase;
    color: var(--text-3);
  }

  .widget-link {
    &:focus-visible {
      outline: 2px solid var(--main-color);
      outline-offset: 4px;
    }

    color: inherit;
    text-decoration: none;
    display: flex;
    flex-direction: column;
    gap: clamp(4px, 1vw, 8px);
    margin-top: clamp(4px, 1vw, 8px);
  }

  .moment-meta {
    font-size: clamp(0.6rem, 1.2vw, var(--text-meta));
    color: var(--text-3);
  }

  .moment-text {
    margin: 0;
    font-size: clamp(0.72rem, 1.6vw, var(--text-body));
    line-height: var(--leading-body);
    color: var(--text-2);
    display: -webkit-box;
    -webkit-line-clamp: 2;
    line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  .view-all {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    font-size: clamp(0.6rem, 1.2vw, var(--text-meta));
    color: var(--text-1);
    margin-top: auto;
    padding-top: clamp(4px, 1vw, 8px);

    svg {
      transition: transform 0.2s ease;
    }
  }
`;
