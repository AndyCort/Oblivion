import { useEffect, useId, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import styled, { keyframes, css } from "styled-components";
import {
  Music2,
  Play,
  Pause,
  StepBack,
  StepForward,
  X,
  ListMusic,
  Repeat,
  Repeat1,
  Shuffle,
} from "lucide-react";
import { useMusicStore, musicStore, type PlayMode } from "../../stores/musicStore";
import { useLocale } from "../../i18n/useLocale";

function formatTime(time: number) {
  const seconds = Number.isFinite(time) ? Math.max(0, Math.floor(time)) : 0;
  return `${Math.floor(seconds / 60)
    .toString()
    .padStart(2, "0")}:${(seconds % 60).toString().padStart(2, "0")}`;
}

export default function Music() {
  const { t } = useLocale();
  const state = useMusicStore();
  const {
    playlist,
    currentIndex,
    isVisible,
    isPlaying,
    isBuffering,
    hasPlayed,
    currentTime,
    duration,
    playlistStatus,
    playbackError,
    playMode,
  } = state;
  const currentTrack = playlist[currentIndex];
  const progress =
    duration > 0
      ? Math.min(100, Math.max(0, (currentTime / duration) * 100))
      : 0;
  const panelId = useId();
  const safeId = panelId.replace(/[^a-zA-Z0-9_-]/g, "");
  const gradientId = `music-ring-grad-${safeId}`;
  const modeLabel =
    playMode === "single-loop"
      ? t("music.modeSingleLoop")
      : playMode === "shuffle"
        ? t("music.modeShuffle")
        : t("music.modeListLoop");
  const buttonRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ top: 64, right: 16 });
  const [failedCover, setFailedCover] = useState<string | null>(null);
  const [isPlaylistExpanded, setIsPlaylistExpanded] = useState(false);
  const trackName = currentTrack?.name || t("music.unknownTitle");
  const trackArtist = currentTrack?.artist_name || t("music.unknownArtist");

  const close = () => {
    musicStore.setVisibility(false);
    buttonRef.current?.focus();
  };

  useLayoutEffect(() => {
    if (!isVisible) return;
    const positionPanel = () => {
      const rect = buttonRef.current?.getBoundingClientRect();
      if (!rect) return;
      const width = Math.min(280, window.innerWidth - 32);
      setPosition({
        top: rect.bottom + 10,
        right: Math.max(
          16,
          Math.min(
            window.innerWidth - rect.right,
            window.innerWidth - width - 16,
          ),
        ),
      });
    };
    positionPanel();
    window.addEventListener("resize", positionPanel);
    return () => window.removeEventListener("resize", positionPanel);
  }, [isVisible]);

  useEffect(() => {
    if (!isVisible) return;
    panelRef.current?.focus();
    const outside = (event: Event) => {
      const target = event.target as Node | null;
      if (
        !panelRef.current?.contains(target) &&
        !buttonRef.current?.contains(target)
      ) {
        musicStore.setVisibility(false);
      }
    };
    const keydown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        musicStore.setVisibility(false);
        buttonRef.current?.focus();
      }
    };
    document.addEventListener("pointerdown", outside);
    document.addEventListener("focusin", outside);
    document.addEventListener("keydown", keydown);
    return () => {
      document.removeEventListener("pointerdown", outside);
      document.removeEventListener("focusin", outside);
      document.removeEventListener("keydown", keydown);
    };
  }, [isVisible]);

  return (
    <>
      <MusicButton
        data-card
        ref={buttonRef}
        type="button"
        aria-label={t("music.toggle")}
        title={
          currentTrack ? `${trackName} · ${trackArtist}` : t("music.title")
        }
        aria-expanded={isVisible}
        aria-controls={isVisible ? panelId : undefined}
        aria-haspopup="dialog"
        $active={isPlaying || isVisible}
        $isPlaying={isPlaying}
        onClick={musicStore.toggleVisibility}
      >
        <IconWrapper $isPlaying={isPlaying}>
          <Music2 size={18} aria-hidden="true" />
        </IconWrapper>
        {hasPlayed && (
          <ProgressRing viewBox="0 0 40 40" aria-hidden="true">
            <defs>
              <linearGradient
                id={gradientId}
                x1="0%"
                y1="0%"
                x2="100%"
                y2="100%"
              >
                <stop offset="0%" stopColor="var(--main-color)" />
                <stop
                  offset="100%"
                  stopColor="color-mix(in oklab, var(--main-color) 70%, white)"
                />
              </linearGradient>
            </defs>
            <circle
              cx="20"
              cy="20"
              r="18.75"
              fill="none"
              stroke="color-mix(in oklab, var(--text-3) 22%, transparent)"
              strokeWidth="2.5"
            />
            <ProgressArc
              cx="20"
              cy="20"
              r="18.75"
              fill="none"
              stroke={`url(#${gradientId})`}
              strokeWidth="2.5"
              pathLength="100"
              strokeDasharray="100"
              strokeDashoffset={100 - progress}
              strokeLinecap={progress > 0 ? "round" : "butt"}
              $isPlaying={isPlaying}
            />
          </ProgressRing>
        )}
      </MusicButton>

      {isVisible &&
        createPortal(
          <Panel
            ref={panelRef}
            id={panelId}
            role="dialog"
            aria-label={t("music.title")}
            tabIndex={-1}
            style={{
              ...position,
              maxHeight: `calc(100dvh - ${position.top + 16}px)`,
            }}
          >
            <CloseButton
              type="button"
              onClick={close}
              aria-label={t("music.close")}
              title={t("music.close")}
            >
              <X size={14} />
            </CloseButton>

            {currentTrack && (
              <>
                <NowPlaying>
                  <Cover>
                    {currentTrack.cover &&
                    failedCover !== currentTrack.cover ? (
                      <img
                        src={currentTrack.cover}
                        alt={t("music.cover")}
                        onError={() => setFailedCover(currentTrack.cover)}
                      />
                    ) : (
                      <Music2 size={24} aria-hidden="true" />
                    )}
                  </Cover>
                  <TrackInfo>
                    <Status aria-live="polite">
                      {t(
                        isBuffering
                          ? "music.buffering"
                          : isPlaying
                            ? "music.playing"
                            : hasPlayed
                              ? "music.paused"
                              : "music.ready",
                      )}
                    </Status>
                    <h3 title={trackName}>{trackName}</h3>
                    <p title={trackArtist}>{trackArtist}</p>
                  </TrackInfo>
                </NowPlaying>
                <Timeline>
                  <input
                    type="range"
                    min={0}
                    max={duration || 1}
                    step={0.1}
                    value={Math.min(currentTime, duration || 0)}
                    disabled={duration <= 0}
                    style={
                      {
                        "--progress-pct": `${progress}%`,
                      } as React.CSSProperties
                    }
                    aria-label={t("music.progress")}
                    aria-valuetext={`${formatTime(currentTime)} / ${formatTime(duration)}`}
                    onChange={(event) =>
                      musicStore.seek(Number(event.target.value))
                    }
                  />
                  <TimeLabels>
                    <span>{formatTime(currentTime)}</span>
                    <span>{formatTime(duration)}</span>
                  </TimeLabels>
                </Timeline>
                <Controller>
                  <PlayModeIconButton
                    type="button"
                    onClick={musicStore.cyclePlayMode}
                    aria-label={modeLabel}
                    title={modeLabel}
                    $mode={playMode}
                  >
                    {playMode === "single-loop" ? (
                      <Repeat1 size={17} />
                    ) : playMode === "shuffle" ? (
                      <Shuffle size={17} />
                    ) : (
                      <Repeat size={17} />
                    )}
                  </PlayModeIconButton>
                  <TrackNavButton
                    type="button"
                    onClick={musicStore.prevTrack}
                    aria-label={t("music.previous")}
                    title={t("music.previous")}
                  >
                    <StepBack size={17} />
                  </TrackNavButton>
                  <PlayButton
                    type="button"
                    onClick={musicStore.togglePlay}
                    aria-label={t(
                      isPlaying || isBuffering ? "music.pause" : "music.play",
                    )}
                    title={t(
                      isPlaying || isBuffering ? "music.pause" : "music.play",
                    )}
                  >
                    {isPlaying || isBuffering ? (
                      <Pause size={18} />
                    ) : (
                      <Play size={18} />
                    )}
                  </PlayButton>
                  <TrackNavButton
                    type="button"
                    onClick={musicStore.nextTrack}
                    aria-label={t("music.next")}
                    title={t("music.next")}
                  >
                    <StepForward size={17} />
                  </TrackNavButton>
                  <PlaylistIconButton
                    type="button"
                    onClick={() => setIsPlaylistExpanded((prev) => !prev)}
                    aria-label={t("music.playlist")}
                    title={t("music.playlist")}
                    aria-expanded={isPlaylistExpanded}
                    aria-controls={`${panelId}-playlist`}
                    $active={isPlaylistExpanded}
                  >
                    <ListMusic size={17} />
                  </PlaylistIconButton>
                </Controller>
                {playbackError && (
                  <Message role="alert">{t("music.playbackError")}</Message>
                )}
              </>
            )}

            {(isPlaylistExpanded || !currentTrack) && (
              <PlaylistWrapper id={`${panelId}-playlist`}>
                {playlistStatus === "loading" && (
                  <Message role="status">{t("music.loading")}</Message>
                )}
                {playlistStatus === "error" && (
                  <Message role="alert">
                    {t("music.loadError")}
                    <Retry
                      type="button"
                      onClick={() => void musicStore.loadPlaylist()}
                    >
                      {t("music.retry")}
                    </Retry>
                  </Message>
                )}
                {playlistStatus === "ready" && !playlist.length && (
                  <Message role="status">
                    {t("music.empty")}
                    <Retry
                      type="button"
                      onClick={() => void musicStore.loadPlaylist()}
                    >
                      {t("music.retry")}
                    </Retry>
                  </Message>
                )}
                {!!playlist.length && (
                  <Playlist aria-label={t("music.playlist")}>
                    {playlist.map((track, index) => (
                      <li key={`${track.audio}-${index}`}>
                        <TrackButton
                          type="button"
                          $active={index === currentIndex}
                          aria-current={
                            index === currentIndex ? "true" : undefined
                          }
                          onClick={() => musicStore.selectTrack(index)}
                        >
                          <TrackNumber aria-hidden="true">
                            {index === currentIndex && isPlaying ? (
                              <Music2 size={13} />
                            ) : (
                              String(index + 1).padStart(2, "0")
                            )}
                          </TrackNumber>
                          <TrackInfo>
                            <strong>
                              {track.name || t("music.unknownTitle")}
                            </strong>
                            <small>
                              {track.artist_name || t("music.unknownArtist")}
                            </small>
                          </TrackInfo>
                          {index === currentIndex && (
                            <span className="current-dot" aria-hidden="true" />
                          )}
                        </TrackButton>
                      </li>
                    ))}
                  </Playlist>
                )}
              </PlaylistWrapper>
            )}
          </Panel>,
          document.body,
        )}
    </>
  );
}

