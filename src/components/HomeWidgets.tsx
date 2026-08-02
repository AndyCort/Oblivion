import { useEffect, useMemo, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import styled, { css, keyframes } from 'styled-components';
import { Newspaper, Camera, Timer, ArrowRight, RefreshCw, RotateCcw, Sparkles } from 'lucide-react';
import { useLocale } from '../i18n/useLocale';
import { getLocalizedField } from '../i18n/utils';
import { getLocalMarkdownArticles } from '../api/mdArticles';
import { MOCK_ARTICLES } from '../api/articles';
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

/* ---------- 随机文章（Main 实用内容） ---------- */

export function RandomPost() {
  const { locale, t } = useLocale();
  const mdArticles = getLocalMarkdownArticles();
  const pool = mdArticles.length > 0 ? mdArticles : MOCK_ARTICLES;
  const [index, setIndex] = useState(() =>
    pool.length > 0 ? Math.floor(Math.random() * pool.length) : -1
  );

  if (pool.length === 0 || index < 0) return null;
  const article = pool[index];

  const shuffle = () => {
    if (pool.length < 2) return;
    let next = index;
    while (next === index) next = Math.floor(Math.random() * pool.length);
    setIndex(next);
  };

  return (
    <ContentCard>
      <WidgetTitle>{t('home.random.title')}</WidgetTitle>
      <FeaturedLink to={`/articles/${article.id}`}>
        <ArticleName>{getLocalizedField(article.title, locale)}</ArticleName>
        <ArticleMeta>{article.date}</ArticleMeta>
        <SummaryText>{getLocalizedField(article.summary, locale) || ''}</SummaryText>
      </FeaturedLink>
      <CardActions>
        <ViewAllLink to={`/articles/${article.id}`}>
          {t('home.random.read')}
          <ArrowRight size={12} />
        </ViewAllLink>
        <ShuffleButton onClick={shuffle}>
          <RefreshCw size={13} />
          {t('home.random.refresh')}
        </ShuffleButton>
      </CardActions>
    </ContentCard>
  );
}

/* ---------- 文章归档（Main 实用内容） ---------- */

export function ArchiveList() {
  const { t } = useLocale();
  const mdArticles = getLocalMarkdownArticles();
  const pool = mdArticles.length > 0 ? mdArticles : MOCK_ARTICLES;

  const yearCounts = new Map<string, number>();
  for (const article of pool) {
    const year = article.date.slice(0, 4);
    if (year) yearCounts.set(year, (yearCounts.get(year) ?? 0) + 1);
  }
  const rows = [...yearCounts.entries()].sort((a, b) => (a[0] < b[0] ? 1 : -1));
  if (rows.length === 0) return null;

  return (
    <ContentCard>
      <WidgetTitle>{t('home.archive.title')}</WidgetTitle>
      <ArchiveRows>
        {rows.map(([year, count]) => (
          <ArchiveRow key={year} to="/articles">
            <span>{year}</span>
            <small>{t('home.archive.count').replace('{{count}}', String(count))}</small>
          </ArchiveRow>
        ))}
      </ArchiveRows>
    </ContentCard>
  );
}

/* ---------- 公告（Main 实用内容） ---------- */

export function Announcement() {
  const { t } = useLocale();

  return (
    <ContentCard>
      <WidgetTitle>{t('home.announce.title')}</WidgetTitle>
      <CardText>{t('home.announce.content')}</CardText>
    </ContentCard>
  );
}

/* ---------- 算一卦（Main 趣味功能） ---------- */

type LineBit = 0 | 1;

interface Trigram {
  name: { zh: string; en: string };
  element: { zh: string; en: string };
}

// 以 1 为阳爻、0 为阴爻，从下往上计位
const TRIGRAMS: Record<number, Trigram> = {
  0b111: { name: { zh: '乾', en: 'Qian' }, element: { zh: '天', en: 'Heaven' } },
  0b110: { name: { zh: '兑', en: 'Dui' }, element: { zh: '泽', en: 'Lake' } },
  0b101: { name: { zh: '离', en: 'Li' }, element: { zh: '火', en: 'Fire' } },
  0b100: { name: { zh: '震', en: 'Zhen' }, element: { zh: '雷', en: 'Thunder' } },
  0b011: { name: { zh: '巽', en: 'Xun' }, element: { zh: '风', en: 'Wind' } },
  0b010: { name: { zh: '坎', en: 'Kan' }, element: { zh: '水', en: 'Water' } },
  0b001: { name: { zh: '艮', en: 'Gen' }, element: { zh: '山', en: 'Mountain' } },
  0b000: { name: { zh: '坤', en: 'Kun' }, element: { zh: '地', en: 'Earth' } },
};

const ORACLES = [
  { zh: '元亨利贞，诸事可谋，宜静待时机。', en: 'All is favorable. Plan well and wait for the right moment.' },
  { zh: '顺势而为，水到渠成，切忌冒进。', en: 'Follow the current and things will fall into place — do not rush.' },
  { zh: '守正得吉，小有波折，终归平顺。', en: 'Stay grounded; minor bumps, smooth finish.' },
  { zh: '潜龙勿用，养精蓄锐，以待天时。', en: 'The dragon rests below — gather strength and bide your time.' },
  { zh: '云开见日，否极泰来，好事将近。', en: 'Clouds part, the sun returns; good news is near.' },
  { zh: '进退维谷，宜缓不宜急，三思后行。', en: 'A fork in the road — move slowly and think twice.' },
  { zh: '谦受益，满招损，放低姿态自有福。', en: 'Humility invites fortune; lower your stance and blessings follow.' },
  { zh: '和风细雨，贵人相助，顺其自然。', en: 'Gentle breeze, helpful friends — go with the flow.' },
  { zh: '心中有光，路在脚下，砥砺前行。', en: 'Light within, path ahead — keep moving forward.' },
  { zh: '变通趋时，革故鼎新，正是行动之日。', en: 'Change brings renewal; today is the day to act.' },
];

interface HexState {
  lines: LineBit[];
  changing: number[];
  oracle: (typeof ORACLES)[number];
}

function castHex(): HexState {
  const lines = Array.from({ length: 6 }, (): LineBit => (Math.random() < 0.5 ? 0 : 1));
  const count = 1 + Math.floor(Math.random() * 2); // 1-2 个动爻
  const set = new Set<number>();
  while (set.size < count) set.add(Math.floor(Math.random() * 6));
  return {
    lines,
    changing: [...set].sort((a, b) => a - b),
    oracle: ORACLES[Math.floor(Math.random() * ORACLES.length)],
  };
}

function trigramValue(lines: LineBit[]): number {
  let value = 0;
  for (let i = 0; i < lines.length; i++) {
    value += lines[i] << i;
  }
  return value;
}

function hexagramName(upper: Trigram, lower: Trigram, isZh: boolean): string {
  if (upper === lower) {
    return isZh
      ? `${upper.name.zh}为${upper.element.zh}`
      : `${upper.element.en} · ${upper.element.en}`;
  }
  return isZh ? `${upper.element.zh}${lower.element.zh}` : `${upper.element.en} · ${lower.element.en}`;
}

export function Divination() {
  const { locale, t } = useLocale();
  const isZh = locale === 'zh-CN';
  const [hex, setHex] = useState<HexState>(() => castHex());
  const [animKey, setAnimKey] = useState(0);

  const cast = () => {
    setHex(castHex());
    setAnimKey((k) => k + 1);
  };

  const upper = TRIGRAMS[trigramValue(hex.lines.slice(3))];
  const lower = TRIGRAMS[trigramValue(hex.lines.slice(0, 3))];
  const name = hexagramName(upper, lower, isZh);

  const transformed = hex.lines.map((bit, i): LineBit =>
    hex.changing.includes(i) ? (1 - bit) as LineBit : bit,
  );
  const tUpper = TRIGRAMS[trigramValue(transformed.slice(3))];
  const tLower = TRIGRAMS[trigramValue(transformed.slice(0, 3))];
  const transformedName = hexagramName(tUpper, tLower, isZh);

  return (
    <ContentCard>
      <WidgetTitle>{t('home.divine.title')}</WidgetTitle>
      <HexagramPair>
        <HexagramBox key={`orig-${animKey}`}>
          <HexLabel>{t('home.divine.original')}</HexLabel>
          {[...hex.lines].reverse().map((bit, i) => {
            const moving = hex.changing.includes(5 - i);
            return (
              <HexLine key={i} $delay={i * 0.07} $moving={moving}>
                <Bar $yin={bit === 0} />
                {moving && <MoveMark />}
              </HexLine>
            );
          })}
          <HexName>{name}</HexName>
        </HexagramBox>
        <HexagramBox key={`trans-${animKey}`}>
          <HexLabel>{t('home.divine.transformed')}</HexLabel>
          {[...transformed].reverse().map((bit, i) => (
            <HexLine key={i} $delay={i * 0.07} $moving={false}>
              <Bar $yin={bit === 0} />
            </HexLine>
          ))}
          <HexName>{transformedName}</HexName>
        </HexagramBox>
      </HexagramPair>
      <HexOracle>
        <HexOracleLabel>{t('home.divine.oracle')}</HexOracleLabel>
        {isZh ? hex.oracle.zh : hex.oracle.en}
      </HexOracle>
      <HexMeta>
        <span>{t('home.divine.moving')}：{hex.changing.map((n) => n + 1).join(' / ')}</span>
      </HexMeta>
      <CardActions>
        <ShuffleButton onClick={cast}>
          <Sparkles size={13} />
          {t('home.divine.cast')}
        </ShuffleButton>
      </CardActions>
    </ContentCard>
  );
}

/* ---------- 井字棋（Main 趣味功能） ---------- */

const WIN_LINES = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8],
  [0, 3, 6], [1, 4, 7], [2, 5, 8],
  [0, 4, 8], [2, 4, 6],
];

