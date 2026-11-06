import { useMemo } from "react";
import styled from "styled-components";
import { useLocale } from "../../../i18n/useLocale";
import { useRemoteArticles } from "../../../api/mdArticles";
import { useMoments } from "../../../hooks/useMoments";

function formatDateKey(y: number, m: number, d: number): string {
  return `${y}-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
}

export function MiniCalendar({ className }: { className?: string } = {}) {
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
    <Widget data-card className={className}>
      <div className="header" data-slot="header">
        {monthTitle}
      </div>
      <div className="week-row">
        {(isZh
          ? ["一", "二", "三", "四", "五", "六", "日"]
          : ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"]
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

  /* 月份标题：左对齐与网格对齐，让出右上角的猫咪空间（卡片内容整体仍居中） */
  .header {
    align-self: flex-start;
    text-align: left;
    font-size: 0.8rem;
    font-weight: 700;
    letter-spacing: 0.04em;
    color: var(--text-2);
    margin-bottom: 6px;
  }

  .week-row {
    display: grid;
    grid-template-columns: repeat(7, 1fr);
    margin-bottom: 4px;
  }

  .week-cell {
    text-align: center;
    font-size: 0.62rem;
    font-weight: 600;
    color: var(--text-2);
    padding: 1px 0;
    margin: 0 5px;
    background: color-mix(in srgb, var(--text-1) 10%, oklch(0 0 0 / 0));
  }

  .day-grid {
    display: grid;
    grid-template-columns: repeat(7, 1fr);
    gap: 3px;
  }

  .day-cell {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    height: 22px;
    font-size: 0.68rem;
    border-radius: 999px;
    color: var(--text-1);
    transition: all 0.15s ease;


    @media (max-width: 768px) {
      height: 28px;
      font-size: 0.75rem;
    }

    &.has-content {
      color: var(--text-1);
      font-weight: 600;
    }

    /* 今天：实心粉色药丸 + 白色数字 + 柔光 */
    &.today {
      background: var(--main-color);
      color: var(--on-main, #fff);
      font-weight: 700;
      box-shadow: 0 2px 8px
        color-mix(in srgb, var(--main-color) 45%, oklch(0 0 0 / 0));
    }
  }

  .today .dot { background: var(--on-main); }

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
