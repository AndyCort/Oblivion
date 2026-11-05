import { useState } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { useLocale } from '../../i18n/useLocale';
import { getLocalizedField, type Locale } from '../../i18n/utils';
import type { Moment } from '../../api/moments';
import { readStorage, writeStorage } from '../../utils/storage';
import { Clock, MapPin, Heart, Share2, Check, Music2 } from 'lucide-react';

const LIKED_KEY = (id: string) => `moment-liked:${id}`;

function formatCount(n: number, locale: Locale): string {
  if (n < 10000) return String(n);
  return Intl.NumberFormat(locale === 'zh-CN' ? 'zh-CN' : 'en-US', { notation: 'compact' }).format(n);
}

interface Props {
  moments: Moment[];
}

export default function MomentList({ moments }: Props) {
  const { locale, t } = useLocale();

  if (moments.length === 0) {
    return (
      <MomentListContainer>
        <div className="moment-empty-state" data-card>
          <p>{t('moments.empty')}</p>
        </div>
      </MomentListContainer>
    );
  }

  return (
    <MomentListContainer>
      <ol className="moment-timeline">
        {moments.map((moment, index) => (
          <li key={moment.id} className="moment-item">
            {/* 轨道：轴线与节点共用同一个中心，保证对齐 */}
            <div className="moment-rail" aria-hidden="true">
              <div className="moment-rail-line" />
              <div className="moment-dot" />
            </div>
            <MomentCard moment={moment} locale={locale} index={index} />
          </li>
        ))}
      </ol>
    </MomentListContainer>
  );
}

function MomentCard({ moment, locale, index }: { moment: Moment; locale: Locale; index: number }) {
  const { t } = useLocale();
  const [likes, setLikes] = useState(() => moment.likes + (readStorage(LIKED_KEY(moment.id)) === '1' ? 1 : 0));
  const [isLiked, setIsLiked] = useState(() => readStorage(LIKED_KEY(moment.id)) === '1');
  const [shared, setShared] = useState(false);

  const toggleLike = () => {
    const next = !isLiked;
    setIsLiked(next);
    setLikes((l) => Math.max(0, l + (next ? 1 : -1)));
    writeStorage(LIKED_KEY(moment.id), next ? '1' : '0');
  };

  const handleShare = async () => {
    const text = `「${getLocalizedField(moment.content, locale)}」 ${moment.date} · ${moment.location}`;
    try {
      if (navigator.share) {
        await navigator.share({ text });
        return;
      }
      await navigator.clipboard.writeText(text);
      setShared(true);
      setTimeout(() => setShared(false), 1500);
    } catch {
      // 用户取消分享或复制失败，静默处理
    }
  };

  return (
    <motion.article
      className="moment-card"
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.5, delay: Math.min(index * 0.06, 0.3) }}
      data-card
    >
      <header className="moment-meta">
        <time className="moment-date">
          <Clock size={14} /> {moment.date}
        </time>
        {moment.location && (
          <span className="moment-badge">
            <MapPin size={14} /> {moment.location}
          </span>
        )}
        {moment.mood && <span className="moment-badge mood">{moment.mood}</span>}
      </header>

      <div className="moment-content">
        <p>{getLocalizedField(moment.content, locale)}</p>
      </div>

      {moment.media.length > 0 && (
        <div className="moment-media-grid">
          {moment.media.map((media, mediaIndex) => media.type === 'image' ? (
            <img key={`${media.url}-${mediaIndex}`} src={media.url} alt={t('moments.image')} loading="lazy" />
          ) : (
            <video key={`${media.url}-${mediaIndex}`} src={media.url} controls preload="none" playsInline aria-label={t('moments.video')} />
          ))}
        </div>
      )}
      {moment.music && (
        <a className="moment-music-link" href={moment.music.url} target="_blank" rel="noopener noreferrer">
          <Music2 size={14} />
          {[moment.music.title, moment.music.artist].filter(Boolean).join(' · ') || t('moments.music')}
        </a>
      )}

      <footer className="moment-footer">
        <div className="moment-tags">
          {moment.tags.map((tag) => (
            <span key={tag} className="moment-tag">#{tag}</span>
          ))}
        </div>

        <div className="moment-actions">
          <button
            type="button"
            className="moment-action-btn"
            data-active={isLiked ? 'true' : undefined}
            onClick={toggleLike}
            aria-label={t('moments.like')}
            title={t('moments.like')}
          >
            <Heart size={13} fill={isLiked ? 'currentColor' : 'none'} />
            <span>{formatCount(likes, locale)}</span>
          </button>
          <button
            type="button"
            className="moment-action-btn"
            onClick={handleShare}
            aria-label={t('moments.share')}
            title={shared ? t('moments.copied') : t('moments.share')}
          >
            {shared ? <Check size={13} /> : <Share2 size={13} />}
          </button>
        </div>
      </footer>
    </motion.article>
  );
}