type CellValue = 'X' | 'O' | null;

function checkWinner(board: CellValue[]): CellValue {
  for (const [a, b, c] of WIN_LINES) {
    if (board[a] && board[a] === board[b] && board[a] === board[c]) return board[a];
  }
  return null;
}

export function TicTacToe() {
  const { t } = useLocale();
  const [board, setBoard] = useState<CellValue[]>(Array(9).fill(null));
  const [isX, setIsX] = useState(true);
  const [winner, setWinner] = useState<CellValue>(null);
  const [draw, setDraw] = useState(false);
  const [aiThinking, setAiThinking] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const reset = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = null;
    setBoard(Array(9).fill(null));
    setIsX(true);
    setWinner(null);
    setDraw(false);
    setAiThinking(false);
  };

  const aiMove = (current: CellValue[]) => {
    const empty = current.map((v, i) => (v === null ? i : -1)).filter((i) => i >= 0);
    if (empty.length === 0) return;
    const next = [...current];
    next[empty[Math.floor(Math.random() * empty.length)]] = 'O';
    setBoard(next);
    setAiThinking(false);
    setIsX(true);
    const w = checkWinner(next);
    if (w) setWinner(w);
    else if (!next.includes(null)) setDraw(true);
  };

  const play = (index: number) => {
    if (board[index] || winner || draw || aiThinking || !isX) return;
    const next = [...board];
    next[index] = 'X';
    setBoard(next);
    const w = checkWinner(next);
    if (w) {
      setWinner(w);
      return;
    }
    if (!next.includes(null)) {
      setDraw(true);
      return;
    }
    setIsX(false);
    setAiThinking(true);
    timerRef.current = setTimeout(() => aiMove(next), 350);
  };

  const nameOf = (p: Exclude<CellValue, null>) => (p === 'X' ? t('home.game.you') : t('home.game.ai'));
  const status = winner
    ? t('home.game.win').replace('{{player}}', nameOf(winner))
    : draw
      ? t('home.game.draw')
      : t('home.game.turn').replace('{{player}}', nameOf(isX ? 'X' : 'O'));

  return (
    <ContentCard>
      <WidgetTitle>{t('home.game.title')}</WidgetTitle>
      <GameStatus>{status}</GameStatus>
      <GameBoard>
        {board.map((cell, index) => (
          <GameCell
            key={index}
            onClick={() => play(index)}
            disabled={!!cell || !!winner || draw || aiThinking || !isX}
          >
            {cell}
          </GameCell>
        ))}
      </GameBoard>
      <CardActions>
        <ShuffleButton onClick={reset}>
          <RotateCcw size={13} />
          {t('home.game.reset')}
        </ShuffleButton>
      </CardActions>
    </ContentCard>
  );
}

