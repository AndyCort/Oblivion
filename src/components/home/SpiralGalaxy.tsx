import React, { useEffect, useRef } from "react";
import { Renderer, Program, Mesh, Geometry } from "ogl";
import styled from "styled-components";

export interface SpiralGalaxyProps {
  theme?: "dark" | "light";
  starsCount?: number;
  arms?: number;
  speed?: number;
  className?: string;
  style?: React.CSSProperties;
}

const GalaxyContainer = styled.div`
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
  pointer-events: none;
`;

const vertexShader = `#version 300 es
precision highp float;

in vec3 aPosition;
in vec3 aColor;
in float aSize;
in float aTwinkle;

uniform vec2 uResolution;
uniform float uTime;
uniform float uPixelRatio;
uniform vec2 uMouse;

out vec3 vColor;
out float vAlpha;

void main() {
  vec3 pos = aPosition;
  
  // 1. 银河系自转（绕 Z 轴旋转）
  float angle = uTime * 0.055;
  float cosA = cos(angle);
  float sinA = sin(angle);
  vec3 spun = vec3(
    pos.x * cosA - pos.y * sinA,
    pos.x * sinA + pos.y * cosA,
    pos.z
  );
  
  // 2. 3D 空间立体倾角（X 轴俯仰角 + Y 轴偏航角 + 微弱鼠标视差）
  float pitch = 1.05 + uMouse.y * 0.12; // 俯仰角约 60 度，形成经典的银河盘透视感
  float yaw = -0.32 + uMouse.x * 0.12;
  
  float cp = cos(pitch);
  float sp = sin(pitch);
  vec3 tilted = vec3(
    spun.x,
    spun.y * cp - spun.z * sp,
    spun.y * sp + spun.z * cp
  );
  
  float cy = cos(yaw);
  float sy = sin(yaw);
  vec3 rotated = vec3(
    tilted.x * cy + tilted.z * sy,
    tilted.y,
    -tilted.x * sy + tilted.z * cy
  );
  
  // 3. 3D 透视投影
  float cameraZ = 1250.0;
  float zDepth = cameraZ + rotated.z;
  float fov = 950.0;
  float factor = fov / max(zDepth, 150.0);
  
  vec2 screenPos = rotated.xy * factor;
  gl_Position = vec4(screenPos / (uResolution * 0.5), 0.0, 1.0);
  
  // 4. 星星闪烁与透视尺寸衰减
  float twinkle = 0.72 + 0.28 * sin(uTime * 2.8 + aTwinkle * 6.28318);
  gl_PointSize = max(1.0, aSize * factor * uPixelRatio * twinkle);
  
  // 5. 景深透明度衰减：远端微弱虚化，近端透亮
  float depthFade = clamp((rotated.z + 500.0) / 1000.0, 0.4, 1.0);
  vColor = aColor;
  vAlpha = depthFade * twinkle;
}
`;

const fragmentShader = `#version 300 es
precision highp float;

in vec3 vColor;
in float vAlpha;
uniform float uLight;

out vec4 fragColor;

void main() {
  vec2 uv = gl_PointCoord - vec2(0.5);
  float r = length(uv);
  if (r > 0.5) discard;
  
  // 柔和光晕星芒核心
  float glow = exp(-r * 6.2);
  float core = smoothstep(0.18, 0.0, r) * 0.85;
  float brightness = (glow + core) * vAlpha;
  
  if (uLight > 0.5) {
    // 浅色模式下呈现细腻的水墨星点
    vec3 ink = mix(vColor, vec3(0.12, 0.08, 0.18), 0.45);
    fragColor = vec4(ink, brightness * 0.75);
    return;
  }
  
  fragColor = vec4(vColor * brightness, brightness);
}
`;