const musicRhythm = keyframes`
  0%, 100% {
    transform: rotate(0deg) scale(1);
  }
  25% {
    transform: rotate(-6deg) scale(1.06);
  }
  50% {
    transform: rotate(0deg) scale(1);
  }
  75% {
    transform: rotate(6deg) scale(1.06);
  }
`;

const musicGlowPulse = keyframes`
  0%, 100% {
    box-shadow: var(--box-shadow), 0 0 0 0 color-mix(in oklab, var(--main-color) 20%, transparent);
  }
  50% {
    box-shadow: var(--box-shadow), 0 0 14px 2px color-mix(in oklab, var(--main-color) 38%, transparent);
  }
`;

const ringFadeIn = keyframes`
  from {
    opacity: 0;
    transform: rotate(-90deg) scale(0.92);
  }
  to {
    opacity: 1;
    transform: rotate(-90deg) scale(1);
  }
`;


const IconWrapper = styled.span<{ $isPlaying: boolean }>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  transform-origin: center;
  transition:
    transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1),
    color 0.25s ease;

  ${(props) =>
    props.$isPlaying &&
    css`
      animation: ${musicRhythm} 2.6s ease-in-out infinite;
    `}
`;

const MusicButton = styled.button<{ $active: boolean; $isPlaying: boolean }>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  width: 40px;
  height: 40px;
  padding: 0;
  position: relative;
  border-radius: 50% !important;
  background: var(--bg-1);
  border: var(--border);
  box-shadow: var(--box-shadow);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  color: ${(props) => (props.$active ? "var(--main-color)" : "var(--text-1)")};
  cursor: pointer;
  transition:
    transform 0.25s cubic-bezier(0.2, 0.8, 0.2, 1),
    box-shadow 0.3s ease,
    background-color 0.25s ease,
    color 0.25s ease,
    border-color 0.25s ease;

  &:focus-visible {
    outline: 2px solid var(--main-color);
    outline-offset: 3px;
  }

  &:active {
    transform: scale(0.94);
    transition-duration: 0.1s;
  }

  ${(props) =>
    props.$isPlaying &&
    css`
      animation: ${musicGlowPulse} 2.8s ease-in-out infinite;
    `}

  @media (prefers-reduced-motion: reduce) {
    animation: none !important;
    transition: none !important;
    transform: none !important;
    ${IconWrapper} {
      animation: none !important;
    }
  }
`;

