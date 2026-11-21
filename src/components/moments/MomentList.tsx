import { useEffect, useState } from "react";
import styled, { keyframes } from "styled-components";
import { MomentCard, MomentAvatar, MomentLocation } from "./MomentCard";
import MomentArchive from "./MomentArchive";
import MomentPhotoViewer from "./MomentPhotoViewer";
import { useLocale } from "../../i18n/useLocale";
import { getLocalizedField, t as translate, type Locale } from "../../i18n/utils";
import { siteConfig } from "../../config/site";
import { useCardStyle } from "../../stores/themeStore";
import type { CardStyleId } from "../../theme/model";
import type { Moment } from "../../api/moments";
import { parseMomentMusicUrl, resolveMomentTrack, type Track } from "../../api/music";
import { musicConfig } from "../../config/music";
import { musicStore } from "../../stores/musicStore";
import { readStorage, writeStorage } from "../../utils/storage";
import { Heart, Share2, Check, Music2, Play, Loader2 } from "lucide-react";

const LIKED_KEY = (id: string) => `moment-liked:${id}`;
const MAX_MEDIA = 9;

function formatCount(n: number, locale: Locale): string {
  if (n < 10000) return String(n);
  return Intl.NumberFormat(locale === "zh-CN" ? "zh-CN" : "en-US", {
    notation: "compact",
  }).format(n);
}

interface Props {
  moments: Moment[];
  activeTag?: string;
  onTagSelect?: (tag: string) => void;
}

interface ViewerState {
  photos: string[];
  index: number;
}

export default function MomentList({ moments, activeTag = "", onTagSelect }: Props) {
  const { cardStyle } = useCardStyle();
  const { locale, t } = useLocale();
  const [viewer, setViewer] = useState<ViewerState | null>(null);

  if (moments.length === 0) {
    return <EmptyState data-card={cardStyle}>{t("moments.empty")}</EmptyState>;
  }

  return (
    <>
      <MomentArchive moments={moments} locale={locale}>
        {(moment, index) => (
          <FeedMoment
            moment={moment}
            locale={locale}
            index={index}
            cardStyle={cardStyle}
            activeTag={activeTag}
            onTagSelect={onTagSelect}
            onViewPhoto={(photos, photoIndex) => setViewer({ photos, index: photoIndex })}
          />
        )}
      </MomentArchive>
      {viewer && <MomentPhotoViewer photos={viewer.photos} index={viewer.index} onClose={() => setViewer(null)} />}
    </>
  );
}