function generateGalaxyStars(starsCount = 16000, armCount = 4) {
  const positions = new Float32Array(starsCount * 3);
  const colors = new Float32Array(starsCount * 3);
  const sizes = new Float32Array(starsCount);
  const twinkles = new Float32Array(starsCount);

  // 色彩梯度：
  // 核心：超白亮星 + 粉紫等离子光（与中央等离子球 #F25BD0 呼应）
  const colorCore = [1.0, 0.98, 1.0]; // 白芯
  const colorInner = [0.95, 0.36, 0.82]; // 等离子粉紫 #F25BD0
  const colorMid = [0.65, 0.33, 0.98]; // 霓虹紫 #A855F7
  const colorOuter = [0.22, 0.74, 0.97]; // 深空青蓝 #38BDF8
  const colorEdge = [0.38, 0.40, 0.95]; // 旋臂外缘深靛蓝 #6366F1

  const maxRadius = 720;

  for (let i = 0; i < starsCount; i++) {
    const i3 = i * 3;

    // 幂次分布：大量恒星聚集在银心周围，越往旋臂外缘越稀疏
    const r = Math.pow(Math.random(), 2.1) * maxRadius;

    // 螺旋对数曲线：多旋臂结构
    const armIndex = i % armCount;
    const armAngle = (armIndex * 2 * Math.PI) / armCount;
    const spinAngle = r * 0.0072; // 旋臂卷曲率

    // 旋臂离散发散度
    const spread = (r / maxRadius) * 50 + 10;
    const randomX = Math.pow(Math.random(), 2) * (Math.random() < 0.5 ? 1 : -1) * spread;
    const randomY = Math.pow(Math.random(), 2) * (Math.random() < 0.5 ? 1 : -1) * spread;
    const randomZ = Math.pow(Math.random(), 2.4) * (Math.random() < 0.5 ? 1 : -1) * (spread * 0.6);

    const totalAngle = armAngle + spinAngle;
    const x = Math.cos(totalAngle) * r + randomX;
    const y = Math.sin(totalAngle) * r + randomY;
    const z = randomZ;

    positions[i3] = x;
    positions[i3 + 1] = y;
    positions[i3 + 2] = z;

    // 根据距离银心半径平滑插值色彩
    const ratio = r / maxRadius;
    let rCol: number, gCol: number, bCol: number;

    if (ratio < 0.16) {
      const t = ratio / 0.16;
      rCol = colorCore[0] * (1 - t) + colorInner[0] * t;
      gCol = colorCore[1] * (1 - t) + colorInner[1] * t;
      bCol = colorCore[2] * (1 - t) + colorInner[2] * t;
    } else if (ratio < 0.48) {
      const t = (ratio - 0.16) / 0.32;
      rCol = colorInner[0] * (1 - t) + colorMid[0] * t;
      gCol = colorInner[1] * (1 - t) + colorMid[1] * t;
      bCol = colorInner[2] * (1 - t) + colorMid[2] * t;
    } else if (ratio < 0.78) {
      const t = (ratio - 0.48) / 0.3;
      rCol = colorMid[0] * (1 - t) + colorOuter[0] * t;
      gCol = colorMid[1] * (1 - t) + colorOuter[1] * t;
      bCol = colorMid[2] * (1 - t) + colorOuter[2] * t;
    } else {
      const t = (ratio - 0.78) / 0.22;
      rCol = colorOuter[0] * (1 - t) + colorEdge[0] * t;
      gCol = colorOuter[1] * (1 - t) + colorEdge[1] * t;
      bCol = colorOuter[2] * (1 - t) + colorEdge[2] * t;
    }

    // 随机 3% 的璀璨特超巨星高亮
    if (Math.random() < 0.035) {
      rCol = Math.min(1.0, rCol * 1.3);
      gCol = Math.min(1.0, gCol * 1.3);
      bCol = Math.min(1.0, bCol * 1.3);
    }

    colors[i3] = rCol;
    colors[i3 + 1] = gCol;
    colors[i3 + 2] = bCol;

    sizes[i] = Math.random() < 0.06 ? 3.6 + Math.random() * 2.8 : 1.2 + Math.random() * 1.8;
    twinkles[i] = Math.random();
  }

  return { positions, colors, sizes, twinkles };
}

