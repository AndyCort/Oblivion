import { Link } from "react-router-dom";
import styled from "styled-components";
import { ArrowRight } from "lucide-react";
import { useLocale } from "../../../i18n/useLocale";
import { getLocalizedField } from "../../../i18n/utils";
import { useMoments } from "../../../hooks/useMoments";
import { useCardStyle } from "../../../stores/themeStore";
import { MomentCard, MomentAuthor, MomentFooter } from "../../moments/MomentCard";

export function LatestMoment(props: { className?: string; "data-card"?: string } = {}) {
  const { moments } = useMoments();
  const { cardStyle } = useCardStyle();
  const { locale, t } = useLocale();
  const latest = moments[0];
  if (!latest) return null;
  const content = getLocalizedField(latest.content, locale);

  return (
    <Widget as={Link} to="/moment" {...props} data-card={props["data-card"] ?? cardStyle}>
      <MomentAuthor mood={latest.mood}>
        <span className="widget-title" data-slot="title">{t("home.moment.title")}</span>
      </MomentAuthor>
      {content && <p className="moment-content">{content}</p>}
      <MomentFooter location={latest.location} date={latest.date}>
        <span className="view-all">
          {t("home.moment.viewAll")}
          <ArrowRight size={14} aria-hidden="true" />
        </span>
      </MomentFooter>
    </Widget>
  );
}

const Widget = styled(MomentCard)`
  display: flex;
  flex-direction: column;
  text-decoration: none;

  &:focus-visible {
    outline: 2px solid var(--main-color);
    outline-offset: -4px;
  }

  .widget-title {
    margin-left: auto;
    font-size: var(--text-meta);
    color: var(--text-3);
  }

  .moment-content {
    display: -webkit-box;
    -webkit-line-clamp: 2;
    line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  .moment-footer {
    margin-top: auto;
    padding-top: 10px;
  }

  .view-all {
    display: inline-flex;
    align-items: center;
    gap: 4px;
  }

  &:hover .view-all, &:focus-visible .view-all { color: var(--text-1); }
`;
