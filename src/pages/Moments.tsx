import { useEffect, useMemo, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import styled from 'styled-components';
import MainLayout from '../layouts/MainLayout';
import MomentList from '../components/moments/MomentList';
import { useLocale } from '../i18n/useLocale';
import { useMoments } from '../hooks/useMoments';
import { Camera, X } from 'lucide-react';

export default function Moments() {
  const { t, siteName } = useLocale();
  const { moments, loading, error, retry } = useMoments();
  const [searchParams, setSearchParams] = useSearchParams();
  const filterRef = useRef<HTMLDivElement>(null);
  const titleText = t('moments.title');

  useEffect(() => {
    document.title = `${titleText} — ${siteName}`;
  }, [titleText, siteName]);

  const tags = useMemo(() => {
    const counts = new Map<string, number>();
    for (const moment of moments) {
      for (const tag of moment.tags) counts.set(tag, (counts.get(tag) ?? 0) + 1);
    }
    return Array.from(counts).sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));
  }, [moments]);

  const photoCount = useMemo(
    () => moments.reduce((sum, moment) => sum + moment.media.filter((media) => media.type === 'image').length, 0),
    [moments],
  );

  const activeTag = searchParams.get('tag') ?? '';
  const visibleMoments = useMemo(
    () => (activeTag ? moments.filter((moment) => moment.tags.includes(activeTag)) : moments),
    [moments, activeTag],
  );

  const setTag = (tag: string) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      if (tag) next.set('tag', tag);
      else next.delete('tag');
      return next;
    }, { replace: true });
  };

  // 卡片内点击标签：切换筛选并回到筛选栏
  const selectTagFromCard = (tag: string) => {
    setTag(tag === activeTag ? '' : tag);
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    filterRef.current?.scrollIntoView({ behavior: reduceMotion ? 'instant' : 'smooth', block: 'start' });
  };

  const ready = !loading && !error;
  const stats = [
    { label: t('moments.statPosts'), value: moments.length },
    { label: t('moments.statPhotos'), value: photoCount },
    { label: t('moments.statTags'), value: tags.length },
  ];

  return (
    <MainLayout>
      <MomentsPage className="moments-page">
        <header className="moment-header">
          <div className="moment-heading">
            <h1 className="moment-title">
              <Camera className="moment-title-icon" size="1em" aria-hidden="true" />
              {titleText}
            </h1>
            <p className="moment-subtitle">{t('moments.subtitle')}</p>
          </div>

          {ready && moments.length > 0 && (
            <dl className="moment-stats">
              {stats.map(({ label, value }) => (
                <div key={label}>
                  <dt>{label}</dt>
                  <dd>{value}</dd>
                </div>
              ))}
            </dl>
          )}
        </header>

        {ready && tags.length > 0 && (
          <div className="moment-filter" ref={filterRef} role="group" aria-label={t('moments.filterByTag')}>
            <button type="button" aria-pressed={!activeTag} onClick={() => setTag('')}>
              {t('moments.allTags')}
              <span className="filter-count">{moments.length}</span>
            </button>
            {tags.map(([tag, count]) => (
              <button
                key={tag}
                type="button"
                aria-pressed={activeTag === tag}
                onClick={() => setTag(activeTag === tag ? '' : tag)}
              >
                #{tag}
                <span className="filter-count">{count}</span>
              </button>
            ))}
          </div>
        )}

        {loading ? (
          <div className="moment-state" role="status">
            <span className="moment-spinner" aria-hidden="true" />
            <p>{t('moments.loading')}</p>
          </div>
        ) : error ? (
          <div className="moment-state" role="alert">
            <p>{t('moments.failed')}</p>
            <button type="button" className="moment-state-btn" onClick={() => void retry()}>{t('moments.retry')}</button>
          </div>
        ) : activeTag && visibleMoments.length === 0 ? (
          <div className="moment-state">
            <p>{t('moments.noMatches')}</p>
            <button type="button" className="moment-state-btn" onClick={() => setTag('')}>
              <X size={14} aria-hidden="true" />
              {t('moments.clearFilter')}
            </button>
          </div>
        ) : (
          <MomentList moments={visibleMoments} activeTag={activeTag} onTagSelect={selectTagFromCard} />
        )}
      </MomentsPage>
    </MainLayout>
  );
}