/* ---------- 文章展示（Main 展示类内容） ---------- */

export function RecentPosts() {
  const { locale, t } = useLocale();
  const mdArticles = getLocalMarkdownArticles();
  const articles = (mdArticles.length > 0 ? mdArticles : MOCK_ARTICLES).slice(0, 4);
  if (articles.length === 0) return null;

  return (
    <ContentCard>
      <WidgetTitle>{t('home.posts.title')}</WidgetTitle>
      <PostGrid>
        {articles.map((article) => (
          <PostCard key={article.id} to={`/articles/${article.id}`}>
            <PostTitle>{getLocalizedField(article.title, locale)}</PostTitle>
            <PostMeta>
              <span>{article.date}</span>
              {(article.tags ?? []).slice(0, 3).map((tag) => (
                <PostTag key={tag}>{tag}</PostTag>
              ))}
            </PostMeta>
            <PostSummary>{getLocalizedField(article.summary, locale) || ''}</PostSummary>
          </PostCard>
        ))}
      </PostGrid>
      <ViewAllLink to="/articles">
        {t('home.posts.viewAll')}
        <ArrowRight size={12} />
      </ViewAllLink>
    </ContentCard>
  );
}

/* ---------- 写作统计（Main 展示类内容） ---------- */

export function WritingStats() {
  const { locale, t } = useLocale();
  const mdArticles = getLocalMarkdownArticles();
  const articles = mdArticles.length > 0 ? mdArticles : MOCK_ARTICLES;
  if (articles.length === 0) return null;

  const totalChars = articles.reduce(
    (sum, article) => sum + getLocalizedField(article.content, locale).length,
    0,
  );
  const tags = new Set<string>();
  for (const article of articles) {
    for (const tag of article.tags ?? []) tags.add(tag);
  }

  const rows = [
    { label: t('home.writing.posts'), value: String(articles.length) },
    {
      label: t('home.writing.chars'),
      value: totalChars.toLocaleString(locale === 'zh-CN' ? 'zh-CN' : 'en-US'),
    },
    { label: t('home.writing.tags'), value: String(tags.size) },
    { label: t('home.writing.latest'), value: articles[0]?.date ?? '-' },
  ];

  return (
    <ContentCard>
      <WidgetTitle>{t('home.writing.title')}</WidgetTitle>
      <InfoRows>
        {rows.map((row) => (
          <InfoRow key={row.label}>
            <span>{row.label}</span>
            <strong>{row.value}</strong>
          </InfoRow>
        ))}
      </InfoRows>
    </ContentCard>
  );
}

