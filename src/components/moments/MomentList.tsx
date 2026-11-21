import { useEffect, useState } from "react";
import styled, { keyframes } from "styled-components";
import { MomentCard, MomentAuthor, MomentStamp } from "./MomentCard";
import { useLocale } from "../../i18n/useLocale";
import { getLocalizedField, type Locale } from "../../i18n/utils";
import { useCardStyle } from "../../stores/themeStore";
import type { Moment } from "../../api/moments";
import { parseMomentMusicUrl, resolveMomentTrack, type Track } from "../../api/music";
import { musicConfig } from "../../config/music";
import { musicStore } from "../../stores/musicStore";
import { readStorage, writeStorage } from "../../utils/storage";
import { Heart, Share2, Check, Music2 } from "lucide-react";

const LIKED_KEY = (id: string) => `moment-liked:${id}`;

function formatCount(n: number, locale: Locale): string {
  if (n < 10000) return String(n);
  return Intl.NumberFormat(locale === "zh-CN" ? "zh-CN" : "en-US", {
    notation: "compact",
  }).format(n);
}

interface Props {
  moments: Moment[];
}

export default function MomentList({ moments }: Props) {
  const { cardStyle } = useCardStyle();
  const { locale, t } = useLocale();

  if (moments.length === 0) {
    return (
      <EmptyState data-card={cardStyle}>{t("moments.empty")}</EmptyState>
    );
  }

  return (
    <MomentListContainer>
      {moments.map((moment, index) => (
        <li key={moment.id}>
          <FeedMoment moment={moment} locale={locale} index={index} />
        </li>
      ))}
    </MomentListContainer>
  );
}

