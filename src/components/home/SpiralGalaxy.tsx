import React, { useEffect, useRef } from "react";
import { Renderer, Program, Mesh, Geometry } from "ogl";
import styled from "styled-components";

export interface SpiralGalaxyProps {
  theme?: "dark" | "light";
  starsCount?: number;
  arms?: number;
  speed?: number;
  paused?: boolean;
  size?: number;
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
in float aType; // 0:恒星, 1:前景星尘, 2:超巨星(十字星芒), 3:深空背景星, 4:伴星系A, 5:球状星团B

uniform vec2 uResolution;
uniform float uTime;
uniform float uPixelRatio;
uniform float uScale;

out vec3 vColor;
out float vAlpha;
out float vType;

void main() {
  vec3 pos = aPosition;
  
  // 1. 响应式银河体量缩放：
  // 宽屏/桌面端：以视口尺寸自适应，让旋臂气势恢宏地铺展并环抱中央球体，延展跨越整个视口
  // 竖屏/移动端：保持饱满充盈，旋臂环绕球体上下延展
  float isLandscape = uResolution.x > uResolution.y ? 1.0 : 0.0;
  float desktopScale = max(uResolution.x / 1440.0, uResolution.y / 900.0) * 1.95;
  float mobileScale = (uResolution.x / 390.0) * 1.35;
  float viewScale = mix(mobileScale, desktopScale, isLandscape) * uScale;
  
  // 2. 多天体运动学系统
  vec3 spun = pos;
  
  if (aType < 2.5) {
    // 0.0 恒星 / 1.0 前景星尘 / 2.0 超巨星：主银河开普勒差速自转
    float dist = length(pos.xy);
    float speedFactor = 0.040 / (1.0 + dist * 0.0011);
    float angle = uTime * speedFactor;
    float cosA = cos(angle);
    float sinA = sin(angle);
    spun = vec3(
      pos.x * cosA - pos.y * sinA,
      pos.x * sinA + pos.y * cosA,
      pos.z
    );
  } else if (aType > 3.5 && aType < 4.5) {
    // 4.0: 右上角伴星系 A（绕银心慢速公转 + 自转）
    vec3 c = vec3(850.0, 580.0, 120.0);
    float orbAngle = uTime * 0.010;
    float cosO = cos(orbAngle);
    float sinO = sin(orbAngle);
    vec3 orbC = vec3(c.x * cosO - c.y * sinO * 0.5, c.x * sinO * 0.5 + c.y * cosO, c.z);
    
    vec3 rel = pos - c;
    float spinA = uTime * 0.032;
    float cosS = cos(spinA);
    float sinS = sin(spinA);
    vec3 localSpun = vec3(rel.x * cosS - rel.y * sinS, rel.x * sinS + rel.y * cosS, rel.z);
    spun = orbC + localSpun;
  } else if (aType > 4.5) {
    // 5.0: 左下角球状星团 B（慢速公转）
    vec3 c = vec3(-880.0, -540.0, -150.0);
    float orbAngle = uTime * 0.009;
    float cosO = cos(orbAngle);
    float sinO = sin(orbAngle);
    vec3 orbC = vec3(c.x * cosO - c.y * sinO * 0.5, c.x * sinO * 0.5 + c.y * cosO, c.z);
    vec3 rel = pos - c;
    spun = orbC + rel;
  } else {
    // 3.0: 全天区深空背景恒星（极微幅深空天幕位移，沉稳深邃）
    float drift = uTime * 0.002;
    spun = vec3(pos.x + cos(drift + aTwinkle * 6.28) * 6.0, pos.y + sin(drift + aTwinkle * 6.28) * 6.0, pos.z);
  }
  
  // 3. 固定经典天文透视倾角（俯仰角约 60°，偏航角约 -22°，免去鼠标晃动，沉稳深邃）
  const float cp = 0.500; // cos(60°)
  const float sp = 0.866; // sin(60°)
  const float cy = 0.927; // cos(-22°)
  const float sy = -0.375; // sin(-22°)
  
  vec3 tilted = vec3(
    spun.x,
    spun.y * cp - spun.z * sp,
    spun.y * sp + spun.z * cp
  );
  
  vec3 rotated = vec3(
    tilted.x * cy + tilted.z * sy,
    tilted.y,
    -tilted.x * sy + tilted.z * cy
  );
  
  // 4. 3D 透视相机投影
  float cameraZ = 1800.0;
  float zDepth = cameraZ + rotated.z;
  float fov = 1400.0;
  float perspective = fov / max(zDepth, 300.0);
  float factor = perspective * viewScale;
  
  vec2 screenPos = rotated.xy * factor;
  gl_Position = vec4(screenPos / (uResolution * 0.5), 0.0, 1.0);
  
  // 5. 多频多波段真实星光高频微闪
  float t1 = sin(uTime * 2.4 + aTwinkle * 17.13);
  float t2 = cos(uTime * 0.9 + aTwinkle * 31.41);
  float twinkle = 0.72 + 0.28 * (t1 * 0.6 + t2 * 0.4);
  
  // 保持高分辨率针尖锐利：杜绝过度放大发糊，星点物理尺寸独立于整体屏幕铺展拉伸
  float ptScale = 1.0;
  if (aType > 0.5 && aType < 1.5) {
    ptScale = 0.75;
  }
  float pt = aSize * (perspective / 0.78) * ptScale * (uPixelRatio > 1.5 ? 1.15 : 1.0) * twinkle;
  gl_PointSize = max(1.2, pt);
  
  // 6. 景深通透度衰减：近实远幽
  float depthFade = clamp((rotated.z + 1000.0) / 2000.0, 0.35, 1.0);
  if (aType > 2.5 && aType < 3.5) {
    depthFade = clamp((rotated.z + 1200.0) / 2400.0, 0.22, 0.68);
  }
  vColor = aColor;
  vAlpha = depthFade * twinkle;
  vType = aType;
}
`;

const fragmentShader = `#version 300 es
precision highp float;

in vec3 vColor;
in float vAlpha;
in float vType;
uniform float uLight;

out vec4 fragColor;

void main() {
  vec2 uv = gl_PointCoord - vec2(0.5);
  float r = length(uv);
  float d = r * 2.0; // 归一化直径：中心 0.0，边缘 1.0
  if (d > 1.0) discard;
  
  // 超清晰针尖光学核心 (Pinpoint Core)：陡峭高斯光束，聚光感极强
  float core = exp(-d * d * 32.0);
  
  // 极精细艾里光圈 (Airy Disk Halo)：向边缘急剧收敛至 0，无任何糊斑
  float halo = pow(1.0 - d, 4.0) * 0.35;
  
  float brightness = core * 1.6 + halo;
  vec3 col = vColor;
  
  if (vType > 1.5 && vType < 2.5) {
    // === 璀璨超巨星 (Type 2: 细如发丝的天文衍射十字星芒) ===
    vec2 sUv = abs(uv) * 2.0;
    float spikeH = exp(-sUv.y * 36.0) * pow(max(0.0, 1.0 - sUv.x), 2.5);
    float spikeV = exp(-sUv.x * 36.0) * pow(max(0.0, 1.0 - sUv.y), 2.5);
    float spike = (spikeH + spikeV) * 0.65;
    
    brightness += spike;
    // 超巨星核心爆出耀白极纯高光
    col = mix(vColor, vec3(1.0, 1.0, 1.0), core * 0.85);
  } else if (vType > 0.5 && vType < 1.5) {
    // === 前景微尘 (Type 1: 柔和半透明星尘微粒) ===
    brightness = core * 0.9 + halo * 0.2;
  }
  
  if (uLight > 0.5) {
    // 浅色模式：水墨与星辰交融的清晰质感
    vec3 ink = mix(col, vec3(0.10, 0.06, 0.18), 0.60);
    fragColor = vec4(ink, brightness * vAlpha * 0.75);
    return;
  }
  
  fragColor = vec4(col * brightness * vAlpha, brightness * vAlpha);
}
`;

function generateGalaxyStars(starsCount = 72000, armCount = 6) {
  const positions = new Float32Array(starsCount * 3);
  const colors = new Float32Array(starsCount * 3);
  const sizes = new Float32Array(starsCount);
  const twinkles = new Float32Array(starsCount);
  const types = new Float32Array(starsCount);

  const maxRadius = 960;

  // 天文高纯度色谱：白炽亮核 -> 鲜明等离子紫粉 -> 霓虹洋红 -> 紫罗兰 -> 宝石宝蓝 -> 荧光电青 -> 深空靛蓝
  const cWhiteHot = [1.0, 0.98, 0.95];    // 核心白炽恒星
  const cPlasmaPink = [0.98, 0.32, 0.84]; // 纯净等离子紫粉 #F25BD0 (与中央等离子球呼应)
  const cMagenta = [0.96, 0.18, 0.58];    // 鲜活洋红
  const cViolet = [0.68, 0.35, 0.98];     // 霓虹紫罗兰 #A855F7
  const cRoyalBlue = [0.28, 0.46, 0.98];  // 宝蓝晶钻
  const cCyan = [0.18, 0.86, 0.98];       // 荧光电光青 #38BDF8
  const cDeepSpace = [0.35, 0.28, 0.90];  // 深空璀璨靛蓝
  const cIceCyan = [0.72, 0.94, 1.0];     // 冰蓝微星
  const cGoldAmber = [1.0, 0.82, 0.55];   // 琥珀金巨星

  const mix = (c1: number[], c2: number[], t: number): [number, number, number] => [
    c1[0] * (1 - t) + c2[0] * t,
    c1[1] * (1 - t) + c2[1] * t,
    c1[2] * (1 - t) + c2[2] * t,
  ];

  const getArmColor = (ratio: number): [number, number, number] => {
    if (ratio < 0.14) {
      return mix(cWhiteHot, cPlasmaPink, ratio / 0.14);
    } else if (ratio < 0.36) {
      return mix(cPlasmaPink, cMagenta, (ratio - 0.14) / 0.22);
    } else if (ratio < 0.60) {
      return mix(cViolet, cRoyalBlue, (ratio - 0.36) / 0.24);
    } else if (ratio < 0.82) {
      return mix(cRoyalBlue, cCyan, (ratio - 0.60) / 0.22);
    } else {
      return mix(cCyan, cDeepSpace, (ratio - 0.82) / 0.18);
    }
  };

  const coreCount = 10000;
  const armStarsCount = 36000;
  const deepStarCount = 16000;
  const satGalaxyCount = 3500;
  const globClusterCount = 3000;
  const foregroundDustCount = Math.max(0, starsCount - (coreCount + armStarsCount + deepStarCount + satGalaxyCount + globClusterCount));

  let idx = 0;

  // 1. 银心高密核球 (Core Bulge)：密集的针尖高光恒星团
  for (let i = 0; i < coreCount; i++, idx++) {
    const r = Math.pow(Math.random(), 2.4) * (maxRadius * 0.28);
    const theta = Math.random() * Math.PI * 2;
    const phi = (Math.random() - 0.5) * Math.PI;

    const x = r * Math.cos(theta) * Math.cos(phi * 0.45);
    const y = r * Math.sin(theta) * Math.cos(phi * 0.45);
    const z = r * Math.sin(phi) * 0.32;

    positions[idx * 3] = x;
    positions[idx * 3 + 1] = y;
    positions[idx * 3 + 2] = z;

    const ratio = r / (maxRadius * 0.28);
    const col = mix(cWhiteHot, cPlasmaPink, Math.pow(ratio, 0.7));
    colors[idx * 3] = col[0];
    colors[idx * 3 + 1] = col[1];
    colors[idx * 3 + 2] = col[2];

    if (Math.random() < 0.05) {
      types[idx] = 2.0; // 银心超巨星
      sizes[idx] = 7.0 + Math.random() * 3.5;
    } else {
      types[idx] = 0.0;
      sizes[idx] = 1.4 + Math.random() * 1.8;
    }
    twinkles[idx] = Math.random();
  }

  // 2. 6 条主螺旋臂 + 密集支流星桥 (6 Spiral Arms & Branching Spurs)
  for (let i = 0; i < armStarsCount; i++, idx++) {
    const r = 40 + Math.pow(Math.random(), 1.30) * (maxRadius - 40);
    const ratio = r / maxRadius;

    const armIndex = i % armCount;
    let armAngle = (armIndex * 2 * Math.PI) / armCount;

    // 38% 次级旋臂分支 / 星际星桥 (Spurs & Inter-arm branches)
    if (Math.random() < 0.38) {
      armAngle += (Math.random() - 0.5) * 0.75;
    }

    const spinAngle = Math.pow(ratio, 0.76) * 4.4;
    const totalAngle = armAngle + spinAngle;

    const spread = Math.pow(ratio, 1.20) * 56.0 + 8.0;
    const u1 = Math.max(1e-6, Math.random());
    const u2 = Math.random();
    const gSpreadX = Math.sqrt(-2.0 * Math.log(u1)) * Math.cos(2.0 * Math.PI * u2) * spread * 0.45;
    const gSpreadY = Math.sqrt(-2.0 * Math.log(u1)) * Math.sin(2.0 * Math.PI * u2) * spread * 0.45;
    const gSpreadZ = (Math.random() - 0.5) * spread * 0.48;

    positions[idx * 3] = Math.cos(totalAngle) * r + gSpreadX;
    positions[idx * 3 + 1] = Math.sin(totalAngle) * r + gSpreadY;
    positions[idx * 3 + 2] = gSpreadZ;

    let col = getArmColor(ratio);

    if (Math.random() < 0.055) {
      types[idx] = 2.0; // 旋臂超巨星
      sizes[idx] = 7.5 + Math.random() * 3.8;
      col = mix(col, cWhiteHot, 0.45);
    } else {
      types[idx] = 0.0;
      sizes[idx] = Math.random() < 0.25 ? 3.0 + Math.random() * 1.8 : 1.5 + Math.random() * 1.6;
    }

    colors[idx * 3] = col[0];
    colors[idx * 3 + 1] = col[1];
    colors[idx * 3 + 2] = col[2];
    twinkles[idx] = Math.random();
  }

  // 3. 全天区深空全屏星海 (Omnidirectional Deep Space Starfield)
  for (let i = 0; i < deepStarCount; i++, idx++) {
    // 宽广覆盖整个 3D 视口，包括视口四个外角
    const x = (Math.random() - 0.5) * 3600.0;
    const y = (Math.random() - 0.5) * 2400.0;
    const z = (Math.random() - 0.5) * 1800.0;

    positions[idx * 3] = x;
    positions[idx * 3 + 1] = y;
    positions[idx * 3 + 2] = z;

    let col = cIceCyan;
    const rSeed = Math.random();
    if (rSeed < 0.4) {
      col = mix(cWhiteHot, cDeepSpace, 0.5);
    } else if (rSeed < 0.7) {
      col = mix(cIceCyan, cRoyalBlue, 0.4);
    } else if (rSeed < 0.88) {
      col = cDeepSpace;
    } else {
      col = cGoldAmber;
    }

    colors[idx * 3] = col[0];
    colors[idx * 3 + 1] = col[1];
    colors[idx * 3 + 2] = col[2];

    types[idx] = 3.0;
    sizes[idx] = Math.random() < 0.10 ? 2.6 + Math.random() * 1.5 : 1.1 + Math.random() * 1.3;
    twinkles[idx] = Math.random();
  }

  // 4. 右上角伴星系 A (Satellite Dwarf Galaxy A)
  const centerSatA = [850.0, 580.0, 120.0];
  for (let i = 0; i < satGalaxyCount; i++, idx++) {
    const r = Math.pow(Math.random(), 1.6) * 160.0;
    const ang = Math.random() * Math.PI * 2;
    const z = (Math.random() - 0.5) * 50.0;

    const lx = Math.cos(ang) * r;
    const ly = Math.sin(ang) * (r * 0.65);

    positions[idx * 3] = centerSatA[0] + lx;
    positions[idx * 3 + 1] = centerSatA[1] + ly;
    positions[idx * 3 + 2] = centerSatA[2] + z;

    const satRatio = r / 160.0;
    const col = mix(cWhiteHot, cCyan, satRatio * 0.85);

    colors[idx * 3] = col[0];
    colors[idx * 3 + 1] = col[1];
    colors[idx * 3 + 2] = col[2];

    types[idx] = 4.0;
    sizes[idx] = Math.random() < 0.08 ? 3.5 + Math.random() * 2.5 : 1.2 + Math.random() * 1.4;
    twinkles[idx] = Math.random();
  }

  // 5. 左下角球状星团 B (Globular Cluster B)
  const centerGlobB = [-880.0, -540.0, -150.0];
  for (let i = 0; i < globClusterCount; i++, idx++) {
    const u1 = Math.max(1e-6, Math.random());
    const u2 = Math.random();
    const gR = Math.sqrt(-2.0 * Math.log(u1)) * 48.0;
    const theta = 2.0 * Math.PI * u2;
    const phi = (Math.random() - 0.5) * Math.PI;

    const lx = gR * Math.cos(theta) * Math.cos(phi);
    const ly = gR * Math.sin(theta) * Math.cos(phi);
    const lz = gR * Math.sin(phi);

    positions[idx * 3] = centerGlobB[0] + lx;
    positions[idx * 3 + 1] = centerGlobB[1] + ly;
    positions[idx * 3 + 2] = centerGlobB[2] + lz;

    const col = mix(cPlasmaPink, cViolet, Math.random());

    colors[idx * 3] = col[0];
    colors[idx * 3 + 1] = col[1];
    colors[idx * 3 + 2] = col[2];

    types[idx] = 5.0;
    sizes[idx] = Math.random() < 0.12 ? 3.2 + Math.random() * 2.2 : 1.3 + Math.random() * 1.4;
    twinkles[idx] = Math.random();
  }

  // 6. 前景微光星际微尘 (Foreground Floating Stardust)
  for (let i = 0; i < foregroundDustCount; i++, idx++) {
    const x = (Math.random() - 0.5) * 1800.0;
    const y = (Math.random() - 0.5) * 1200.0;
    const z = -600.0 + Math.random() * 450.0;

    positions[idx * 3] = x;
    positions[idx * 3 + 1] = y;
    positions[idx * 3 + 2] = z;

    const col = mix(cCyan, cWhiteHot, Math.random() * 0.6);
    colors[idx * 3] = col[0];
    colors[idx * 3 + 1] = col[1];
    colors[idx * 3 + 2] = col[2];

    types[idx] = 1.0;
    sizes[idx] = 1.0 + Math.random() * 1.5;
    twinkles[idx] = Math.random();
  }

  return { positions, colors, sizes, twinkles, types };
}

export default function SpiralGalaxy({
  theme = "dark",
  starsCount = 72000,
  arms = 6,
  speed = 1,
  paused = false,
  size = 1.0,
  className = "",
  style,
}: SpiralGalaxyProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const themeRef = useRef(theme);
  const speedRef = useRef(speed);
  const pausedRef = useRef(paused);
  const wakeRef = useRef<(() => void) | null>(null);
  const sizeRef = useRef(size);
  themeRef.current = theme;
  speedRef.current = speed;
  sizeRef.current = size;
  useEffect(() => {
    pausedRef.current = paused;
    if (!paused) wakeRef.current?.();
  }, [paused]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const renderer = new Renderer({
      alpha: true,
      premultipliedAlpha: true,
      antialias: true,
      depth: false,
      powerPreference: "high-performance",
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
      aType: { size: 1, data: galaxyData.types },
    });

    const uniforms = {
      uResolution: { value: [1, 1] },
      uTime: { value: 0 },
      uPixelRatio: { value: 1 },
      uLight: { value: theme === "light" ? 1 : 0 },
      uScale: { value: size },
    };

    const program = new Program(gl, {
      vertex: vertexShader,
      fragment: fragmentShader,
      uniforms,
      transparent: true,
      depthTest: false,
      depthWrite: false,
    });

    // 深色使用物理加法辉光，浅色使用清亮水墨混合
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

      if (!pausedRef.current) time += dt * speedRef.current;
      uniforms.uTime.value = time;
      uniforms.uLight.value = themeRef.current === "light" ? 1 : 0;
      uniforms.uScale.value = sizeRef.current;

      gl.clearColor(0, 0, 0, 0);
      renderer.render({ scene: mesh, clear: true });

      if (visible && !pausedRef.current) {
        raf = requestAnimationFrame(frame);
      }
    };

    const start = () => {
      if (raf || !visible || !alive) return;
      last = performance.now();
      raf = requestAnimationFrame(frame);
    };

    const onVisibility = () => {
      if (!document.hidden) start();
    };

    document.addEventListener("visibilitychange", onVisibility);

    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(container);

    const intersectionObserver = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (visible) start();
    });
    intersectionObserver.observe(container);

    wakeRef.current = start;
    resize();

    return () => {
      alive = false;
      wakeRef.current = null;
      visible = false;
      cancelAnimationFrame(raf);
      resizeObserver.disconnect();
      intersectionObserver.disconnect();
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
