import React from "react";
import {
  cubicBezier,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
  type MotionValue,
} from "framer-motion";
import { keyframes } from "styled-components";

/**
 * 欢迎区域入场上浮淡入动画
 */
export const welcomeIntro = keyframes`
  from {
    opacity: 0;
    transform: translateY(28px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

export interface HomeAnimationValues {
  reduceMotion: boolean | null;
  vh: number;
  isMobile: boolean;

  // Hero 动画
  heroScale: MotionValue<number> | number;
  heroRotateX: MotionValue<number> | number;
  heroOpacity: MotionValue<number> | number;
  heroRadius: MotionValue<string> | string;
  heroShadow: MotionValue<string> | string;
  heroFilter: MotionValue<string> | string;
  heroContentY: MotionValue<number> | number;
  heroContentOpacity: MotionValue<number> | number;
  heroContentScale: MotionValue<number> | number;

  // Main 展开与背景动画
  mainClipPath: MotionValue<string> | string;
  mainBgScale: MotionValue<number> | number;
  mainBgY: MotionValue<number> | number;
  mainBgOpacity: MotionValue<number> | number;
  mainBgFilter: MotionValue<string> | string;

  // 正文容器内容浮升
  contentScale: MotionValue<number> | number;
  contentY: MotionValue<number> | number;
  contentOpacity: MotionValue<number> | number;

  // 靠泊流光光刃
  glowOpacity: MotionValue<number> | number;
}

/**
 * 首页完整动效 Hook：
 * 1. 响应式视口尺寸监听（vh、isMobile）
 * 2. 丝滑阻尼滚动差值计算（Spring 物理平滑）
 * 3. Hero 到 Main 的 3D 透视虚化、变焦卡片收缩与无缝展开转场
 * 4. 磁吸吸附门槛与物理高回弹系统（触控 60ms 极速响应、滚轮 280ms 防误触）
 */
export function useHomeAnimation(heroRef: React.RefObject<HTMLElement | null>): HomeAnimationValues {
  const reduceMotion = useReducedMotion();

  const [vh, setVh] = React.useState(() =>
    typeof window !== "undefined" ? window.innerHeight : 800,
  );
  const [isMobile, setIsMobile] = React.useState(() =>
    typeof window !== "undefined" ? window.innerWidth <= 768 : false,
  );

  React.useLayoutEffect(() => {
    const hero = heroRef.current;
    if (!hero) return;
    const handleResize = () => {
      setVh(hero.offsetHeight);
      setIsMobile(hero.offsetWidth <= 768);
    };
    handleResize();
    const observer = new ResizeObserver(handleResize);
    observer.observe(hero);
    return () => observer.disconnect();
  }, [heroRef]);

  const { scrollY } = useScroll();
  const smoothScrollY = useSpring(scrollY, {
    stiffness: 120,
    damping: 24,
    mass: 0.18,
    restDelta: 0.001,
  });
  const activeScrollY = reduceMotion ? scrollY : smoothScrollY;

  // 动画滚动行程与视口高度严格绑定，确保 Main（main-bg）的上边缘到达屏幕顶部时恰好完全展开
  const animDistance = vh;

  // 丝滑阻尼曲线：起步顺滑、中段自然线性、接近顶部软着陆，杜绝卡顿与突兀冲撞
  const dampEase = cubicBezier(0.25, 0.1, 0.25, 1);

  // 上图（Hero 区域）：3D 透视微倾角 + 景深变焦虚化 + 圆角立体悬浮卡片
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

  // 主内容外层容器（Main）：双端高阻尼。在底部保持卡片形态；在顶部靠泊时减速吸附展开
  const initialClip = isMobile
    ? "inset(0% 2% 0% 2% round 20px 20px 0px 0px)"
    : "inset(0% 8% 0% 8% round 36px 36px 0px 0px)";
  const mainClipPath = useTransform(
    activeScrollY,
    [0, animDistance],
    [initialClip, "inset(0% 0% 0% 0% round 0px 0px 0px 0px)"],
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

  // 容器内部所有内容（网格卡片）：垂直浮升与缩放同步施加双端阻尼感
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

  // 减弱动态偏好（prefers-reduced-motion）安全回退
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
      if (isTouching) return;

      const currentY = window.scrollY;

      // 仅在 Hero 与 Main 转场过渡区 (0, vh) 内部介入，边缘 10px 内无需介入
      if (currentY <= 10 || currentY >= vh - 10) {
        isSnapping = false;
        return;
      }

      // 黄金分水岭门槛：50% 视口高度
      const threshold = vh * 0.5;
      let targetY = 0;

      if (lastDirection === "down") {
        targetY = currentY >= threshold ? vh : 0;
      } else {
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

      if (isSnapping) return;

      if (delta > 0) {
        lastDirection = "down";
      } else if (delta < 0) {
        lastDirection = "up";
      }

      if (isTouching) return;

      // 差异化吸附防抖延迟：触控 60ms 即松手即回弹；滚轮 280ms 避免与刻度打架
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

  return {
    reduceMotion,
    vh,
    isMobile,
    heroScale: safeHeroScale,
    heroRotateX: safeHeroRotateX,
    heroOpacity: safeHeroOpacity,
    heroRadius: safeHeroRadius,
    heroShadow: safeHeroShadow,
    heroFilter: safeHeroFilter,
    heroContentY: safeHeroContentY,
    heroContentOpacity: safeHeroContentOpacity,
    heroContentScale: safeHeroContentScale,
    mainClipPath: safeMainClipPath,
    mainBgScale: safeMainBgScale,
    mainBgY: safeMainBgY,
    mainBgOpacity: safeMainBgOpacity,
    mainBgFilter: safeMainBgFilter,
    contentScale: safeContentScale,
    contentY: safeContentY,
    contentOpacity: safeContentOpacity,
    glowOpacity: safeGlowOpacity,
  };
}

/**
 * 视频播放与视口滚动位置/页面可见性同步
 */
export function useVideoPlaybackSync(
  videoRef: React.RefObject<HTMLVideoElement | null>,
  videoSrc: string | null,
  onFailed: (src: string | null) => void,
) {
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
          onFailed(videoSrc);
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
  }, [videoRef, videoSrc, onFailed]);
}