// Scoped Styled Root
const MomentListContainer = styled.div`
  .moment-empty-state {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 60px 20px;
    color: var(--text-3);
    font-size: 1rem;
  }

  .moment-timeline {
    list-style: none;
    margin: 0;
    padding: 0;
    display: flex;
    flex-direction: column;
    gap: 32px;
  }

  .moment-item {
    display: flex;
    align-items: stretch;
    gap: 20px;
  }

  /** 时间轴轨道：只负责承载轴线与节点，避免任何边框偏移计算 */
  .moment-rail {
    position: relative;
    width: 16px;
    flex-shrink: 0;
  }

  .moment-rail-line {
    position: absolute;
    left: 50%;
    top: 0;
    bottom: 0;
    transform: translateX(-50%);
    width: 2px;
    border-radius: 1px;
    background: linear-gradient(
      to bottom,
      var(--main-color),
      color-mix(in srgb, var(--main-color) 25%, oklch(0 0 0 / 0)) 60%,
      oklch(0 0 0 / 0)
    );
    opacity: 0.4;
  }

  .moment-dot {
    position: absolute;
    left: 50%;
    top: 30px;
    transform: translateX(-50%);
    width: 14px;
    height: 14px;
    border-radius: 50%;
    background: var(--bg-0);
    border: 3px solid var(--main-color);
    box-shadow: 0 0 0 3px color-mix(in srgb, var(--main-color) 18%, oklch(0 0 0 / 0));
  }

  .moment-card {
    position: relative;
    flex: 1;
    min-width: 0;
    padding: 24px 24px 10px;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);

    &:hover {
      transform: translateY(-3px);
      border-color: color-mix(in srgb, var(--main-color) 30%, oklch(0 0 0 / 0));
      box-shadow: 0 10px 30px color-mix(in srgb, var(--main-color) 12%, oklch(0 0 0 / 0));
    }

    @media (max-width: 640px) {
      padding: 20px 20px 8px;
    }
  }

  .moment-meta {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 10px;
    margin-bottom: 16px;
    font-size: 0.85rem;
    color: var(--text-3);
  }

  .moment-date {
    display: inline-flex;
    align-items: center;
    gap: 6px;
  }

  .moment-badge {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    font-size: 0.8rem;
    background: color-mix(in srgb, var(--text-1) 7%, oklch(0 0 0 / 0));
    border-radius: 999px;
    padding: 3px 10px;

    &.mood {
      background: color-mix(in srgb, var(--main-color) 12%, oklch(0 0 0 / 0));
      color: var(--main-color);
    }
  }

  .moment-content {
    font-family: var(--content-font);
    font-size: 1.05rem;
    line-height: 1.75;
    color: var(--text-1);
    margin-bottom: 18px;

    p {
      margin: 0;
    }
  }

  .moment-media-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(min(220px, 100%), 1fr));
    gap: 12px;
    margin-bottom: 18px;

    img, video {
      display: block;
      width: 100%;
      max-height: 480px;
      object-fit: contain;
      border-radius: 12px;
      background: var(--bg-2);
    }
  }

  .moment-music-link {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 18px;
    color: var(--main-color);
    text-decoration: none;
  }

  .moment-footer {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    flex-wrap: wrap;
    padding-top: 14px;
    border-top: var(--border);
  }

  .moment-tags {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }

  .moment-tag {
    font-size: 0.82rem;
    color: var(--main-color);
    font-weight: 500;
  }

  .moment-actions {
    display: flex;
    align-items: center;
    gap: 2px;
  }

  /** 紧凑小按钮：无 hover / 无按压缩放，保持安静的内嵌感 */
  .moment-action-btn {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    padding: 2px 6px;
    background: oklch(0 0 0 / 0);
    border: none;
    color: var(--text-3);
    font-size: 0.72rem;
    line-height: 1;
    cursor: pointer;

    &[data-active="true"] {
      color: var(--main-color);
    }

    svg {
      width: 13px;
      height: 13px;
      flex-shrink: 0;
    }
  }
`;
