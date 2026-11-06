import styled from "styled-components";
import { Newspaper, Camera, Timer } from "lucide-react";
import { useLocale } from "../../../i18n/useLocale";
import { useRemoteArticles } from "../../../api/mdArticles";
import { useMoments } from "../../../hooks/useMoments";

const LAUNCH_DATE = new Date("2026-07-24");

function daysSinceLaunch(): number {
  return Math.max(
    1,
    Math.floor((Date.now() - LAUNCH_DATE.getTime()) / 86_400_000) + 1,
  );
}

export function SiteStats({ className }: { className?: string } = {}) {
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
    <Widget data-card className={className}>
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

  .title {
    font-size: 0.72rem;
    font-weight: 700;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: var(--text-3);
  }

  .stat-row {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-top: 14px;
    color: var(--text-2);

    svg {
      color: var(--main-color);
      flex-shrink: 0;
    }

    @media (max-width: 768px) {
      margin-top: 10px;
      gap: 6px;
    }
  }

  .stat-value {
    font-size: 1.1rem;
    font-weight: 700;
    color: var(--text-1);
    min-width: 32px;

    @media (max-width: 768px) {
      font-size: 1rem;
      min-width: 24px;
    }
  }

  .stat-label {
    font-size: 0.8rem;
    white-space: nowrap;

    @media (max-width: 768px) {
      font-size: 0.75rem;
    }
  }
`;