/* ---------- 标签墙（Main 展示类内容） ---------- */

export function TagWall() {
  const { t } = useLocale();
  const mdArticles = getLocalMarkdownArticles();
  const articles = mdArticles.length > 0 ? mdArticles : MOCK_ARTICLES;

  const counts = new Map<string, number>();
  for (const article of articles) {
    for (const tag of article.tags ?? []) counts.set(tag, (counts.get(tag) ?? 0) + 1);
  }
  const tags = [...counts.entries()].sort((a, b) => b[1] - a[1]);
  if (tags.length === 0) return null;
  const max = tags[0][1];

  return (
    <ContentCard>
      <WidgetTitle>{t('home.tagsWall.title')}</WidgetTitle>
      <TagWallBox>
        {tags.map(([tag, count]) => (
          <TagWallChip key={tag} $scale={0.75 + (count / max) * 0.65}>
            {tag}
            <small>{count}</small>
          </TagWallChip>
        ))}
      </TagWallBox>
    </ContentCard>
  );
}

/* ---------- 逐字一言（Main 创意展示） ---------- */

const QUOTES = [
  { zh: '纸上得来终觉浅，绝知此事要躬行。', en: 'What you get on paper is shallow; true knowledge comes from practice.' },
  { zh: '星光不问赶路人，时光不负有心人。', en: 'The stars do not ask where travelers head; time rewards the devoted.' },
  { zh: '人生如逆旅，我亦是行人。', en: 'Life is a journey against the wind, and I am but a traveler.' },
  { zh: '仰望星空，脚踏实地。', en: 'Look to the stars, but keep your feet on the ground.' },
  { zh: '万物皆有裂痕，那是光照进来的地方。', en: 'There is a crack in everything — that is how the light gets in.' },
  { zh: '心之所向，素履以往。', en: 'Where the heart leads, follow even in plain shoes.' },
];

