import { useCallback, useEffect, useRef, useState } from "react";
import styled from "styled-components";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { useLocale } from "../../i18n/useLocale";
import { t as translate } from "../../i18n/utils";

interface Props {
  photos: string[];
  index: number;
  onClose: () => void;
}

export default function MomentPhotoViewer({ photos, index, onClose }: Props) {
  const { t, locale } = useLocale();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const swipe = useRef<{ x: number; y: number; moved: boolean } | null>(null);
  const [current, setCurrent] = useState(() => Math.min(Math.max(index, 0), photos.length - 1));
  const total = photos.length;
  const hasMany = total > 1;

  const go = useCallback((step: number) => {
    setCurrent(i => (i + step + total) % total);
  }, [total]);

  useEffect(() => {
    dialogRef.current?.showModal();
    const root = document.documentElement;
    const overflow = root.style.overflow;
    root.style.overflow = "hidden";
    return () => { root.style.overflow = overflow; };
  }, []);

  // 预加载相邻图片，切换时不闪白
  useEffect(() => {
    if (!hasMany) return;
    for (const offset of [1, -1]) new Image().src = photos[(current + offset + total) % total];
  }, [current, hasMany, photos, total]);

  const position = translate("moments.photoPosition", locale, { current: current + 1, total });

  return (
    <Viewer
      ref={dialogRef}
      aria-label={t("moments.viewPhoto")}
      onClose={onClose}
      onKeyDown={event => {
        if (!hasMany) return;
        if (event.key === "ArrowLeft") { event.preventDefault(); go(-1); }
        if (event.key === "ArrowRight") { event.preventDefault(); go(1); }
      }}
      onPointerDown={event => {
        swipe.current = { x: event.clientX, y: event.clientY, moved: false };
      }}
      onPointerUp={event => {
        const start = swipe.current;
        if (!start || !hasMany) return;
        const dx = event.clientX - start.x;
        if (Math.abs(dx) > 48 && Math.abs(dx) > Math.abs(event.clientY - start.y)) {
          start.moved = true;
          go(dx < 0 ? 1 : -1);
        }
      }}
      onClick={event => {
        const moved = swipe.current?.moved;
        swipe.current = null;
        if (!moved && event.target === event.currentTarget) event.currentTarget.close();
      }}
    >
      <img key={photos[current]} src={photos[current]} alt={`${t("moments.image")} · ${position}`} draggable={false} />

      <button type="button" className="viewer-close" autoFocus aria-label={t("moments.closePhoto")} onClick={() => dialogRef.current?.close()}>
        <X size={22} aria-hidden="true" />
      </button>

      {hasMany && (
        <>
          <button type="button" className="viewer-nav viewer-prev" aria-label={t("moments.prevPhoto")} onClick={() => go(-1)}>
            <ChevronLeft size={26} aria-hidden="true" />
          </button>
          <button type="button" className="viewer-nav viewer-next" aria-label={t("moments.nextPhoto")} onClick={() => go(1)}>
            <ChevronRight size={26} aria-hidden="true" />
          </button>
          <p className="viewer-counter" aria-live="polite">
            <span className="sr-only">{position}</span>
            <span aria-hidden="true">{current + 1} / {total}</span>
          </p>
        </>
      )}
    </Viewer>
  );
}

const Viewer = styled.dialog`
  position: fixed;
  inset: 0;
  width: 100%;
  height: 100%;
  max-width: none;
  max-height: none;
  margin: 0;
  padding: 64px 72px;
  border: 0;
  background: transparent;
  overflow: hidden;
  touch-action: pan-y;
  &::backdrop { background: rgb(0 0 0 / 88%); backdrop-filter: blur(6px); }
  &[open] { display: grid; place-items: center; grid-template: minmax(0, 1fr) / minmax(0, 1fr); }

  @media (max-width: 40rem) { padding: 60px 12px; }

  img {
    display: block;
    width: auto;
    height: auto;
    max-width: 100%;
    max-height: 100%;
    object-fit: contain;
    border-radius: 6px;
    user-select: none;

    @media (prefers-reduced-motion: no-preference) {
      animation: viewer-in 0.22s ease-out;
    }
  }

  @keyframes viewer-in {
    from { opacity: 0; transform: scale(0.98); }
    to { opacity: 1; transform: scale(1); }
  }

  button {
    position: absolute;
    display: grid;
    place-items: center;
    width: 44px;
    height: 44px;
    border: 0;
    border-radius: 50%;
    background: rgb(255 255 255 / 12%);
    color: white;
    cursor: pointer;
    transition: background-color 0.2s ease;
    &:hover { background: rgb(255 255 255 / 24%); }
    &:focus-visible { outline: 2px solid currentColor; outline-offset: 2px; }
  }

  .viewer-close {
    top: max(10px, env(safe-area-inset-top));
    right: max(12px, env(safe-area-inset-right));
  }

  .viewer-nav {
    top: 50%;
    width: 48px;
    height: 48px;
    transform: translateY(-50%);
  }
  .viewer-prev { left: max(12px, env(safe-area-inset-left)); }
  .viewer-next { right: max(12px, env(safe-area-inset-right)); }

  @media (max-width: 40rem) {
    .viewer-nav { top: auto; bottom: max(8px, env(safe-area-inset-bottom)); transform: none; }
  }

  .viewer-counter {
    position: absolute;
    left: 50%;
    bottom: max(18px, env(safe-area-inset-bottom));
    margin: 0;
    padding: 4px 12px;
    transform: translateX(-50%);
    border-radius: 999px;
    background: rgb(255 255 255 / 12%);
    color: white;
    font-size: var(--text-caption);
    font-variant-numeric: tabular-nums;
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