const ProgressRing = styled.svg`
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  transform: rotate(-90deg);
  pointer-events: none;
  overflow: visible;
  animation: ${ringFadeIn} 0.35s cubic-bezier(0.16, 1, 0.3, 1) forwards;
`;

const ProgressArc = styled.circle<{ $isPlaying: boolean }>`
  transition: stroke-dashoffset 0.35s cubic-bezier(0.4, 0, 0.2, 1);
  ${(props) =>
    props.$isPlaying &&
    css`
      filter: drop-shadow(
        0 0 3px color-mix(in oklab, var(--main-color) 65%, transparent)
      );
    `}
`;

const slideDown = keyframes`
  from {
    opacity: 0;
    transform: translateY(-4px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const Panel = styled.div`
  position: fixed;
  z-index: 1100;
  width: min(280px, calc(100vw - 32px));
  padding: 12px 14px;
  overflow-y: auto;
  overscroll-behavior: contain;
  border: var(--border);
  border-radius: 18px;
  background: var(--bg-3);
  box-shadow: var(--box-shadow);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  color: var(--text-1);
  font-family: var(--content-font);
  outline: none;
  button,
  input {
    font: inherit;
  }
  button:focus-visible,
  input:focus-visible {
    outline: 2px solid var(--main-color);
    outline-offset: 2px;
  }
