import React from "react";
import {
  cubicBezier,
  motion,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
} from "framer-motion";
import styled, { keyframes } from "styled-components";
import MainLayout from "../layouts/MainLayout";
import Social from "../components/common/Social";
import ScrollArrow from "../components/home/ScrollArrow";
import Background from "../components/layout/Background";
import Quote from "../components/home/Quote";
import SideButton from "../components/layout/SideButton";
import Loader from "../components/common/Loader";
import { useLocale } from "../i18n/useLocale";
import { useCardStyle, useTheme } from "../stores/themeStore";
import { CARD_STYLES } from "../config/theme";
import {
  SiteStats,
  LatestArticle,
  TagCloud,
  LatestMoment,
  MiniCalendar,
} from "../components/home/HomeWidgets";
import HomeJournal from "../components/home/HomeContent";
import CrystalizedBall from "../components/home/CrystalizedBall";
import SpiralGalaxy from "../components/home/SpiralGalaxy";
import catApng from "../assets/imgs/cat.apng";

export default function Home() {
  const { locale } = useLocale();
  const { cardStyle } = useCardStyle();
  const { effectiveTheme } = useTheme();
  const title = locale === "zh-CN" ? "半生雨" : "Oblivion";

  React.useEffect(() => {
    document.title = title;
  }, [title]);

  const isGlassTheme = cardStyle === "glass";

  const reduceMotion = useReducedMotion();
  const [failedVideo, setFailedVideo] = React.useState<string | null>(null);
  const [readyVideo, setReadyVideo] = React.useState<string | null>(null);
  const configuredVideo: string | null =
    CARD_STYLES.find((s) => s.id === cardStyle)?.video ?? null;
  const videoSrc: string | null =
    !reduceMotion && configuredVideo !== failedVideo ? configuredVideo : null;
  const videoRef = React.useRef<HTMLVideoElement>(null);

  const [vh, setVh] = React.useState(() =>
    typeof window !== "undefined" ? window.innerHeight : 800,
  );
  const [isMobile, setIsMobile] = React.useState(() =>
    typeof window !== "undefined" ? window.innerWidth <= 768 : false,
  );

  React.useEffect(() => {
    const handleResize = () => {
      setVh(window.innerHeight);
      setIsMobile(window.innerWidth <= 768);
    };
    window.addEventListener("resize", handleResize, { passive: true });
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const { scrollY } = useScroll();
  const smoothScrollY = useSpring(scrollY, {
    stiffness: 120,
    damping: 24,
    mass: 0.18,
    restDelta: 0.001,
  });
  const activeScrollY = reduceMotion ? scrollY : smoothScrollY;

  // 动画滚动行程与视口高度严格绑定，确保 Main（main-bg）的上边缘真正到达屏幕顶部时才恰好完全展开
  const animDistance = vh;

  // 丝滑阻尼曲线：起步顺滑、中段自然线性、接近顶部软着陆，杜绝卡顿与突兀冲撞
  const dampEase = cubicBezier(0.25, 0.1, 0.25, 1);

  // 上图（Hero 区域）：3D 透视微倾角 + 景深变焦虚化 + 圆角立体悬浮卡片（跟随阻尼）
  const heroScale = useTransform(activeScrollY, [0, animDistance * 0.9], [1, 0.58], {
    ease: dampEase,
  });
  const heroRotateX = useTransform(activeScrollY, [0, animDistance * 0.9], [0, 6], {
    ease: dampEase,
  });
  const heroOpacity = useTransform(
    activeScrollY,
    [0, animDistance * 0.9, animDistance],
    [1, 0.2, 0],
    { ease: dampEase },
  );
  const heroRadius = useTransform(
    activeScrollY,
    [0, animDistance * 0.9],
    ["0px", "40px"],
    { ease: dampEase },
  );
  const heroShadow = useTransform(
    activeScrollY,
    [0, animDistance * 0.8],
    ["0px 0px 0px rgba(0,0,0,0)", "0px 30px 90px rgba(0,0,0,0.9)"],
    { ease: dampEase },
  );
  const heroFilter = useTransform(
    activeScrollY,
    [0, animDistance * 0.9],
    ["blur(0px) brightness(1)", "blur(8px) brightness(0.65)"],
    { ease: dampEase },
  );
  const heroContentY = useTransform(
    activeScrollY,
    [0, animDistance * 0.38],
    [0, -35],
    { ease: dampEase },
  );
  const heroContentOpacity = useTransform(
    activeScrollY,
    [0, animDistance * 0.38],
    [1, 0],
    { ease: dampEase },
  );
  const heroContentScale = useTransform(
    activeScrollY,
    [0, animDistance * 0.38],
    [1, 0.85],
    { ease: dampEase },
  );

  // 主内容外层容器（Main）：双端高阻尼。在页面底部起步时强抗展开保持卡片形态；在顶部靠泊时减速吸附展开，杜绝突兀冲撞
  const initialClip = isMobile
    ? "inset(0% 2% 0% 2% round 20px 20px 0px 0px)"
    : "inset(0% 8% 0% 8% round 36px 36px 0px 0px)";
  const mainClipPath = useTransform(
    activeScrollY,
    [0, animDistance],
    [
      initialClip,
      "inset(0% 0% 0% 0% round 0px 0px 0px 0px)",
    ],
    { ease: dampEase },
  );

  // 下图（Main 背景图）：景深拉近、对焦与垂直视差位移均施加双端物理阻尼感
  const mainBgScale = useTransform(activeScrollY, [0, animDistance], [0.65, 1], {
    ease: dampEase,
  });
  const mainBgY = useTransform(activeScrollY, [0, animDistance], [45, 0], {
    ease: dampEase,
  });
  const mainBgOpacity = useTransform(
    activeScrollY,
    [0, animDistance * 0.75, animDistance],
    [0.25, 0.9, 1],
    { ease: dampEase },
  );
  const mainBgFilter = useTransform(
    activeScrollY,
    [0, animDistance * 0.85, animDistance],
    [
      "blur(10px) brightness(0.65)",
      "blur(1px) brightness(0.95)",
      "blur(0px) brightness(1)",
    ],
    { ease: dampEase },
  );

  // 容器内部所有内容（网格卡片 + 雨夜手记正文）：垂直浮升与缩放同步施加双端阻尼感
  const contentScale = useTransform(activeScrollY, [0, animDistance], [0.8, 1], {
    ease: dampEase,
  });
  const contentY = useTransform(activeScrollY, [0, animDistance], [55, 0], {
    ease: dampEase,
  });
  const contentOpacity = useTransform(
    activeScrollY,
    [0, animDistance * 0.65, animDistance],
    [0.35, 0.9, 1],
    { ease: dampEase },
  );

  // 衔接地平线流光光刃：在卡片破土与靠泊时随阻尼动态呼吸
  const glowOpacity = useTransform(
    activeScrollY,
    [0, animDistance * 0.25, animDistance * 0.85, animDistance * 1.05],
    [0, 1, 1, 0],
    { ease: dampEase },
  );

  const safeHeroScale = reduceMotion ? 1 : heroScale;
  const safeHeroRotateX = reduceMotion ? 0 : heroRotateX;
  const safeHeroOpacity = reduceMotion ? 1 : heroOpacity;
  const safeHeroRadius = reduceMotion ? "0px" : heroRadius;
  const safeHeroShadow = reduceMotion ? "none" : heroShadow;
  const safeHeroFilter = reduceMotion ? "none" : heroFilter;
  const safeHeroContentY = reduceMotion ? 0 : heroContentY;
  const safeHeroContentOpacity = reduceMotion ? 1 : heroContentOpacity;
  const safeHeroContentScale = reduceMotion ? 1 : heroContentScale;

  const safeMainClipPath = reduceMotion
    ? "inset(0% 0% 0% 0% round 0px 0px 0px 0px)"
    : mainClipPath;
  const safeMainBgScale = reduceMotion ? 1 : mainBgScale;
  const safeMainBgY = reduceMotion ? 0 : mainBgY;
  const safeMainBgOpacity = reduceMotion ? 1 : mainBgOpacity;
  const safeMainBgFilter = reduceMotion ? "none" : mainBgFilter;

  const safeContentScale = reduceMotion ? 1 : contentScale;
  const safeContentY = reduceMotion ? 0 : contentY;
  const safeContentOpacity = reduceMotion ? 1 : contentOpacity;

  const safeGlowOpacity = reduceMotion ? 0 : glowOpacity;

  React.useEffect(() => {
    const video = videoRef.current;
    const main = document.querySelector("main");
    if (!video || !main) return;

    let cancelled = false;
    const syncPlayback = () => {
      if (
        document.hidden ||
        main.getBoundingClientRect().top <= window.innerHeight / 2
      ) {
        video.pause();
      } else if (video.paused) {
        void video.play().catch((error: unknown) => {
          if (
            cancelled ||
            document.hidden ||
            (error instanceof DOMException && error.name === "AbortError")
          )
            return;
          setFailedVideo(videoSrc);
        });
      }
    };

    const observer = new IntersectionObserver(syncPlayback, {
      rootMargin: "0px 0px -50% 0px",
    });
    observer.observe(main);
    document.addEventListener("visibilitychange", syncPlayback);
    syncPlayback();

    return () => {
      cancelled = true;
      observer.disconnect();
      document.removeEventListener("visibilitychange", syncPlayback);
      video.pause();
    };
  }, [videoSrc]);

  // 磁吸吸附门槛与物理高回弹系统：
  // 1. 滚动一点点（未越过 50% 门槛）时，松手后以物理弹簧曲线极速回弹归位（0 或 vh）
  // 2. 只有滚动幅度很大（跨越 50% 门槛）时，松手后才推进并牢牢吸附到下一阶段
  // 3. 进入正文文章区（>= vh）100% 放行原生自由滚动，绝不阻塞任何正常浏览
  React.useEffect(() => {
    if (reduceMotion) return;

    let snapTimer: ReturnType<typeof setTimeout> | null = null;
    let snapRafId = 0;
    let isSnapping = false;
    let isTouching = false;
    let lastInputType: "touch" | "wheel" = "wheel";
    let lastY = window.scrollY;
    let lastDirection: "down" | "up" = "down";

    // 经典 Apple 物理流体弹簧曲线：初速度快、回弹决断、平稳收尾
    const springEase = cubicBezier(0.22, 1, 0.36, 1);

    const cancelPendingSnap = () => {
      if (snapTimer) {
        clearTimeout(snapTimer);
        snapTimer = null;
      }
      if (isSnapping) {
        cancelAnimationFrame(snapRafId);
        document.documentElement.style.scrollBehavior = "";
        isSnapping = false;
      }
    };

    const performSnap = (targetY: number) => {
      cancelPendingSnap();
      const startY = window.scrollY;
      const distance = targetY - startY;

      if (Math.abs(distance) < 2) {
        window.scrollTo(0, targetY);
        lastY = targetY;
        isSnapping = false;
        return;
      }

      isSnapping = true;
      // 临时解除全局 scroll-behavior: smooth，确保 requestAnimationFrame 帧帧即时响应
      document.documentElement.style.scrollBehavior = "auto";

      // 回弹行程短则 180ms 迅速抽回，翻页行程长则 360ms 稳健贴合
      const duration = Math.min(
        380,
        Math.max(180, Math.sqrt(Math.abs(distance)) * 12),
      );
      const startTime = performance.now();

      const step = (now: number) => {
        if (!isSnapping) {
          document.documentElement.style.scrollBehavior = "";
          return;
        }

        const elapsed = now - startTime;
        const progress = Math.min(1, elapsed / duration);
        const currentPos = startY + distance * springEase(progress);

        window.scrollTo(0, Math.max(0, currentPos));

        if (progress < 1) {
          snapRafId = requestAnimationFrame(step);
        } else {
          window.scrollTo(0, targetY);
          lastY = targetY;
          document.documentElement.style.scrollBehavior = "";
          isSnapping = false;
        }
      };

      snapRafId = requestAnimationFrame(step);
    };

    const evaluateSnap = () => {
      // 如果手指仍然按在屏幕上，绝对不抢夺手指控制权
      if (isTouching) return;

      const currentY = window.scrollY;

      // 仅在 Hero 与 Main 转场过渡区 (0, vh) 内部介入，边缘 10px 内无需介入
      if (currentY <= 10 || currentY >= vh - 10) {
        isSnapping = false;
        return;
      }

      // 黄金分水岭门槛：50% 视口高度
      // 滚动一点点（< 50%）一律强烈回弹！大幅度翻过 50% 才能继续推进！
      const threshold = vh * 0.5;

      let targetY = 0;

      if (lastDirection === "down") {
        // 向下滚动中：只要未过半（滚动幅度小），一律迅速回弹回顶部 0！
        // 只有大幅度滚动超过一半，才推进并吸附至 vh 全屏展开！
        targetY = currentY >= threshold ? vh : 0;
      } else {
        // 向上滚动中：只要未过半，一律迅速回弹回全屏 vh！
        // 只有大幅度往上拉超过一半，才完全退回顶部 0！
        targetY = currentY <= threshold ? 0 : vh;
      }

      if (Math.abs(currentY - targetY) > 2) {
        performSnap(targetY);
      }
    };

    const scheduleSnap = (delay: number) => {
      if (snapTimer) {
        clearTimeout(snapTimer);
      }
      const currentY = window.scrollY;
      if (currentY > 10 && currentY < vh - 10) {
        snapTimer = setTimeout(evaluateSnap, delay);
      }
    };

    const handleScroll = () => {
      const currentY = window.scrollY;
      const delta = currentY - lastY;
      lastY = currentY;

      // 如果当前正在由 performSnap 执行物理回弹，不重置定时器
      if (isSnapping) return;

      if (delta > 0) {
        lastDirection = "down";
      } else if (delta < 0) {
        lastDirection = "up";
      }

      // 手指按在屏幕上拖拽时绝不触发吸附
      if (isTouching) return;

      // 差异化吸附防抖延迟：
      // 1. 触摸端手指离屏后：只需 60ms 极速响应，即松手即回弹，彻底摆脱迟钝感！
      // 2. 滚轮端滚动中：预留 280ms 充足间隔，避免在两次滚轮刻度间隔（通常 180~250ms）中误触吸附导致打架顿挫！
      const delay = lastInputType === "touch" ? 60 : 280;
      scheduleSnap(delay);
    };

    const handleWheel = () => {
      lastInputType = "wheel";
      cancelPendingSnap();
      scheduleSnap(280);
    };

    const handleTouchStart = () => {
      lastInputType = "touch";
      isTouching = true;
      cancelPendingSnap();
    };

    const handleTouchMove = () => {
      lastInputType = "touch";
      isTouching = true;
      cancelPendingSnap();
    };

    const handleTouchEnd = () => {
      isTouching = false;
      // 手指离开屏幕后，以 60ms 超短延迟迅速评估回弹/吸附
      scheduleSnap(60);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("wheel", handleWheel, { passive: true });
    window.addEventListener("touchstart", handleTouchStart, { passive: true });
    window.addEventListener("touchmove", handleTouchMove, { passive: true });
    window.addEventListener("touchend", handleTouchEnd, { passive: true });
    window.addEventListener("touchcancel", handleTouchEnd, { passive: true });

    return () => {
      cancelPendingSnap();
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("wheel", handleWheel);
      window.removeEventListener("touchstart", handleTouchStart);
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("touchend", handleTouchEnd);
      window.removeEventListener("touchcancel", handleTouchEnd);
    };
  }, [vh, reduceMotion]);

  return (
    <MainLayout
      hero={
        <HomeSection>
          <HomeBg
            $isGlass={isGlassTheme}
            aria-hidden="true"
            style={{
              scale: safeHeroScale,
              rotateX: safeHeroRotateX,
              opacity: safeHeroOpacity,
              borderRadius: safeHeroRadius,
              boxShadow: safeHeroShadow,
              filter: safeHeroFilter,
            }}
          >
            {isGlassTheme ? (
              <GlassHeroBackground $isLight={effectiveTheme === "light"}>
                <SpiralGalaxy theme={effectiveTheme} />
                <CrystalizedBallWrapper>
                  <CrystalizedBall
                    preset="plasma"
                    color="#F25BD0"
                    theme={effectiveTheme}
                    size={0.7}
                    crackle={0.3}
                    fill={0.6}
                    interactive={false}
                    hoverStrength={0.7}
                    sparks={0.75}
                    particleCount={31500}
                    particleShape="round"
                    depth={0.65}
                    sway={0.3}
                    twinkle={0.7}
                    dustSpeed={2}
                    speed={0.95}
                  />
                </CrystalizedBallWrapper>
              </GlassHeroBackground>
            ) : videoSrc ? (
              <HomeVideo
                key={videoSrc}
                ref={videoRef}
                src={videoSrc}
                loop
                muted
                playsInline
                preload="metadata"
                $isReady={readyVideo === videoSrc}
                onLoadedData={() => setReadyVideo(videoSrc)}
                onError={() => setFailedVideo(videoSrc)}
              />
            ) : null}
          </HomeBg>
          <WelcomeContent
            style={{
              opacity: safeHeroContentOpacity,
              scale: safeHeroContentScale,
              y: safeHeroContentY,
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
          clipPath: safeMainClipPath,
          WebkitClipPath: safeMainClipPath,
        }}
      >
        <TopGlowLine style={{ opacity: safeGlowOpacity }} />
        <MainBg
          style={{
            scale: safeMainBgScale,
            y: safeMainBgY,
            opacity: safeMainBgOpacity,
            filter: safeMainBgFilter,
          }}
        />

        <MainContentInner
          style={{
            scale: safeContentScale,
            y: safeContentY,
            opacity: safeContentOpacity,
          }}
        >
          <GridContainer>
            <GridSquareCard $col={1} data-card="glass">
              <SiteStats />
            </GridSquareCard>
            <GridSquareCard $col={2} data-card="glass">
              <LatestArticle />
            </GridSquareCard>
            <GridSquareCard $col={3} data-card="glass">
              <TagCloud />
            </GridSquareCard>
            <QuoteBannerCard data-card="glass">
              <span>落霞与孤鹜齐飞，秋水共长天一色</span>
            </QuoteBannerCard>
            <MomentCard data-card="glass">
              <LatestMoment />
            </MomentCard>
            <MascotCalendarCard data-card="glass">
              <MiniCalendar />
            </MascotCalendarCard>
          </GridContainer>

          <HomeContentSection>
            <HomeJournal />
          </HomeContentSection>
        </MainContentInner>
      </Main>
    </MainLayout>
  );
}

const welcomeIntro = keyframes`
  from {
    opacity: 0;
    transform: translateY(28px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const hueChange = keyframes`
  from {
    --hue: 0;
  }
  to {
    --hue: 360;
  }
`;

const HomeSection = styled.section`
  height: 100dvh;
  width: 100%;
  position: relative;
  overflow: hidden;
  background-color: #000;
  perspective: 1200px;
`;

const GlassHeroBackground = styled.div<{ $isLight?: boolean }>`
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
  background: ${(props) =>
    props.$isLight
      ? "radial-gradient(circle at 50% 50%, rgba(242, 91, 208, 0.08) 0%, rgba(148, 120, 255, 0.04) 40%, #f6f8fb 85%)"
      : "radial-gradient(circle at 50% 50%, rgba(242, 91, 208, 0.12) 0%, rgba(20, 10, 35, 0.8) 50%, #05030a 95%)"};
  pointer-events: none;
`;

const CrystalizedBallWrapper = styled.div`
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: none;
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
  background-color: ${(props) => (props.$isGlass ? "var(--bg-0)" : "#000")};
  background-position: center;
  background-size: cover;
  background-repeat: no-repeat;
  transform-origin: center center;
  will-change: transform, opacity, filter;
`;

const HomeVideo = styled.video<{ $isReady: boolean }>`
  width: 100%;
  height: 100%;
  object-fit: cover;
  position: absolute;
  top: 0;
  left: 0;
  z-index: 0;
  opacity: ${(props) => (props.$isReady ? 1 : 0)};
  transition: opacity 0.3s ease;
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

const MainContentInner = styled(motion.div)`
  position: relative;
  z-index: 1;
  width: 100%;
  transform-origin: center top;
  will-change: transform, opacity;
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
  padding: 40px 0 80px;

  @media (max-width: 768px) {
    padding: 16px 0 40px;
  }
`;

const GridContainer = styled.div`
  position: relative;
  z-index: 1;
  width: 90%;
  max-width: 900px;
  margin: 0 auto;
  padding: clamp(16px, 3vw, 24px) 20px clamp(32px, 4vw, 48px);
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: clamp(12px, 2vw, 24px);
  overflow: visible;
  box-sizing: border-box;

  @media (max-width: 768px) {
    grid-template-columns: 1fr 1fr;
    width: 94%;
    margin: 16px auto 32px;
    padding: 12px 4px;
    gap: 12px;
  }

  @media (max-width: 480px) {
    grid-template-columns: 1fr 1fr;
    width: 96%;
    margin: 12px auto 24px;
    padding: 8px 2px;
    gap: 10px;
  }
`;

const GridCard = styled.div`
  position: relative;
  box-sizing: border-box;
  font-size: clamp(0.75rem, 1.5vw, 1rem);
  transition:
    transform 0.25s cubic-bezier(0.2, 0.8, 0.2, 1),
    box-shadow 0.25s cubic-bezier(0.2, 0.8, 0.2, 1);
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: stretch;
  min-width: 0;
`;

const GridSquareCard = styled(GridCard)<{ $col: 1 | 2 | 3 }>`
  aspect-ratio: 1 / 1;
  grid-column: ${(props) => props.$col} / ${(props) => props.$col + 1};

  @media (max-width: 768px) {
    grid-column: ${(props) => (props.$col === 3 ? "1 / -1" : "auto")};
    aspect-ratio: auto;
    min-height: ${(props) => (props.$col === 3 ? "auto" : "150px")};
  }

  @media (max-width: 480px) {
    min-height: ${(props) => (props.$col === 3 ? "auto" : "135px")};
  }
`;

const QuoteBannerCard = styled(GridCard)`
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
`;

const MomentCard = styled(GridCard)`
  grid-column: 1 / 3;

  @media (max-width: 768px) {
    grid-column: 1 / -1;
  }
`;

const MascotCalendarCard = styled(GridCard)`
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
`;

const HomeContentSection = styled.div`
  position: relative;
  z-index: 1;
  width: 100%;
  max-width: 1000px;
  margin: 0 auto;
  padding: 0;
  display: flex;
  flex-direction: column;

  @media (max-width: 768px) {
    width: 100%;
    padding: 0;
  }
`;