export function TypewriterQuote() {
  const { locale, t } = useLocale();
  const isZh = locale === 'zh-CN';
  const [index, setIndex] = useState(0);
  const [text, setText] = useState('');
  const [deleting, setDeleting] = useState(false);

  const quote = isZh ? QUOTES[index].zh : QUOTES[index].en;

  useEffect(() => {
    let delay = deleting ? 22 : 60;
    if (!deleting && text === quote) delay = 2600; // 完整显示后停留
    const timer = setTimeout(() => {
      if (!deleting) {
        if (text.length < quote.length) {
          setText(quote.slice(0, text.length + 1));
        } else {
          setDeleting(true);
        }
      } else if (text.length > 0) {
        setText(quote.slice(0, text.length - 1));
      } else {
        setDeleting(false);
        setIndex((i) => (i + 1) % QUOTES.length);
      }
    }, delay);
    return () => clearTimeout(timer);
  }, [text, deleting, quote]);

  const skip = () => {
    setDeleting(false);
    setText('');
    setIndex((i) => (i + 1) % QUOTES.length);
  };

  return (
    <ContentCard>
      <WidgetTitle>{t('home.typewriter.title')}</WidgetTitle>
      <TypeArea>
        <TypeText>
          {text}
          <Caret />
        </TypeText>
      </TypeArea>
      <CardActions>
        <ShuffleButton onClick={skip}>
          <RefreshCw size={13} />
          {t('home.typewriter.next')}
        </ShuffleButton>
      </CardActions>
    </ContentCard>
  );
}

/* ---------- 世界时钟（Main 创意展示） ---------- */

const CLOCK_CITIES = [
  { name: { zh: '北京', en: 'Beijing' }, tz: 'Asia/Shanghai', flag: '🇨🇳' },
  { name: { zh: '东京', en: 'Tokyo' }, tz: 'Asia/Tokyo', flag: '🇯🇵' },
  { name: { zh: '伦敦', en: 'London' }, tz: 'Europe/London', flag: '🇬🇧' },
  { name: { zh: '纽约', en: 'New York' }, tz: 'America/New_York', flag: '🇺🇸' },
  { name: { zh: '悉尼', en: 'Sydney' }, tz: 'Australia/Sydney', flag: '🇦🇺' },
];

export function WorldClock() {
  const { locale, t } = useLocale();
  const isZh = locale === 'zh-CN';
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <ContentCard>
      <WidgetTitle>{t('home.clock.title')}</WidgetTitle>
      <ClockList>
        {CLOCK_CITIES.map((city) => (
          <ClockRow key={city.tz}>
            <ClockCity>
              <span>{city.flag}</span>
              {isZh ? city.name.zh : city.name.en}
            </ClockCity>
            <ClockTime>
              {new Intl.DateTimeFormat('zh-CN', {
                timeZone: city.tz,
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
                hour12: false,
              }).format(now)}
            </ClockTime>
          </ClockRow>
        ))}
      </ClockList>
    </ContentCard>
  );
}

/* ---------- 流星许愿（Main 创意展示） ---------- */

const STAR_POSITIONS = [
  { top: 16, left: 14, delay: 0 },
  { top: 30, left: 64, delay: 0.9 },
  { top: 12, left: 78, delay: 1.6 },
  { top: 52, left: 22, delay: 2.2 },
  { top: 62, left: 86, delay: 0.4 },
];

