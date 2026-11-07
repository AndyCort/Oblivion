import React from "react";
import { motion } from "framer-motion";
import styled, { keyframes } from "styled-components";
import MainLayout from "../layouts/MainLayout";
import Social from "../components/common/Social";
import ScrollArrow from "../components/home/ScrollArrow";
import Background from "../components/layout/Background";
import Quote from "../components/home/Quote";
import SideButton from "../components/layout/SideButton";
import Loader from "../components/common/Loader";
import Footer from "../components/layout/Footer";
import { useLocale } from "../i18n/useLocale";
import { useCardStyle } from "../stores/themeStore";
import { CARD_STYLES } from "../config/theme";
import {
  SiteStats,
  LatestArticle,
  TagCloud,
  LatestMoment,
  MiniCalendar,
} from "../components/home/widget";
import GlassHeroBackground from "../components/home/GlassHeroBackground";
import {
  useHomeAnimation,
  useVideoPlaybackSync,
  welcomeIntro,
} from "../hooks/useHomeAnimation";
import catApng from "../assets/imgs/cat.apng";

export default function Home() {
  const { siteName } = useLocale();
  const { cardStyle } = useCardStyle();

  React.useEffect(() => {
    document.title = siteName;
  }, [siteName]);

  const isGlassTheme = cardStyle === "glass";

  // 首页全套动效系统（视口阻尼联动、3D 转场虚化、磁吸回弹吸附）
  const {
    reduceMotion,
    heroScale,
    heroRotateX,
    heroOpacity,
    heroRadius,
    heroShadow,
    heroFilter,
    heroContentY,
    heroContentOpacity,
    heroContentScale,
    mainClipPath,
    mainBgScale,
    mainBgY,
    mainBgOpacity,
    mainBgFilter,
    contentScale,
    contentY,
    contentOpacity,
    glowOpacity,
  } = useHomeAnimation();

  const [failedVideo, setFailedVideo] = React.useState<string | null>(null);
  const [readyVideo, setReadyVideo] = React.useState<string | null>(null);
  const configuredVideo: string | null =
    CARD_STYLES.find((s) => s.id === cardStyle)?.video ?? null;
  const videoSrc: string | null =
    !reduceMotion && configuredVideo !== failedVideo ? configuredVideo : null;
  const videoRef = React.useRef<HTMLVideoElement>(null);

  // 视频播放与视口滚动位置/页面可见性同步
  useVideoPlaybackSync(videoRef, videoSrc, setFailedVideo);

  return (
    <MainLayout
      hideFooter
      hero={
        <HomeSection $isGlass={isGlassTheme} className="home-hero">
          <motion.div
            className="home-bg"
            aria-hidden="true"
            style={{
              scale: heroScale,
              rotateX: heroRotateX,
              opacity: heroOpacity,
              borderRadius: heroRadius,
              boxShadow: heroShadow,
              filter: heroFilter,
            }}
          >
            {isGlassTheme ? (
              <GlassHeroBackground />
            ) : videoSrc ? (
              <video
                key={videoSrc}
                ref={videoRef}
                src={videoSrc}
                loop
                muted
                playsInline
                preload="metadata"
                className={`home-video${readyVideo === videoSrc ? " is-ready" : ""}`}
                onLoadedData={() => setReadyVideo(videoSrc)}
                onError={() => setFailedVideo(videoSrc)}
              />
            ) : null}
          </motion.div>
          <motion.div
            className="welcome-content"
            style={{
              opacity: heroContentOpacity,
              scale: heroContentScale,
              y: heroContentY,
            }}
          >
            <Quote />
            <Social />
          </motion.div>
          <ScrollArrow />
        </HomeSection>
      }
    >
      <Loader />
      <SideButton />
      <Background />

      <HomeMain
        className="home-main"
        style={{
          clipPath: mainClipPath,
          WebkitClipPath: mainClipPath,
        }}
      >
        <motion.div
          className="top-glow-line"
          style={{ opacity: glowOpacity }}
        />
        <motion.div
          className="main-bg"
          style={{
            scale: mainBgScale,
            y: mainBgY,
            opacity: mainBgOpacity,
            filter: mainBgFilter,
          }}
        />

        <motion.div
          className="main-content-inner"
          style={{
            scale: contentScale,
            y: contentY,
            opacity: contentOpacity,
          }}
        >
          <div className="grid-container">
            <SiteStats className="card-square col-1" />
            <LatestArticle className="card-square col-2" />
            <TagCloud className="card-square col-3" />
            <div data-card={cardStyle} className="quote-banner">
              <span>落霞与孤鹜齐飞，秋水共长天一色</span>
            </div>
            <LatestMoment className="moment-card" />
            <MiniCalendar className="mascot-calendar" />
          </div>
          <Footer transparent />
        </motion.div>
      </HomeMain>
    </MainLayout>
  );
}

// Scoped Styled Roots