export default function SpiralGalaxy({
  theme = "dark",
  starsCount = 16000,
  arms = 4,
  speed = 1,
  className = "",
  style,
}: SpiralGalaxyProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const themeRef = useRef(theme);
  const speedRef = useRef(speed);
  themeRef.current = theme;
  speedRef.current = speed;

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const renderer = new Renderer({
      alpha: true,
      premultipliedAlpha: true,
      antialias: false,
      depth: false,
    });
    const gl = renderer.gl;
    if (!renderer.isWebgl2) {
      gl.getExtension("WEBGL_lose_context")?.loseContext();
      return;
    }

    const canvas = gl.canvas;
    canvas.style.display = "block";
    canvas.style.width = "100%";
    canvas.style.height = "100%";
    canvas.setAttribute("aria-hidden", "true");
    container.appendChild(canvas);

    const galaxyData = generateGalaxyStars(starsCount, arms);

    const geometry = new Geometry(gl, {
      aPosition: { size: 3, data: galaxyData.positions },
      aColor: { size: 3, data: galaxyData.colors },
      aSize: { size: 1, data: galaxyData.sizes },
      aTwinkle: { size: 1, data: galaxyData.twinkles },
    });

    const uniforms = {
      uResolution: { value: [1, 1] },
      uTime: { value: 0 },
      uPixelRatio: { value: 1 },
      uMouse: { value: [0, 0] },
      uLight: { value: theme === "light" ? 1 : 0 },
    };

    const program = new Program(gl, {
      vertex: vertexShader,
      fragment: fragmentShader,
      uniforms,
      transparent: true,
      depthTest: false,
      depthWrite: false,
    });

    // 默认深色使用加法发光混合，浅色使用透明度柔和混合
    if (theme === "light") {
      program.setBlendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
    } else {
      program.setBlendFunc(gl.ONE, gl.ONE);
    }

    const mesh = new Mesh(gl, {
      mode: gl.POINTS,
      geometry,
      program,
    });

    let width = 1;
    let height = 1;
    let raf = 0;
    let last = performance.now();
    let time = 0;
    let visible = true;
    let alive = true;

    const mouse = { x: 0, y: 0, targetX: 0, targetY: 0 };

    const resize = () => {
      width = Math.max(1, container.clientWidth);
      height = Math.max(1, container.clientHeight);
      renderer.dpr = Math.min(window.devicePixelRatio || 1, 2);
      renderer.setSize(width, height);
      uniforms.uResolution.value = [width, height];
      uniforms.uPixelRatio.value = renderer.dpr;
      start();
    };

    const frame = (now: number) => {
      raf = 0;
      if (!alive) return;

      const dt = Math.min(0.05, Math.max(1 / 240, (now - last) / 1000));
      last = now;

      time += dt * speedRef.current;
      uniforms.uTime.value = time;
      uniforms.uLight.value = themeRef.current === "light" ? 1 : 0;

      // 鼠标缓动跟随
      mouse.x += (mouse.targetX - mouse.x) * 0.05;
      mouse.y += (mouse.targetY - mouse.y) * 0.05;
      uniforms.uMouse.value = [mouse.x, mouse.y];

      gl.clearColor(0, 0, 0, 0);
      renderer.render({ scene: mesh, clear: true });

      if (visible) {
        raf = requestAnimationFrame(frame);
      }
    };

    const start = () => {
      if (raf || !visible || !alive) return;
      last = performance.now();
      raf = requestAnimationFrame(frame);
    };

    const onPointerMove = (e: MouseEvent) => {
      const halfW = window.innerWidth / 2;
      const halfH = window.innerHeight / 2;
      mouse.targetX = (e.clientX - halfW) / halfW;
      mouse.targetY = (e.clientY - halfH) / halfH;
      start();
    };

    const onVisibility = () => {
      if (!document.hidden) start();
    };

    window.addEventListener("pointermove", onPointerMove, { passive: true });
    document.addEventListener("visibilitychange", onVisibility);

    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(container);

    const intersectionObserver = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (visible) start();
    });
    intersectionObserver.observe(container);

    resize();

    return () => {
      alive = false;
      visible = false;
      cancelAnimationFrame(raf);
      resizeObserver.disconnect();
      intersectionObserver.disconnect();
      window.removeEventListener("pointermove", onPointerMove);
      document.removeEventListener("visibilitychange", onVisibility);
      geometry.remove();
      gl.getExtension("WEBGL_lose_context")?.loseContext();
      if (canvas.parentNode) canvas.parentNode.removeChild(canvas);
    };
  }, [starsCount, arms]);

  return (
    <GalaxyContainer
      ref={containerRef}
      className={`spiral-galaxy ${className}`.trim()}
      style={style}
    />
  );
}