function FeedMoment({
  moment,
  locale,
  index,
}: {
  moment: Moment;
  locale: Locale;
  index: number;
}) {
  const { t } = useLocale();
  const [likes, setLikes] = useState(
    () => moment.likes + (readStorage(LIKED_KEY(moment.id)) === "1" ? 1 : 0),
  );
  const [isLiked, setIsLiked] = useState(
    () => readStorage(LIKED_KEY(moment.id)) === "1",
  );
  const [shared, setShared] = useState(false);
  const [resolvingMusic, setResolvingMusic] = useState(false);
  const [resolvedTrack, setResolvedTrack] = useState<Track | null>(null);

  useEffect(() => {
    const music = moment.music;
    if (!music || (music.title && music.artist)) {
      setResolvedTrack(null);
      return;
    }
    if (parseMomentMusicUrl(music.url).kind !== "meting") {
      setResolvedTrack(null);
      return;
    }
    let cancelled = false;
    void resolveMomentTrack(music, musicConfig).then((track) => {
      if (!cancelled && track) setResolvedTrack(track);
    });
    return () => {
      cancelled = true;
    };
  }, [moment.music]);

  const musicLabel = moment.music
    ? [
        moment.music.title || resolvedTrack?.name,
        moment.music.artist || resolvedTrack?.artist_name,
      ]
        .filter(Boolean)
        .join(" · ") || t("moments.music")
    : "";

  const handlePlayMusic = async () => {
    const music = moment.music;
    if (!music || resolvingMusic) return;

    if (resolvedTrack) {
      musicStore.playTrack(resolvedTrack);
      return;
    }

    const parsed = parseMomentMusicUrl(music.url);
    if (parsed.kind === "audio") {
      musicStore.playTrack({
        name: music.title,
        artist_name: music.artist,
        audio: parsed.url,
        cover: "",
      });
      return;
    }

    if (parsed.kind === "meting") {
      setResolvingMusic(true);
      try {
        const track = await resolveMomentTrack(music, musicConfig);
        if (track) {
          setResolvedTrack(track);
          musicStore.playTrack(track);
          return;
        }
      } finally {
        setResolvingMusic(false);
      }
    }

    window.open(music.url, "_blank", "noopener,noreferrer");
  };

  const toggleLike = () => {
    const next = !isLiked;
    setIsLiked(next);
    setLikes((l) => Math.max(0, l + (next ? 1 : -1)));
    writeStorage(LIKED_KEY(moment.id), next ? "1" : "0");
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
    <FeedCard className="moment-card" $index={index}>
      <MomentAuthor mood={moment.mood}>
        <div className="moment-actions">
          <button
            type="button"
            className="moment-action-btn"
            aria-pressed={isLiked}
            onClick={toggleLike}
            aria-label={t("moments.like")}
            title={t("moments.like")}
          >
            <Heart size={13} fill={isLiked ? "currentColor" : "none"} />
            <span>{formatCount(likes, locale)}</span>
          </button>
          <button
            type="button"
            className="moment-action-btn"
            onClick={handleShare}
            aria-label={t("moments.share")}
            title={shared ? t("moments.copied") : t("moments.share")}
          >
            {shared ? <Check size={13} /> : <Share2 size={13} />}
          </button>
        </div>
      </MomentAuthor>

      {moment.content && <p className="moment-content">{getLocalizedField(moment.content, locale)}</p>}

      {moment.media.length > 0 && (
        <div className="moment-media-grid">
          {moment.media.map((media, mediaIndex) =>
            media.type === "image" ? (
              <img
                key={`${media.url}-${mediaIndex}`}
                src={media.url}
                alt={t("moments.image")}
                loading="lazy"
              />
            ) : (
              <video
                key={`${media.url}-${mediaIndex}`}
                src={media.url}
                controls
                preload="none"
                playsInline
                aria-label={t("moments.video")}
              />
            ),
          )}
        </div>
      )}
      {moment.tags.length > 0 && (
        <div className="moment-tags">
          {moment.tags.map((tag) => <span key={tag}>#{tag}</span>)}
        </div>
      )}

      <footer className="moment-footer">
        <MomentStamp location={moment.location} date={moment.date} />
        {moment.music && (
          <button
            type="button"
            className="moment-music-link"
            onClick={() => void handlePlayMusic()}
            disabled={resolvingMusic}
          >
            <Music2 size={14} aria-hidden="true" />
            <span>{musicLabel}</span>
          </button>
        )}
      </footer>
    </FeedCard>
  );
}

const EmptyState = styled.p`
  margin: 0;
  padding: 60px 20px;
  text-align: center;
`;

const MomentListContainer = styled.ol`
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: 20px;
`;

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(8px); }
  to { opacity: 1; transform: translateY(0); }
`;

const FeedCard = styled(MomentCard)<{ $index: number }>`
  @media (prefers-reduced-motion: no-preference) {
    animation: ${fadeIn} 0.35s ease-out backwards;
    animation-delay: ${({ $index }) => Math.min($index * 0.05, 0.25)}s;
  }

  .moment-media-grid {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 10px;
    margin: 5px 0;

    img, video {
      display: block;
      width: 100%;
      aspect-ratio: 1;
      object-fit: cover;
      border-radius: 8px;
    }
  }

  .moment-tags {
    display: flex;
    flex-wrap: wrap;
    gap: 4px 16px;
    margin: 5px 0;
    color: oklch(0.8 0.1 263);
    font-family: "LXGW WenKai", serif;
  }

  .moment-actions {
    display: flex;
    margin-left: auto;
  }

  button {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 4px;
    min-height: 44px;
    padding: 0;
    border: 0;
    background: none;
    color: var(--moment-muted);
    cursor: pointer;

    &:hover, &:focus-visible { color: #fff; }
    &:focus-visible { outline: 2px solid currentColor; outline-offset: 2px; }
    &[aria-pressed="true"] { color: #ffa8b7; }
    &:disabled { opacity: 0.6; cursor: wait; }
  }

  .moment-action-btn {
    min-width: 44px;
    font-size: var(--text-caption);
  }

  .moment-music-link {
    max-width: 100%;
    font: inherit;
    text-align: left;
  }
`;
