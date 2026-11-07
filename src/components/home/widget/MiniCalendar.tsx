import { useMemo } from "react";
import styled from "styled-components";
import { useLocale } from "../../../i18n/useLocale";
import { useRemoteArticles } from "../../../api/mdArticles";
import { useMoments } from "../../../hooks/useMoments";
import { useCardStyle } from "../../../stores/themeStore";

function formatDateKey(y: number, m: number, d: number): string {
  return `${y}-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
}

export function MiniCalendar({
  className,
  "data-card": customCard,
}: { className?: string; "data-card"?: string } = {}) {
  const { cardStyle } = useCardStyle();
  const { moments } = useMoments();
  const { locale } = useLocale();
  const isZh = locale === "zh-CN";
  const mdArticles = useRemoteArticles();
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();

  // 有文章或动态的日期集合
  const contentDates = useMemo(() => {
    const set = new Set<string>();
    for (const article of mdArticles) {
      if (article.date) set.add(article.date.slice(0, 10));
    }
    for (const moment of moments) {
      set.add(moment.date.slice(0, 10));
    }
    return set;
  }, [mdArticles, moments]);

  // 周一为一周开头
  const offset = (new Date(year, month, 1).getDay() + 6) % 7;
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const todayKey = formatDateKey(year, month, now.getDate());

  const cells: (number | null)[] = [
    ...Array.from({ length: offset }, () => null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  const monthTitle = Intl.DateTimeFormat(isZh ? "zh-CN" : "en-US", {
    year: "numeric",
    month: "long",
  }).format(now);

  return (
    <Widget data-card={customCard ?? cardStyle} className={className}>
      <div className="header" data-slot="header">
        {monthTitle}
      </div>
      <div className="week-row">
        {(isZh
          ? ["一", "二", "三", "四", "五", "六", "日"]
          : ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
        ).map((w) => (
          <div className="week-cell" key={w}>
            {w}
          </div>
        ))}
      </div>
      <div className="day-grid">
        {cells.map((day, i) => {
          if (day === null)
            return <div className="day-cell" key={`empty-${i}`} />;
          const key = formatDateKey(year, month, day);
          const hasContent = contentDates.has(key);
          const isToday = key === todayKey;
          return (
            <div
              key={key}
              className={`day-cell${hasContent ? " has-content" : ""}${isToday ? " today" : ""}`}
              aria-current={isToday ? "date" : undefined}
              aria-label={`${key}${isToday ? (isZh ? "，今天" : ", today") : ""}${hasContent ? (isZh ? "，有文章或动态" : ", has a post") : ""}`}
            >
              {day}
              {hasContent && <span className="dot" />}
            </div>
          );
        })}
      </div>
    </Widget>
  );
}

const Widget = styled.div`
  width: 100%;
  height: 100%;
  min-width: 0;
  line-height: var(--leading-ui);
  box-sizing: border-box;
  padding: clamp(8px, 1.8vw, 24px) clamp(4px, 1.2vw, 20px);

  @media (max-width: 48rem) {
    border-radius: 12px;
  }

  /* 月份标题：左对齐与网格对齐，让出右上角的猫咪空间（卡片内容整体仍居中） */
  .header {
    align-self: flex-start;
    text-align: left;
    font-size: clamp(0.65rem, 1.3vw, var(--text-meta));
    font-weight: var(--weight-strong);
    letter-spacing: normal;
    color: var(--text-2);
    margin-bottom: clamp(2px, 0.8vw, 6px);
    @media (max-width: 48rem) {
      display: none;
    }
  }

  .week-row {
    display: grid;
    grid-template-columns: repeat(7, 1fr);
    margin-bottom: clamp(2px, 0.6vw, 4px);
  }

  .week-cell {
    display: flex;
    align-items: center;
    justify-content: center;
    text-align: center;
    font-size: clamp(0.55rem, 1vw, var(--text-caption));
    font-weight: var(--weight-regular);
    color: var(--text-2);
    padding: 1px 0;
    min-width: 0;
    margin: 0 1px;
  }

  .day-grid {
    display: grid;
    grid-template-columns: repeat(7, 1fr);
    gap: clamp(1px, 0.4vw, 3px);
  }

  .day-cell {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    aspect-ratio: 1 / 1;
    min-height: 0;
    line-height: 1;
    font-variant-numeric: tabular-nums;
    font-size: clamp(0.55rem, 1.2vw, var(--text-meta));
    border-radius: 999px;
    color: var(--text-1);
    transition: all 0.15s ease;

    &.has-content {
      color: var(--text-1);
      font-weight: var(--weight-strong);
    }

    /* 今天：实心粉色药丸 + 白色数字 + 柔光 */
    &.today {
      background: var(--main-color);
      color: var(--on-main, #fff);
      font-weight: var(--weight-strong);
      box-shadow: 0 2px 8px
        color-mix(in srgb, var(--main-color) 45%, oklch(0 0 0 / 0));
    }
  }

  .today .dot {
    background: var(--on-main);
  }

  .dot {
    position: absolute;
    bottom: 1px;
    left: 50%;
    transform: translateX(-50%);
    width: 3px;
    height: 3px;
    border-radius: 50%;
    background: var(--main-color);
  }
`;
