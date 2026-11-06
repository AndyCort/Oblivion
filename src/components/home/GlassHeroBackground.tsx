import { useState, useEffect } from "react";
import styled from "styled-components";
import CrystalizedBall from "./CrystalizedBall";
import SpiralGalaxy from "./SpiralGalaxy";

/**
 * 根据屏幕宽度阶梯式适配粒子数量：
 * - 手机窄屏 (<= 480px): ~9,000 粒（球体像素半径小，高密度防过绘，保证 60fps 丝滑不发热）
 * - 大屏手机/小平板 (<= 768px): ~14,000 粒
 * - 平板/窄屏笔记本 (<= 1024px): ~20,000 粒
 * - 普通桌面显示器 (<= 1440px): ~26,000 粒
 * - 大屏/2K/4K 高分屏 (> 1440px): 31,500 粒（满血璀璨星云效果）
 */
function getAdaptiveParticleCount(width: number): number {
  if (width <= 480) return 9000;
  if (width <= 768) return 14000;
  if (width <= 1024) return 20000;
  if (width <= 1440) return 26000;
  return 31500;
}

export default function GlassHeroBackground() {
  const [particleCount, setParticleCount] = useState(() =>
    typeof window !== "undefined" ? getAdaptiveParticleCount(window.innerWidth) : 26000
  );

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | null = null;
    const handleResize = () => {
      if (timer) clearTimeout(timer);
      timer = setTimeout(() => {
        setParticleCount(getAdaptiveParticleCount(window.innerWidth));
      }, 150);
    };

    window.addEventListener("resize", handleResize, { passive: true });
    return () => {
      if (timer) clearTimeout(timer);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return (
    <Wrapper>
      <SpiralGalaxy theme="dark" size={1.0} />
      <div className="ball-wrapper">
        <CrystalizedBall
          preset="plasma"
          color="#F25BD0"
          theme="dark"
          size={0.7}
          crackle={0.3}
          fill={0.6}
          interactive={false}
          hoverStrength={0.7}
          sparks={0.75}
          particleCount={particleCount}
          particleShape="round"
          depth={0.65}
          sway={0.3}
          twinkle={0.7}
          dustSpeed={2}
          speed={0.95}
        />
      </div>
    </Wrapper>
  );
}

const Wrapper = styled.div`
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
  background: radial-gradient(
    circle at 50% 50%,
    rgba(242, 91, 208, 0.08) 0%,
    rgba(14, 6, 24, 0.35) 25%,
    #020105 60%,
    #000000 100%
  );
  pointer-events: none;

  .ball-wrapper {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    pointer-events: none;
  }
`;