const HomeSection = styled.section<{ $isGlass: boolean }>`
  --hero-foreground: ${(props) =>
    props.$isGlass ? "oklch(0.98 0 0)" : "var(--text-1)"};
  height: 100dvh;
  width: 100%;
  position: relative;
  overflow: hidden;
  background-color: oklch(0 0 0);
  perspective: 1200px;

  .home-bg {
    height: 100%;
    width: 100%;
    position: absolute;
    top: 0;
    left: 0;
    overflow: hidden;
    z-index: 0;
    background-image: ${(props) =>
      props.$isGlass
        ? "none"
        : "linear-gradient(var(--home-bg-filter), var(--home-bg-filter)), var(--home-bg)"};
    background-color: oklch(0 0 0);
    background-position: center;
    background-size: cover;
    background-repeat: no-repeat;
    transform-origin: center center;
    will-change: transform, opacity, filter;

    .home-video {
      width: 100%;
      height: 100%;
      object-fit: cover;
      position: absolute;
      top: 0;
      left: 0;
      z-index: 0;
      opacity: 0;
      transition: opacity 0.3s ease;

      &.is-ready {
        opacity: 1;
      }
    }
  }

  .welcome-content {
    position: relative;
    z-index: 1;
    height: 100vh;
    height: 100svh;
    min-height: 400px;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    gap: clamp(0.5rem, 2vh, 2rem);
    padding: clamp(1rem, 5vh, 3rem) 1rem;
    box-sizing: border-box;
    animation: ${welcomeIntro} 1.1s cubic-bezier(0.16, 1, 0.3, 1) backwards;
    transform-origin: center center;
    will-change: transform, opacity;

    @media (prefers-reduced-motion: reduce) {
      animation: none;
    }
  }
`;

const quoteShimmer = keyframes`
  from { background-position: 0% 50%; }
  to { background-position: 100% 50%; }
`;

const HomeMain = styled(motion.div)`
  position: relative;
  z-index: 1;
  width: 100%;
  min-height: 100vh;
  min-height: 100svh;
  height: auto;
  will-change: clip-path;
  box-sizing: border-box;
  padding: 40px 0 0;

  @media (max-width: 48rem) {
    padding: 16px 0 0;
  }

  .top-glow-line {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 2px;
    background: linear-gradient(
      90deg,
      transparent 0%,
      oklch(1 0 0 / 0.3) 15%,
      var(--main-color) 50%,
      oklch(1 0 0 / 0.3) 85%,
      transparent 100%
    );
    box-shadow:
      0 0 16px var(--main-color),
      0 0 32px oklch(1 0 0 / 0.4);
    z-index: 10;
    pointer-events: none;
  }

  .main-bg {
    position: fixed;
    inset: 0;
    z-index: 0;
    pointer-events: none;
    background-image:
      linear-gradient(
        oklch(0.15 0.025 310 / 0.48),
        oklch(0.15 0.025 310 / 0.48)
      ),
      url("https://w.wallhaven.cc/full/yq/wallhaven-yqkl97.jpg");
    background-position: center;
    background-size: cover;
    background-repeat: no-repeat;
    will-change: transform, opacity;
    transform-origin: center center;
  }

  .main-content-inner {
    position: relative;
    z-index: 1;
    width: 100%;
    padding-top: 15vh;
    display: flex;
    flex-direction: column;
    align-items: center;
    transform-origin: center top;
    will-change: transform, opacity;
  }

  .grid-container {
    position: relative;
    z-index: 1;
    width: var(--content-width);
    margin: 0 auto;
    padding: clamp(16px, 3vw, 24px) 0 clamp(32px, 4vw, 48px);
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: clamp(6px, 1.8vw, 24px);
    overflow: visible;
    box-sizing: border-box;

    @media (max-width: 48rem) {
      width: calc(100% - 24px);
      margin: 16px auto 32px;
      padding: 12px 0 32px;
    }

    @media (max-width: 30rem) {
      width: calc(100% - 16px);
      margin: 12px auto 24px;
      padding: 8px 0 24px;
    }

    .card-square {
      aspect-ratio: 1 / 1;
      min-width: 0;
      min-height: 0;
      overflow: hidden;

      @media (max-width: 48rem) {
        border-radius: 12px;
      }

      &.col-1 {
        grid-column: 1 / 2;
      }
      &.col-2 {
        grid-column: 2 / 3;
      }
      &.col-3 {
        grid-column: 3 / 4;
      }
    }

    .quote-banner {
      grid-column: 1 / 4;
      display: flex;
      align-items: center;
      justify-content: center;
      text-align: center;
      min-width: 0;
      padding: clamp(8px, 1.8vw, 22px) clamp(12px, 2.5vw, 28px);
      font-size: clamp(0.72rem, 1.8vw, var(--text-body));
      letter-spacing: normal;
      line-height: var(--leading-ui);
      user-select: none;
      border-radius: 16px;

      @media (max-width: 48rem) {
        border-radius: 12px;
      }

      & span {
        background: linear-gradient(
          110deg,
          color-mix(in oklch, var(--main-color) 25%, var(--text-1)),
          var(--text-1),
          color-mix(in oklch, var(--main-color) 25%, var(--text-1))
        );
        background-size: 200% 100%;
        background-clip: text;
        -webkit-background-clip: text;
        color: transparent;
        animation: ${quoteShimmer} 10s ease-in-out infinite alternate;
      }

      @media (prefers-reduced-motion: reduce) {
        & span {
          animation: none;
        }
      }
    }

    .moment-card {
      grid-column: 1 / 3;
      min-width: 0;
      min-height: 0;
      height: 100%;
    }

    .mascot-calendar {
      position: relative;
      grid-column: 3 / 4;
      min-width: 0;
      min-height: 0;
      height: 100%;
      overflow: visible;

      &::before {
        content: "";
        position: absolute;
        top: 0;
        right: 6%;
        width: clamp(54px, 36%, 110px);
        aspect-ratio: 900 / 517;
        transform: translateY(-50%);
        background-image: url(${catApng});
        background-size: contain;
        background-position: center bottom;
        background-repeat: no-repeat;
        z-index: 10;
        pointer-events: none;
      }

      @media (max-width: 48rem) {
        &::before {
          right: 6px;
          width: clamp(34px, 30%, 50px);
          transform: translateY(-50%);
        }
      }
    }
  }
`;