`;

const CloseButton = styled.button`
  position: absolute;
  top: 10px;
  right: 10px;
  z-index: 2;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  padding: 0;
  border: none;
  border-radius: 50%;
  background: transparent;
  color: var(--text-3);
  cursor: pointer;
  transition:
    color 0.2s,
    background-color 0.2s;
  &:hover {
    color: var(--text-1);
    background: var(--bg-2);
  }
  &:focus-visible {
    outline: 2px solid var(--main-color);
    outline-offset: 2px;
  }
`;

const NowPlaying = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  padding-right: 22px;
`;

const Cover = styled.div`
  display: grid;
  place-items: center;
  flex: 0 0 46px;
  height: 46px;
  overflow: hidden;
  border-radius: 9px;
  background: var(--bg-2);
  color: var(--main-color);
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;

const TrackInfo = styled.div`
  flex: 1;
  min-width: 0;
  text-align: left;
  h3,
  strong {
    display: block;
    margin: 0;
    font-size: 0.85rem;
    line-height: 1.3;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
  }
  p,
  small {
    display: block;
    margin: 2px 0 0;
    font-size: 0.72rem;
    color: var(--text-2);
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
  }
`;

const Status = styled.p`
  && {
    margin: 0 0 2px;
    font-size: 0.65rem;
    color: var(--main-color);
  }
