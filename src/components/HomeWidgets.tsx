import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import styled, { css } from 'styled-components';
import { Newspaper, Camera, Timer, ArrowRight } from 'lucide-react';
import { useLocale } from '../i18n/useLocale';
import { getLocalizedField } from '../i18n/utils';
import { getLocalMarkdownArticles } from '../api/mdArticles';
import { moments } from '../data/moments';

const LAUNCH_DATE = new Date('2026-07-24');

function daysSinceLaunch(): number {
  return Math.max(1, Math.floor((Date.now() - LAUNCH_DATE.getTime()) / 86_400_000) + 1);
}

/* ---------- 站点信息统计 (item1) ---------- */

export function SiteStats() {
  const { t } = useLocale();
  const stats = [
    { icon: Newspaper, label: t('home.stats.articles'), value: getLocalMarkdownArticles().length },
    { icon: Camera, label: t('home.stats.moments'), value: moments.length },
    { icon: Timer, label: t('home.stats.days'), value: daysSinceLaunch() },
  ];

  return (
    <Widget>
      <WidgetTitle>{t('home.stats.title')}</WidgetTitle>
      {stats.map((s) => (
        <StatRow key={s.label}>
          <s.icon size={14} />
          <StatValue>{s.value}</StatValue>
          <StatLabel>{s.label}</StatLabel>
        </StatRow>
      ))}
    </Widget>
  );
}

/* ---------- 最新文章 (item2) ---------- */

export function LatestArticle() {
  const { locale, t } = useLocale();
  const latest = getLocalMarkdownArticles()[0];
  if (!latest) return null;

  return (
    <Widget>
      <WidgetTitle>{t('home.latest.title')}</WidgetTitle>
      <Link to={`/articles/${latest.id}`} className="widget-link">
        <ArticleName>{getLocalizedField(latest.title, locale)}</ArticleName>
        <ArticleMeta>{latest.date}</ArticleMeta>
      </Link>
    </Widget>
  );
}

/* ---------- 热门标签 (item3) ---------- */

export function TagCloud() {
  const { t } = useLocale();
  const tagCounts = new Map<string, number>();
  for (const article of getLocalMarkdownArticles()) {
    for (const tag of article.tags ?? []) {
      tagCounts.set(tag, (tagCounts.get(tag) ?? 0) + 1);
    }
  }
  const topTags = [...tagCounts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 6);
  if (topTags.length === 0) return null;

  return (
    <Widget>
      <WidgetTitle>{t('home.tags.title')}</WidgetTitle>
      <Tags>
        {topTags.map(([tag, count]) => (
          <TagChip key={tag}>
            {tag}
            <small>{count}</small>
          </TagChip>
        ))}
      </Tags>
    </Widget>
  );
}

/* ---------- 最近动态 (item5) ---------- */

export function LatestMoment() {
  const { locale, t } = useLocale();
  const latest = moments[0];
  if (!latest) return null;
  const content = getLocalizedField(latest.content, locale);

  return (
    <Widget>
      <WidgetTitle>{t('home.moment.title')}</WidgetTitle>
      <Link to="/moment" className="widget-link">
        <MomentMeta>
          {latest.mood} {latest.date} · {latest.location}
        </MomentMeta>
        <MomentText>{content.length > 64 ? `${content.slice(0, 64)}…` : content}</MomentText>
        <ViewAll>
          {t('home.moment.viewAll')}
          <ArrowRight size={12} />
        </ViewAll>
      </Link>
    </Widget>
  );
}

/* ---------- 当月迷你日历 (item6) ---------- */