export function MeteorWish() {
  const { t } = useLocale();
  const [wishes, setWishes] = useState(0);
  const [burst, setBurst] = useState(0);

  const makeWish = () => {
    setWishes((w) => w + 1);
    setBurst((b) => b + 1);
  };

  const meteors = useMemo(
    () =>
      Array.from({ length: 6 }, (_, i) => ({
        id: i,
        top: 6 + Math.random() * 55,
        delay: Math.random() * 5,
        duration: 1.5 + Math.random() * 1.3,
      })),
    [burst],
  );

  return (
    <ContentCard>
      <WidgetTitle>{t('home.meteor.title')}</WidgetTitle>
      <MeteorSky key={burst}>
        {STAR_POSITIONS.map((star, i) => (
          <SkyStar key={i} $top={star.top} $left={star.left} $delay={star.delay} />
        ))}
        {meteors.map((m) => (
          <Meteor key={`${burst}-${m.id}`} $top={m.top} $delay={m.delay} $duration={m.duration} />
        ))}
      </MeteorSky>
      <CardText>{t('home.meteor.hint')}</CardText>
      <CardActions>
        <WishCount>{t('home.meteor.count').replace('{{count}}', String(wishes))}</WishCount>
        <ShuffleButton onClick={makeWish}>
          <Sparkles size={13} />
          {t('home.meteor.wish')}
        </ShuffleButton>
      </CardActions>
    </ContentCard>
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

/* ---------- 主内容区块（home-content）样式 ---------- */

const ContentCard = styled.div`
  width: 100%;
  padding: 28px 32px;
  display: flex;
  flex-direction: column;
  gap: 14px;
  box-sizing: border-box;
`;

const FeaturedLink = styled(Link)`
  color: inherit;
  text-decoration: none;
  display: flex;
  flex-direction: column;
  gap: 6px;

  &:hover ${ArticleName} {
    color: var(--main-color);
  }
`;

const SummaryText = styled.span`
  font-size: 0.85rem;
  color: var(--text-2);
  line-height: 1.7;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
`;

const ViewAllLink = styled(Link)`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  width: fit-content;
  color: var(--main-color);
  font-size: 0.85rem;
  font-weight: 600;
  text-decoration: none;
  transition: gap 0.2s ease;

  &:hover {
    gap: 10px;
  }
`;

const CardText = styled.p`
  color: var(--text-2);
  line-height: 1.9;
  font-size: 0.95rem;
  margin: 0;
`;

const CardActions = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-top: 4px;
`;

const ShuffleButton = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  border: var(--border);
  border-radius: 999px;
  background: transparent;
  color: var(--text-2);
  font-size: 0.8rem;
  font-family: var(--content-font);
  cursor: pointer;
  transition: all 0.2s ease;

  svg {
    color: var(--main-color);
  }

  &:hover {
    color: var(--main-color);
    border-color: var(--main-color);
    transform: translateY(-1px);
  }
`;

const ArchiveRows = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const ArchiveRow = styled(Link)`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 14px;
  border: var(--border);
  border-radius: 12px;
  color: var(--text-2);
  font-size: 0.95rem;
  text-decoration: none;
  transition: all 0.2s ease;

  span {
    font-weight: 600;
    color: var(--text-1);
  }

  small {
    color: var(--text-3);
  }

  &:hover {
    color: var(--main-color);
    border-color: var(--main-color);
    transform: translateY(-1px);
  }
`;

/* ---------- 算一卦 / 井字棋 样式 ---------- */

const lineRise = keyframes`
  from {
    opacity: 0;
    transform: translateY(6px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const HexagramPair = styled.div`
  display: flex;
  align-items: stretch;
  gap: 14px;
  width: 100%;
`;

const HexagramBox = styled.div`
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  padding: 12px 10px;
  border: var(--border);
  border-radius: 14px;
  background: color-mix(in srgb, var(--main-color) 4%, transparent);
`;

const HexLabel = styled.div`
  font-size: 0.68rem;
  font-weight: 700;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--text-3);
`;

const HexLine = styled.div<{ $delay: number; $moving: boolean }>`
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  max-width: 200px;
  height: 12px;
  opacity: 0;
  animation: ${lineRise} 0.35s ease ${(props) => props.$delay}s forwards;
`;

const Bar = styled.span<{ $yin: boolean }>`
  display: flex;
  justify-content: space-between;
  width: 58%;
  height: 10px;

  &::before,
  &::after {
    content: '';
    height: 10px;
    border-radius: 3px;
    background: var(--text-1);
  }

  &::before {
    width: ${(props) => (props.$yin ? '44%' : '100%')};
  }

  &::after {
    display: ${(props) => (props.$yin ? 'block' : 'none')};
    width: 44%;
  }
`;

const markPulse = keyframes`
  0%, 100% {
    transform: translateY(-50%) scale(1);
    opacity: 0.7;
  }
  50% {
    transform: translateY(-50%) scale(1.35);
    opacity: 1;
  }
`;

const MoveMark = styled.span`
  position: absolute;
  right: 2%;
  top: 50%;
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--main-color);
  box-shadow: 0 0 10px 2px color-mix(in srgb, var(--main-color) 70%, transparent);
  animation: ${markPulse} 1.2s ease-in-out infinite;