`;

const Timeline = styled.div`
  margin-top: 8px;

  input[type="range"] {
    -webkit-appearance: none;
    appearance: none;
    display: block;
    width: 100%;
    height: 14px;
    margin: 0;
    padding: 0;
    border: none;
    background: transparent;
    cursor: pointer;
    vertical-align: middle;

    &:focus-visible {
      outline: none;
    }

    /* WebKit Track: slender 3px height with filled progress */
    &::-webkit-slider-runnable-track {
      width: 100%;
      height: 3px;
      border-radius: 999px;
      background: linear-gradient(
        to right,
        var(--main-color) 0%,
        var(--main-color) var(--progress-pct, 0%),
        color-mix(in oklab, var(--text-3) 22%, transparent) var(--progress-pct, 0%),
        color-mix(in oklab, var(--text-3) 22%, transparent) 100%
      );
      transition: background 0.1s linear;
    }

    /* WebKit Thumb: compact 8px circle centered on 3px track ((3 - 8) / 2 = -2.5px) */
    &::-webkit-slider-thumb {
      -webkit-appearance: none;
      appearance: none;
      width: 8px;
      height: 8px;
      border: none;
      border-radius: 50%;
      background: var(--main-color);
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.25);
      cursor: pointer;
      margin-top: -2.5px;
      transition:
        transform 0.15s ease,
        box-shadow 0.15s ease;
    }

    /* Firefox Track & Progress */
    &::-moz-range-track {
      width: 100%;
      height: 3px;
      border: none;
      border-radius: 999px;
      background: color-mix(in oklab, var(--text-3) 22%, transparent);
    }

    &::-moz-range-progress {
      height: 3px;
      border-radius: 999px;
      background: var(--main-color);
    }

    /* Firefox Thumb */
    &::-moz-range-thumb {
      width: 8px;
      height: 8px;
      border: none;
      border-radius: 50%;
      background: var(--main-color);
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.25);
      cursor: pointer;
      transition:
        transform 0.15s ease,
        box-shadow 0.15s ease;
    }

    /* Hover & Active micro-interactions */
    &:hover:not(:disabled)::-webkit-slider-thumb,
    &:active:not(:disabled)::-webkit-slider-thumb {
      transform: scale(1.25);
      box-shadow:
        0 0 0 2px color-mix(in oklab, var(--main-color) 25%, transparent),
        0 1px 3px rgba(0, 0, 0, 0.35);
    }

    &:hover:not(:disabled)::-moz-range-thumb,
    &:active:not(:disabled)::-moz-range-thumb {
      transform: scale(1.25);
      box-shadow:
        0 0 0 2px color-mix(in oklab, var(--main-color) 25%, transparent),
        0 1px 3px rgba(0, 0, 0, 0.35);
    }

    /* Focus-visible state for thumb */
    &:focus-visible::-webkit-slider-thumb {
      box-shadow:
        0 0 0 3px color-mix(in oklab, var(--main-color) 35%, transparent),
        0 1px 3px rgba(0, 0, 0, 0.35);
    }

    &:focus-visible::-moz-range-thumb {
      box-shadow:
        0 0 0 3px color-mix(in oklab, var(--main-color) 35%, transparent),
        0 1px 3px rgba(0, 0, 0, 0.35);
    }

    &:disabled {
      cursor: default;
      opacity: 0.4;

      &::-webkit-slider-thumb {
        cursor: default;
        transform: none;
      }

      &::-moz-range-thumb {
        cursor: default;
        transform: none;
      }
    }
  }
`;

const TimeLabels = styled.div`
  display: flex;
  justify-content: space-between;
  margin-top: 2px;
  font-size: 0.65rem;
  font-variant-numeric: tabular-nums;
  color: var(--text-3);
`;

const Controller = styled.div`
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 12px;
  margin: 6px 0 4px;
`;

const TrackNavButton = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  padding: 0;
  border: none;
  border-radius: 50%;
  background: transparent;
  color: var(--text-1);
  cursor: pointer;
  transition:
    color 0.15s,
    background-color 0.15s,
    transform 0.15s;
  &:hover {
    color: var(--main-color);
    background: var(--bg-2);
  }
  &:active {
    transform: scale(0.92);
  }
  &:focus-visible {
    outline: 2px solid var(--main-color);
    outline-offset: 2px;
  }
`;