function formatDateKey(y: number, m: number, d: number): string {
  return `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
}

export function MiniCalendar() {
  const { locale } = useLocale();
  const isZh = locale === 'zh-CN';
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();

  // 有文章或动态的日期集合
  const contentDates = useMemo(() => {
    const set = new Set<string>();
    for (const article of getLocalMarkdownArticles()) {
      if (article.date) set.add(article.date.slice(0, 10));
    }
    for (const moment of moments) {
      set.add(moment.date.slice(0, 10));
    }
    return set;
  }, []);

  // 周一为一周开头
  const offset = (new Date(year, month, 1).getDay() + 6) % 7;
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const todayKey = formatDateKey(year, month, now.getDate());

  const cells: (number | null)[] = [
    ...Array.from({ length: offset }, () => null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  const monthTitle = Intl.DateTimeFormat(isZh ? 'zh-CN' : 'en-US', {
    year: 'numeric',
    month: 'long',
  }).format(now);

  return (
    <Widget>
      <CalendarHeader>{monthTitle}</CalendarHeader>
      <WeekRow>
        {(isZh ? ['一', '二', '三', '四', '五', '六', '日'] : ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su']).map(
          (w) => <WeekCell key={w}>{w}</WeekCell>,
        )}
      </WeekRow>
      <DayGrid>
        {cells.map((day, i) => {
          if (day === null) return <DayCell key={`empty-${i}`} />;
          const key = formatDateKey(year, month, day);
          const hasContent = contentDates.has(key);
          const isToday = key === todayKey;
          return (
            <DayCell key={key} $has={hasContent} $today={isToday}>
              {day}
              {hasContent && <Dot />}
            </DayCell>
          );
        })}
      </DayGrid>
    </Widget>
  );
}

/* ---------- 共享样式 ---------- */

const Widget = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  width: 100%;
  height: 100%;
  padding: 20px;
  box-sizing: border-box;

  .widget-link {
    color: inherit;
    text-decoration: none;
    display: flex;
    flex-direction: column;
    gap: 8px;
    margin-top: 8px;
  }
`;

const WidgetTitle = styled.div`
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--text-3);
  opacity: 0.9;
`;

const StatRow = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 14px;
  color: var(--text-2);

  svg {
    color: var(--main-color);
  }
`;

const StatValue = styled.span`
  font-size: 1.1rem;
  font-weight: 700;
  color: var(--text-1);
  min-width: 32px;
`;

const StatLabel = styled.span`
  font-size: 0.8rem;
`;

const ArticleName = styled.span`
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
`;

const ArticleMeta = styled.span`
  font-size: 0.75rem;
  color: var(--text-3);
`;

const Tags = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 14px;
`;

const TagChip = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 10px;
  border-radius: 999px;
  font-size: 0.75rem;
  background: color-mix(in srgb, var(--main-color) 10%, transparent);
  color: var(--main-color);

  small {
    font-size: 0.65rem;
    opacity: 0.75;
  }
`;

const MomentMeta = styled.span`
  font-size: 0.75rem;
  color: var(--text-3);
`;

const MomentText = styled.p`
  margin: 0;
  font-size: 0.9rem;
  line-height: 1.6;
  color: var(--text-2);
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
`;

const ViewAll = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 0.78rem;
  color: var(--main-color);
  margin-top: auto;
  padding-top: 8px;

  svg {
    transition: transform 0.2s ease;
  }
`;

/* 月份标题：左对齐与网格对齐，让出右上角的猫咪空间（卡片内容整体仍居中） */
const CalendarHeader = styled.div`
  align-self: flex-start;
  text-align: left;
  font-size: 0.8rem;
  font-weight: 700;
  letter-spacing: 0.04em;
  color: var(--main-color);
  margin-bottom: 6px;
`;

const WeekRow = styled.div`
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  margin-bottom: 4px;
`;

const WeekCell = styled.div`
  text-align: center;
  font-size: 0.62rem;
  font-weight: 600;
  color: var(--main-color);
  opacity: 0.6;
  padding: 1px 0;
`;

const DayGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 3px;
`;

const DayCell = styled.div<{ $has?: boolean; $today?: boolean }>`
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  height: 22px;
  font-size: 0.68rem;
  border-radius: 999px;
  color: var(--text-3);
  transition: all 0.15s ease;

  /* 可爱悬停：轻放大 + 粉底 */
  &:hover {
    background: color-mix(in srgb, var(--main-color) 8%, transparent);
    transform: scale(1.15);
  }

  ${props => props.$has && css`
    color: var(--text-1);
    font-weight: 600;
  `}

  /* 今天：实心粉色药丸 + 白色数字 + 柔光 */
  ${props => props.$today && css`
    background: var(--main-color);
    color: #fff;
    font-weight: 700;
    box-shadow: 0 2px 8px color-mix(in srgb, var(--main-color) 45%, transparent);
  `}
`;

const Dot = styled.span`
  position: absolute;
  bottom: 1px;
  left: 50%;
  transform: translateX(-50%);
  width: 3px;
  height: 3px;
  border-radius: 50%;
  background: var(--main-color);
`;