`;

const HexName = styled.div`
  text-align: center;
  font-family: var(--title-font);
  font-size: 1.05rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  color: var(--main-color);
`;

const HexOracle = styled.p`
  margin: 0;
  color: var(--text-2);
  line-height: 1.9;
  font-size: 0.95rem;
`;

const HexOracleLabel = styled.span`
  display: inline-block;
  margin-right: 8px;
  padding: 2px 10px;
  border-radius: 999px;
  font-size: 0.7rem;
  font-weight: 700;
  background: color-mix(in srgb, var(--main-color) 12%, transparent);
  color: var(--main-color);
  vertical-align: 1px;
`;

const HexMeta = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 6px 14px;
  font-size: 0.78rem;
  color: var(--text-3);
`;

const GameStatus = styled.div`
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--text-2);
  min-height: 1.4em;
`;

const GameBoard = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
  width: 100%;
  max-width: 260px;
  margin: 0 auto;
`;

const GameCell = styled.button`
  aspect-ratio: 1 / 1;
  border: var(--border);
  border-radius: 12px;
  background: color-mix(in srgb, var(--main-color) 5%, transparent);
  color: var(--text-1);
  font-family: var(--title-font);
  font-size: 1.6rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.15s ease;

  &:not(:disabled):hover {
    border-color: var(--main-color);
    transform: translateY(-1px);
  }

  &:disabled {
    cursor: default;
  }
`;

/* ---------- 文章展示 / 写作统计 / 标签墙 样式 ---------- */

const PostGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(230px, 1fr));
  gap: 14px;
`;

const PostCard = styled(Link)`
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 16px 18px;
  border: var(--border);
  border-radius: 14px;
  color: inherit;
  text-decoration: none;
  background: color-mix(in srgb, var(--main-color) 3%, transparent);
  transition: all 0.2s ease;

  &:hover {
    border-color: var(--main-color);
    transform: translateY(-2px);
  }
`;

const PostTitle = styled.h3`
  margin: 0;
  font-size: 0.95rem;
  font-weight: 700;
  color: var(--text-1);
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
`;

const PostMeta = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
  font-size: 0.72rem;
  color: var(--text-3);
`;

const PostTag = styled.span`
  padding: 2px 8px;
  border-radius: 999px;
  font-size: 0.65rem;
  background: color-mix(in srgb, var(--main-color) 10%, transparent);
  color: var(--main-color);
`;

const PostSummary = styled.p`
  margin: 0;
  font-size: 0.8rem;
  color: var(--text-2);
  line-height: 1.6;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
`;

const InfoRows = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const InfoRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 14px;
  border: var(--border);
  border-radius: 12px;
  font-size: 0.85rem;
  color: var(--text-2);

  strong {
    font-size: 1.05rem;
    color: var(--text-1);
  }
`;

