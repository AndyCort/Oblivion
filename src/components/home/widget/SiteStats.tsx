import styled from "styled-components";
import { Newspaper, Camera, Timer } from "lucide-react";
import { useLocale } from "../../../i18n/useLocale";
import { useRemoteArticles } from "../../../api/mdArticles";
import { useMoments } from "../../../hooks/useMoments";
import { useCardStyle } from "../../../stores/themeStore";

const LAUNCH_DATE = new Date("2026-07-24");

function daysSinceLaunch(): number {
  return Math.max(
    1,
    Math.floor((Date.now() - LAUNCH_DATE.getTime()) / 86_400_000) + 1,
  );
}

export function SiteStats({ className, "data-card": customCard }: { className?: string; "data-card"?: string } = {}) {
  const { cardStyle } = useCardStyle();
  const { moments } = useMoments();
  const { t } = useLocale();
  const mdArticles = useRemoteArticles();
  const stats = [
    {
      icon: Newspaper,
      label: t("home.stats.articles"),
      value: mdArticles.length,
    },
    { icon: Camera, label: t("home.stats.moments"), value: moments.length },
    { icon: Timer, label: t("home.stats.days"), value: daysSinceLaunch() },
  ];

  return (
    <Widget data-card={customCard ?? cardStyle} className={className}>
      <div className="title" data-slot="title">
        {t("home.stats.title")}
      </div>
      {stats.map((s) => (
        <div className="stat-row" key={s.label}>
          <s.icon size={14} aria-hidden="true" />
          <span className="stat-value">{s.value}</span>
          <span className="stat-label">{s.label}</span>
        </div>
      ))}
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

  .stat-row {
    display: flex;
    align-items: center;
    flex-wrap: nowrap;
    white-space: nowrap;
    gap: clamp(3px, 1vw, 8px);
    margin-top: clamp(4px, 1.4vw, 14px);
    color: var(--text-2);

    svg {
      color: var(--main-color);
      flex-shrink: 0;
      width: clamp(11px, 1.4vw, 16px);
      height: clamp(11px, 1.4vw, 16px);
    }
  }

  .stat-value {
    font-size: clamp(0.85rem, 2vw, var(--text-brand));
    font-weight: var(--weight-strong);
    color: var(--text-1);
    min-width: 0;
    line-height: var(--leading-heading);
    font-variant-numeric: tabular-nums;
    flex-shrink: 0;
  }

  .stat-label {
    font-size: clamp(0.6rem, 1.2vw, var(--text-meta));
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
`;