const PlayButton = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 38px;
  height: 38px;
  padding: 0;
  border: none;
  border-radius: 50%;
  background: var(--main-color);
  color: var(--on-main);
  cursor: pointer;
  box-shadow: 0 2px 8px color-mix(in oklab, var(--main-color) 35%, transparent);
  transition:
    transform 0.15s,
    filter 0.2s,
    box-shadow 0.2s;
  &:hover {
    filter: brightness(1.08);
    transform: scale(1.04);
    box-shadow: 0 4px 12px
      color-mix(in oklab, var(--main-color) 45%, transparent);
  }
  &:active {
    transform: scale(0.94);
  }
  &:focus-visible {
    outline: 2px solid var(--main-color);
    outline-offset: 3px;
  }
`;

const PlayModeIconButton = styled.button<{ $mode: PlayMode }>`
  position: absolute;
  left: 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  padding: 0;
  border: none;
  background: transparent;
  color: ${(props) =>
    props.$mode !== "list-loop" ? "var(--main-color)" : "var(--text-3)"};
  cursor: pointer;
  transition:
    color 0.2s ease,
    transform 0.15s ease;

  &:hover {
    color: ${(props) =>
      props.$mode !== "list-loop" ? "var(--main-color)" : "var(--text-1)"};
    background: transparent;
  }

  &:active {
    transform: scale(0.92);
  }

  &:focus-visible {
    outline: 2px solid var(--main-color);
    outline-offset: 2px;
  }
`;

const PlaylistIconButton = styled.button<{ $active: boolean }>`
  position: absolute;
  right: 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  padding: 0;
  border: none;
  background: transparent;
  color: ${(props) =>
    props.$active ? "var(--main-color)" : "var(--text-3)"};
  cursor: pointer;
  transition:
    color 0.2s ease,
    transform 0.15s ease;

  &:hover {
    color: ${(props) =>
      props.$active ? "var(--main-color)" : "var(--text-1)"};
    background: transparent;
  }

  &:active {
    transform: scale(0.92);
  }

  &:focus-visible {
    outline: 2px solid var(--main-color);
    outline-offset: 2px;
  }
`;

const PlaylistWrapper = styled.div`
  margin-top: 10px;
  padding-top: 8px;
  border-top: var(--border);
  animation: ${slideDown} 0.22s ease-out;
`;

const Playlist = styled.ol`
  list-style: none;
  margin: 0 -4px -4px;
  padding: 0;
  max-height: 180px;
  overflow-y: auto;
  overscroll-behavior: contain;
`;

const TrackButton = styled.button<{ $active: boolean }>`
  width: 100%;
  display: flex;
  align-items: center;
  gap: 8px;
  border: none;
  border-radius: 8px;
  padding: 7px 6px;
  background: ${(props) => (props.$active ? "var(--bg-2)" : "transparent")};
  color: ${(props) => (props.$active ? "var(--main-color)" : "var(--text-1)")};
  cursor: pointer;
  transition: background-color 0.15s;
  &:hover {
    background: var(--bg-2);
  }
  strong {
    font-size: 0.8rem;
    font-weight: 600;
  }
  small {
    font-size: 0.7rem;
    margin-top: 1px;
  }
  .current-dot {
    width: 5px;
    height: 5px;
    margin: 0 4px;
    border-radius: 50%;
    background: var(--main-color);
    flex-shrink: 0;
  }
`;

const TrackNumber = styled.span`
  display: inline-flex;
  justify-content: center;
  width: 20px;
  flex-shrink: 0;
  font-size: 0.68rem;
  font-variant-numeric: tabular-nums;
`;

const Message = styled.div`
  padding: 12px 4px;
  font-size: 0.78rem;
  line-height: 1.6;
  color: var(--text-2);
`;

const Retry = styled.button`
  display: block;
  margin-top: 8px;
  padding: 5px 12px;
  border: var(--border);
  border-radius: 8px;
  background: var(--bg-2);
  color: var(--main-color);
  cursor: pointer;
`;