const TagWallBox = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  align-content: flex-start;
`;

const TagWallChip = styled.span<{ $scale: number }>`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 14px;
  border-radius: 999px;
  border: var(--border);
  font-size: ${(props) => `calc(0.78rem * ${props.$scale})`};
  background: color-mix(in srgb, var(--main-color) 10%, transparent);
  color: var(--main-color);

  small {
    font-size: 0.65rem;
    opacity: 0.75;
  }
`;

/* ---------- 逐字一言 / 世界时钟 / 流星许愿 样式 ---------- */

const TypeArea = styled.div`
  min-height: 72px;
  display: flex;
  align-items: center;
  padding: 14px 16px;
  border: var(--border);
  border-radius: 14px;
  background: color-mix(in srgb, var(--main-color) 4%, transparent);
`;

const TypeText = styled.p`
  margin: 0;
  font-size: 0.95rem;
  line-height: 1.8;
  color: var(--text-1);
  font-weight: 600;
  font-family: var(--title-font);
`;

const caretBlink = keyframes`
  0%, 49% { opacity: 1; }
  50%, 100% { opacity: 0; }
`;

const Caret = styled.span`
  display: inline-block;
  width: 2px;
  height: 1.05em;
  margin-left: 3px;
  vertical-align: -0.15em;
  background: var(--main-color);
  animation: ${caretBlink} 0.9s step-end infinite;
`;

const ClockList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const ClockRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 9px 14px;
  border: var(--border);
  border-radius: 12px;
  transition: border-color 0.2s ease;

  &:hover {
    border-color: var(--main-color);
  }
`;

const ClockCity = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-size: 0.88rem;
  font-weight: 600;
  color: var(--text-1);

  span {
    font-size: 1rem;
  }
`;

const ClockTime = styled.span`
  font-family: var(--title-font);
  font-size: 1rem;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
  letter-spacing: 0.06em;
  color: var(--main-color);
`;

const MeteorSky = styled.div`
  position: relative;
  height: 150px;
  border: var(--border);
  border-radius: 14px;
  overflow: hidden;
  background:
    radial-gradient(ellipse at 72% 18%, color-mix(in srgb, var(--main-color) 14%, transparent), transparent 62%),
    color-mix(in srgb, var(--main-color) 4%, transparent);
`;

const starTwinkle = keyframes`
  0%, 100% { opacity: 0.25; transform: scale(0.8); }
  50% { opacity: 1; transform: scale(1.2); }
`;

const SkyStar = styled.span<{ $top: number; $left: number; $delay: number }>`
  position: absolute;
  top: ${(props) => props.$top}%;
  left: ${(props) => props.$left}%;
  width: 3px;
  height: 3px;
  border-radius: 50%;
  background: #fff;
  box-shadow: 0 0 6px 1px color-mix(in srgb, var(--main-color) 70%, #fff);
  animation: ${starTwinkle} 2.6s ease-in-out ${(props) => props.$delay}s infinite;
`;

const meteorFly = keyframes`
  0% {
    transform: translate(0, 0) rotate(-32deg);
    opacity: 0;
  }
  6% {
    opacity: 1;
  }
  100% {
    transform: translate(-300px, 190px) rotate(-32deg);
    opacity: 0;
  }
`;

const Meteor = styled.span<{ $top: number; $delay: number; $duration: number }>`
  position: absolute;
  top: ${(props) => props.$top}%;
  left: 112%;
  width: 96px;
  height: 2px;
  border-radius: 2px;
  background: linear-gradient(to left, #fff, transparent);
  opacity: 0;
  animation: ${meteorFly} ${(props) => props.$duration}s linear ${(props) => props.$delay}s infinite;

  &::after {
    content: '';
    position: absolute;
    right: 0;
    top: -2.5px;
    width: 7px;
    height: 7px;
    border-radius: 50%;
    background: #fff;
    box-shadow: 0 0 12px 3px color-mix(in srgb, var(--main-color) 75%, #fff);
  }
`;

const WishCount = styled.span`
  font-size: 0.8rem;
  color: var(--text-3);
`;
