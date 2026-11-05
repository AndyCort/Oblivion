import React from "react";
import { motion } from "framer-motion";
import styled from "styled-components";
import MainLayout from "../layouts/MainLayout";
import Social from "../components/common/Social";
import ScrollArrow from "../components/home/ScrollArrow";
import Background from "../components/layout/Background";
import Quote from "../components/home/Quote";
import SideButton from "../components/layout/SideButton";
import Loader from "../components/common/Loader";
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
  hueChange,
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
      hero={
        <HomeSection>
          <HomeBg
            $isGlass={isGlassTheme}
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
          </HomeBg>
          <WelcomeContent
            style={{
              opacity: heroContentOpacity,
              scale: heroContentScale,
              y: heroContentY,
            }}
          >
            <Quote />
            <Social />
          </WelcomeContent>
          <ScrollArrow />
        </HomeSection>
      }
    >
      <Loader />
      <SideButton />
      <Background />

      <Main
        style={{
          clipPath: mainClipPath,
          WebkitClipPath: mainClipPath,
        }}
      >
        <TopGlowLine style={{ opacity: glowOpacity }} />
        <MainBg
          style={{
            scale: mainBgScale,
            y: mainBgY,
            opacity: mainBgOpacity,
            filter: mainBgFilter,
          }}
        />

        <MainContentInner
          style={{
            scale: contentScale,
            y: contentY,
            opacity: contentOpacity,
          }}
        >
          <GridContainer>
            <SiteStats className="card-square col-1" />
            <LatestArticle className="card-square col-2" />
            <TagCloud className="card-square col-3" />
            <div data-card className="quote-banner">
              <span>落霞与孤鹜齐飞，秋水共长天一色</span>
            </div>
            <LatestMoment className="moment-card" />
            <MiniCalendar className="mascot-calendar" />
          </GridContainer>
        </MainContentInner>
      </Main>
    </MainLayout>
  );
}

const HomeSection = styled.section`
  height: 100dvh;
  width: 100%;
  position: relative;
  overflow: hidden;
  background-color: #000;
  perspective: 1200px;
`;

const HomeBg = styled(motion.div)<{ $isGlass?: boolean }>`
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
  background-color: #000;
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
`;

const WelcomeContent = styled(motion.div)`
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
`;

const TopGlowLine = styled(motion.div)`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 2px;
  background: linear-gradient(
    90deg,
    transparent 0%,
    rgba(255, 255, 255, 0.3) 15%,
    var(--main-color) 50%,
    rgba(255, 255, 255, 0.3) 85%,
    transparent 100%
  );
  box-shadow:
    0 0 16px var(--main-color),
    0 0 32px rgba(255, 255, 255, 0.4);
  z-index: 10;
  pointer-events: none;
`;

const MainBg = styled(motion.div)`
  position: fixed;
  inset: 0;
  z-index: 0;
  pointer-events: none;
  background-image:
    linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)),
    url("https://w.wallhaven.cc/full/yq/wallhaven-yqkl97.jpg");
  background-position: center;
  background-size: cover;
  background-repeat: no-repeat;
  will-change: transform, opacity;
  transform-origin: center center;
`;

const Main = styled(motion.div)`
  position: relative;
  z-index: 1;
  width: 100%;
  min-height: 100vh;
  min-height: 100svh;
  height: auto;
  will-change: clip-path;
  box-sizing: border-box;
  padding: 80px 0;

  @media (max-width: 768px) {
    padding: 76px 0 40px;
  }
`;

const MainContentInner = styled(motion.div)`
  position: relative;
  z-index: 1;
  width: 100%;
  transform-origin: center top;
  will-change: transform, opacity;
`;

const GridContainer = styled.div`
  position: relative;
  z-index: 1;
  width: min(900px, calc(100% - 48px));
  margin: 0 auto;
  padding: clamp(16px, 3vw, 24px) 20px clamp(32px, 4vw, 48px);
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: clamp(12px, 2vw, 24px);
  overflow: visible;
  box-sizing: border-box;

  @media (max-width: 768px) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    width: calc(100% - 32px);
    margin: 0 auto;
    padding: 12px 0 32px;
    gap: 16px;
  }

  @media (max-width: 480px) {
    grid-template-columns: minmax(0, 1fr);
    gap: 16px;
  }

  [data-card] {
    min-width: 0;
    overflow-wrap: anywhere;
    font-size: clamp(0.75rem, 1.5vw, 1rem);
    padding: 24px 20px 20px 20px;
    box-sizing: border-box;

    @media (max-width: 768px) {
      padding: 16px 14px 14px 14px;
    }

    @media (max-width: 480px) {
      padding: 20px;
    }
  }

  .card-square {
    aspect-ratio: 1 / 1;

    &.col-1 {
      grid-column: 1 / 2;
    }
    &.col-2 {
      grid-column: 2 / 3;
    }
    &.col-3 {
      grid-column: 3 / 4;
    }

    @media (max-width: 768px) {
      aspect-ratio: auto;
      min-height: 150px;

      &.col-1,
      &.col-2 {
        grid-column: auto;
      }
      &.col-3 {
        grid-column: 1 / -1;
        min-height: auto;
      }
    }

    @media (max-width: 480px) {
      min-height: 160px;
      &.col-3 {
        min-height: auto;
      }
    }
  }

  .quote-banner {
    grid-column: 1 / 4;
    align-items: center;
    justify-content: center;
    text-align: left;
    padding: clamp(14px, 2.5vw, 22px) clamp(20px, 3vw, 28px);
    letter-spacing: clamp(0.12em, 0.4vw, 0.25em);
    line-height: 1.5;
    user-select: none;
    border-radius: 16px;

    @property --hue {
      syntax: "<number>";
      inherits: false;
      initial-value: 0;
    }

    & span {
      background: linear-gradient(
        in oklab,
        oklch(0.75 0.125 var(--hue)) 25%,
        oklch(0.75 0.2 calc(var(--hue) + 300))
      );

      background-clip: text;
      -webkit-background-clip: text;
      color: transparent;
      animation: ${hueChange} 10s linear infinite;
    }

    @media (max-width: 768px) {
      grid-column: 1 / -1;
      text-align: center;
      padding: 14px 16px;
      letter-spacing: clamp(0.08em, 0.3vw, 0.18em);
    }
  }

  .moment-card {
    grid-column: 1 / 3;

    @media (max-width: 768px) {
      grid-column: 1 / -1;
    }
  }

  .mascot-calendar {
    position: relative;
    grid-column: 3 / 4;
    aspect-ratio: 1 / 1;
    overflow: visible;

    &::before {
      content: "";
      position: absolute;
      inset: 0;
      transform: translateY(-50%);
      background-image: url(${catApng});
      background-size: 60% auto;
      background-position: right 6% center;
      background-repeat: no-repeat;
      z-index: 10;
      pointer-events: none;
    }

    @media (max-width: 768px) {
      grid-column: 1 / -1;
      aspect-ratio: auto;
      min-height: 260px;

      &::before {
        background-size: clamp(90px, 36%, 130px) auto;
        background-position: right 5% center;
      }
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .quote-banner span { animation: none; color: var(--main-color); }
  }
`;
