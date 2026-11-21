import { Link } from "react-router-dom";
import styled from "styled-components";
import { ArrowRight } from "lucide-react";
import { useLocale } from "../../../i18n/useLocale";
import { getLocalizedField } from "../../../i18n/utils";
import { useMoments } from "../../../hooks/useMoments";
import { MomentCard, MomentAuthor, MomentStamp } from "../../moments/MomentCard";

export function LatestMoment(props: { className?: string; "data-card"?: string } = {}) {
  const { moments } = useMoments();
  const { locale, t } = useLocale();
  const latest = moments[0];
  if (!latest) return null;
  const content = getLocalizedField(latest.content, locale);

  return (
    <Widget as={Link} to="/moment" {...props}>
      <MomentAuthor mood={latest.mood}>
        <span className="widget-title" data-slot="title">{t("home.moment.title")}</span>
      </MomentAuthor>
      {content && <p className="moment-content">{content}</p>}
      <footer className="moment-footer">
        <MomentStamp location={latest.location} date={latest.date} />
        <span className="view-all">
          {t("home.moment.viewAll")}
          <ArrowRight size={14} aria-hidden="true" />
        </span>
      </footer>
    </Widget>
  );
}

const Widget = styled(MomentCard)`
  display: flex;
  flex-direction: column;
  text-decoration: none;

  &:focus-visible {
    outline: 2px solid #fff;
    outline-offset: -4px;
  }

  .widget-title {
    margin-left: auto;
    font-size: var(--text-meta);
    color: var(--moment-muted);
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

  &:hover .view-all, &:focus-visible .view-all { color: #fff; }
`;