function FeedMoment({
  moment,
  locale,
  index,
  cardStyle,
  activeTag,
  onTagSelect,
  onViewPhoto,
}: {
  moment: Moment;
  locale: Locale;
  index: number;
  cardStyle: CardStyleId;
  activeTag: string;
  onTagSelect?: (tag: string) => void;
  onViewPhoto: (photos: string[], index: number) => void;
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

  const musicTitle = moment.music?.title || resolvedTrack?.name || t("moments.music");
  const musicArtist = moment.music?.artist || resolvedTrack?.artist_name || "";
  const musicCover = resolvedTrack?.cover || "";

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

  const content = getLocalizedField(moment.content, locale);

  const handleShare = async () => {
    const text = `「${content}」 ${moment.date}${moment.location ? ` · ${moment.location}` : ""}`;
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

  const photos = moment.media.filter((media) => media.type === "image").map((media) => media.url);
  const visibleMedia = moment.media.slice(0, MAX_MEDIA);
  const hiddenCount = moment.media.length - visibleMedia.length;
  const time = moment.date.slice(11, 16);

  return (
    <FeedCard className="moment-card" data-card={cardStyle} $index={index}>
      <MomentAvatar size={44} />

      <div className="moment-body">
        <header className="moment-meta">
          <span className="moment-name">{siteConfig.author.name}</span>
          {moment.mood && <span className="moment-mood">{moment.mood}</span>}
          <time className="moment-time" dateTime={moment.date.replace(" ", "T")} title={moment.date}>
            {time || moment.date}
          </time>
        </header>

        {content && <p className="moment-content">{content}</p>}

        {visibleMedia.length > 0 && (
          <div className="moment-media" data-count={visibleMedia.length}>
            {visibleMedia.map((media, mediaIndex) => {
              const isLastWithMore = hiddenCount > 0 && mediaIndex === visibleMedia.length - 1;
              if (media.type === "video") {
                return (
                  <video
                    key={`${media.url}-${mediaIndex}`}
                    className="moment-tile"
                    src={media.url}
                    controls
                    preload="metadata"
                    playsInline
                    aria-label={t("moments.video")}
                  />
                );
              }
              const photoIndex = photos.indexOf(media.url);
              return (
                <button
                  key={`${media.url}-${mediaIndex}`}
                  type="button"
                  className="moment-tile moment-photo"
                  aria-label={`${t("moments.viewPhoto")} (${photoIndex + 1}/${photos.length})`}
                  aria-haspopup="dialog"
                  onClick={() => onViewPhoto(photos, Math.max(photoIndex, 0))}
                >
                  <img src={media.url} alt={t("moments.image")} loading="lazy" decoding="async" />
                  {isLastWithMore && (
                    <span className="moment-more">
                      +{hiddenCount}
                      <span className="sr-only">{translate("moments.morePhotos", locale, { count: hiddenCount })}</span>
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        )}

        {moment.music && (
          <button
            type="button"
            className="moment-music"
            onClick={() => void handlePlayMusic()}
            disabled={resolvingMusic}
            aria-busy={resolvingMusic}
          >
            <span className="moment-music-cover" aria-hidden="true">
              {musicCover ? <img src={musicCover} alt="" loading="lazy" /> : <Music2 size={16} />}
              <span className="moment-music-play">
                {resolvingMusic ? <Loader2 size={14} className="spin" /> : <Play size={14} fill="currentColor" />}
              </span>
            </span>
            <span className="moment-music-text">
              <span className="moment-music-title">{musicTitle}</span>
              {musicArtist && <span className="moment-music-artist">{musicArtist}</span>}
            </span>
          </button>
        )}

        {moment.tags.length > 0 && (
          <div className="moment-tags">
            {moment.tags.map((tag) =>
              onTagSelect ? (
                <button
                  key={tag}
                  type="button"
                  className="moment-tag"
                  aria-pressed={activeTag === tag}
                  onClick={() => onTagSelect(tag)}
                >
                  #{tag}
                </button>
              ) : (
                <span key={tag} className="moment-tag">#{tag}</span>
              ),
            )}
          </div>
        )}

        <footer className="moment-foot">
          <MomentLocation location={moment.location} />
          <div className="moment-actions">
            <button
              type="button"
              className="moment-action"
              aria-pressed={isLiked}
              onClick={toggleLike}
              aria-label={t("moments.like")}
              title={t("moments.like")}
            >
              <Heart size={15} fill={isLiked ? "currentColor" : "none"} aria-hidden="true" />
              <span>{formatCount(likes, locale)}</span>
            </button>
            <button
              type="button"
              className="moment-action"
              onClick={handleShare}
              aria-label={t("moments.share")}
              title={shared ? t("moments.copied") : t("moments.share")}
            >
              {shared ? <Check size={15} aria-hidden="true" /> : <Share2 size={15} aria-hidden="true" />}
            </button>
          </div>
        </footer>
      </div>
    </FeedCard>
  );
}

const EmptyState = styled.p`
  margin: 0;
  padding: 60px 20px;
  text-align: center;
  color: var(--text-2);
`;

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
`;

const spin = keyframes`
  to { transform: rotate(360deg); }
`;

const FeedCard = styled(MomentCard)<{ $index: number }>`
  display: grid;
  grid-template-columns: 44px minmax(0, 1fr);
  column-gap: 14px;
  padding: 18px 20px 8px;
  transition: transform 0.25s ease, box-shadow 0.25s ease;

  @media (prefers-reduced-motion: no-preference) {
    animation: ${fadeIn} 0.4s ease-out backwards;
    animation-delay: ${({ $index }) => Math.min($index * 0.05, 0.25)}s;
  }

  @media (hover: hover) {
    &:hover { transform: translateY(-2px); }
  }

  @media (max-width: 40rem) {
    grid-template-columns: 38px minmax(0, 1fr);
    column-gap: 11px;
    padding: 16px 14px 6px;

    .moment-avatar { width: 38px; height: 38px; }
  }

  .moment-avatar {
    width: 44px;
    height: 44px;
    box-shadow: 0 0 0 2px var(--bg-0), 0 0 0 3px color-mix(in srgb, var(--main-color) 45%, transparent);
  }

  .moment-body { min-width: 0; }

  .moment-meta {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 4px 8px;
    min-height: 24px;
    line-height: 1.3;
  }

  .moment-name {
    color: var(--text-1);
    font-size: var(--text-body);
    font-weight: var(--weight-strong);
  }

  .moment-mood {
    padding: 1px 9px;
    border-radius: 999px;
    background: color-mix(in srgb, var(--main-color) 14%, transparent);
    color: var(--main-color);
    font-size: var(--text-caption);
    line-height: 1.6;
  }

  .moment-time {
    margin-left: auto;
    color: var(--text-3);
    font-size: var(--text-meta);
    font-variant-numeric: tabular-nums;
  }

  .moment-content { margin: 6px 0 0; }

  /* 配图：1 张大图，2/4 张两列，其余三列九宫格 */
  .moment-media {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 4px;
    max-width: 456px;
    margin-top: 12px;
    border-radius: 12px;
    overflow: hidden;
    isolation: isolate;

    &[data-count="1"] { grid-template-columns: minmax(0, 1fr); max-width: min(100%, 380px); }
    &[data-count="2"], &[data-count="4"] { grid-template-columns: repeat(2, minmax(0, 1fr)); max-width: 304px; }
    &[data-count="2"] { max-width: 380px; }
  }

  .moment-tile {
    position: relative;
    display: block;
    width: 100%;
    min-width: 0;
    aspect-ratio: 1;
    object-fit: cover;
    background: var(--bg-2);
    overflow: hidden;
  }

  .moment-media[data-count="1"] .moment-tile { aspect-ratio: 4 / 3; }
  .moment-media[data-count="1"] video.moment-tile { aspect-ratio: 16 / 9; }

  .moment-photo {
    border: 0;
    padding: 0;
    cursor: zoom-in;

    &:focus-visible { outline: 2px solid var(--main-color); outline-offset: -2px; z-index: 1; }

    img {
      display: block;
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    @media (prefers-reduced-motion: no-preference) {
      img { transition: transform 0.45s ease, filter 0.3s ease; }
      &:hover img { transform: scale(1.05); filter: brightness(1.05); }
    }
  }

  .moment-more {
    position: absolute;
    inset: 0;
    display: grid;
    place-items: center;
    background: rgb(0 0 0 / 48%);
    color: white;
    font-family: var(--title-font);
    font-size: 1.5rem;
    font-weight: var(--weight-strong);
  }

  /* 音乐卡片 */
  .moment-music {
    display: flex;
    align-items: center;
    gap: 12px;
    width: min(100%, 320px);
    margin-top: 12px;
    padding: 6px 14px 6px 6px;
    border: var(--border);
    border-radius: 12px;
    background: color-mix(in srgb, var(--bg-2) 70%, transparent);
    color: var(--text-1);
    text-align: left;
    cursor: pointer;
    transition: border-color 0.2s ease, background-color 0.2s ease;

    &:hover, &:focus-visible { border-color: color-mix(in srgb, var(--main-color) 60%, transparent); }
    &:focus-visible { outline: 2px solid var(--main-color); outline-offset: 2px; }
    &:disabled { cursor: wait; }
  }

  .moment-music-cover {
    position: relative;
    display: grid;
    place-items: center;
    width: 44px;
    height: 44px;
    flex-shrink: 0;
    border-radius: 8px;
    overflow: hidden;
    background: color-mix(in srgb, var(--main-color) 18%, transparent);
    color: var(--main-color);

    img { width: 100%; height: 100%; object-fit: cover; }
  }

  .moment-music-play {
    position: absolute;
    inset: 0;
    display: grid;
    place-items: center;
    background: rgb(0 0 0 / 35%);
    color: white;
    opacity: 0;
    transition: opacity 0.2s ease;
  }

  .moment-music:hover .moment-music-play,
  .moment-music:focus-visible .moment-music-play,
  .moment-music:disabled .moment-music-play { opacity: 1; }

  .spin { animation: ${spin} 1s linear infinite; }

  .moment-music-text {
    display: grid;
    min-width: 0;
    line-height: 1.35;
  }

  .moment-music-title, .moment-music-artist {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .moment-music-title { font-size: var(--text-meta); font-weight: var(--weight-strong); }
  .moment-music-artist { color: var(--text-3); font-size: var(--text-caption); }

  /* 标签 */
  .moment-tags {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
    margin-top: 12px;
  }

  .moment-tag {
    padding: 2px 10px;
    border: 0;
    border-radius: 999px;
    background: color-mix(in srgb, var(--main-color) 10%, transparent);
    color: var(--main-color);
    font-size: var(--text-caption);
    line-height: 1.7;
  }

  button.moment-tag {
    cursor: pointer;
    transition: background-color 0.2s ease, color 0.2s ease;

    &:hover { background: color-mix(in srgb, var(--main-color) 20%, transparent); }
    &[aria-pressed="true"] { background: var(--main-color); color: var(--on-main); }
    &:focus-visible { outline: 2px solid var(--main-color); outline-offset: 2px; }
  }

  /* 底栏：位置 + 互动 */
  .moment-foot {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    margin-top: 4px;
    color: var(--text-3);
    font-size: var(--text-meta);
  }

  .moment-foot .moment-location {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    min-width: 0;
  }

  .moment-actions {
    display: flex;
    flex-shrink: 0;
    margin-left: auto;
    margin-right: -10px;
  }

  .moment-action {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 5px;
    min-width: 44px;
    min-height: 44px;
    padding: 0 10px;
    border: 0;
    border-radius: 999px;
    background: none;
    color: var(--text-3);
    font-size: var(--text-caption);
    font-variant-numeric: tabular-nums;
    cursor: pointer;
    transition: color 0.2s ease;

    &:hover, &:focus-visible { color: var(--text-1); }
    &:focus-visible { outline: 2px solid currentColor; outline-offset: -4px; }
    &[aria-pressed="true"] { color: var(--main-color); }
  }

  @media (prefers-reduced-motion: no-preference) {
    .moment-action[aria-pressed="true"] svg { animation: ${keyframes`
      40% { transform: scale(1.3); }
    `} 0.3s ease-out; }
  }

  .sr-only {
    position: absolute;
    width: 1px;
    height: 1px;
    overflow: hidden;
    clip-path: inset(50%);
    white-space: nowrap;
  }
`;