const MomentsPage = styled.main`
  padding: 120px 20px 80px;
  max-width: 720px;
  margin: 0 auto;
  min-height: 100vh;
  min-height: 100svh;
  position: relative;
  z-index: 10;

  @media (max-width: 40rem) {
    padding: 100px 16px 60px;
  }

  .moment-header {
    display: grid;
    justify-items: center;
    gap: 20px;
    text-align: center;
    margin-bottom: 28px;
  }

  .moment-title {
    font-size: var(--text-page-title);
    font-weight: var(--weight-strong);
    font-family: var(--title-font);
    color: var(--main-color);
    margin: 0 0 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 12px;
    line-height: var(--leading-heading);
    overflow-wrap: anywhere;
  }

  .moment-title-icon {
    flex-shrink: 0;
    opacity: 0.9;
  }

  .moment-subtitle {
    font-size: var(--text-body);
    color: var(--text-2);
    font-family: var(--content-font);
    max-width: 500px;
    margin: 0 auto;
  }

  .moment-stats {
    display: flex;
    margin: 0;

    > div {
      display: flex;
      flex-direction: column-reverse;
      align-items: center;
      gap: 2px;
      padding: 0 22px;

      & + div { border-left: 1px solid color-mix(in srgb, var(--text-2) 24%, transparent); }
    }

    dd {
      margin: 0;
      color: var(--text-1);
      font-family: var(--title-font);
      font-size: 1.5rem;
      font-weight: var(--weight-strong);
      font-variant-numeric: tabular-nums;
      line-height: 1.1;
    }

    dt {
      color: var(--text-3);
      font-size: var(--text-caption);
    }
  }

  .moment-filter {
    display: flex;
    gap: 8px;
    margin: 0 -20px 28px;
    padding: 4px 20px;
    overflow-x: auto;
    scroll-margin-top: 86px;
    scrollbar-width: none;
    mask-image: linear-gradient(90deg, transparent, #000 20px, #000 calc(100% - 20px), transparent);
    &::-webkit-scrollbar { display: none; }

    @media (max-width: 40rem) {
      margin-inline: -16px;
      padding-inline: 16px;
    }

    button {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      flex-shrink: 0;
      min-height: 36px;
      padding: 0 14px;
      border: var(--border);
      border-radius: 999px;
      background: var(--bg-1);
      color: var(--text-2);
      font-size: var(--text-meta);
      white-space: nowrap;
      cursor: pointer;
      transition: color 0.2s ease, background-color 0.2s ease, border-color 0.2s ease;

      &:hover { color: var(--text-1); border-color: color-mix(in srgb, var(--main-color) 50%, transparent); }
      &:focus-visible { outline: 2px solid var(--main-color); outline-offset: 2px; }

      &[aria-pressed="true"] {
        border-color: var(--main-color);
        background: var(--main-color);
        color: var(--on-main);
      }
    }

    .filter-count {
      font-size: var(--text-caption);
      font-variant-numeric: tabular-nums;
      opacity: 0.7;
    }
  }

  .moment-state {
    display: grid;
    justify-items: center;
    gap: 14px;
    padding: 64px 20px;
    color: var(--text-2);
    text-align: center;

    p { margin: 0; }
  }

  .moment-state-btn {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    min-height: 40px;
    padding: 0 18px;
    border: 1px solid var(--main-color);
    border-radius: 999px;
    background: transparent;
    color: var(--main-color);
    cursor: pointer;

    &:hover { background: color-mix(in srgb, var(--main-color) 12%, transparent); }
    &:focus-visible { outline: 2px solid var(--main-color); outline-offset: 2px; }
  }

  .moment-spinner {
    width: 28px;
    height: 28px;
    border: 3px solid color-mix(in srgb, var(--main-color) 25%, transparent);
    border-top-color: var(--main-color);
    border-radius: 50%;

    @media (prefers-reduced-motion: no-preference) {
      animation: moment-spin 0.9s linear infinite;
    }
  }

  @keyframes moment-spin { to { transform: rotate(360deg); } }

  @media (min-width: 62.5rem) {
    max-width: 1080px;
    padding-top: 104px;

    .moment-header {
      grid-template-columns: minmax(0, 1fr) auto;
      align-items: end;
      justify-items: stretch;
      text-align: left;
      padding-bottom: 20px;
      border-bottom: 1px solid color-mix(in srgb, var(--text-2) 24%, transparent);
      margin-bottom: 20px;
    }

    .moment-title { justify-content: flex-start; }
    .moment-subtitle { margin: 0; }
    .moment-stats > div:last-child { padding-right: 0; }

    /* 与时间轴列对齐 */
    .moment-filter {
      margin: 0 0 32px calc(max(8rem, 100% - 45.5rem - 112px) + 112px);
      padding: 0;
      flex-wrap: wrap;
      overflow: visible;
      mask-image: none;
    }
  }
`;
