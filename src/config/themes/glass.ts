import { defaultLight, defaultDark, type StylePreset } from "./tokens";

export const glass = {
  id: "glass",
  video: "/vids/glass-bg.mp4",
  label: { zh: "半生雨(beta)", en: "Glass(beta)" },
  cardCss: `
    background: var(--bg-1);
    border: var(--border);
    box-shadow: var(--box-shadow);
    border-radius: var(--card-radius);
    backdrop-filter: blur(10px);
    -webkit-backdrop-filter: blur(10px);
    `,
  light: {
    ...defaultLight,
    "bg-0": "oklch(0.93 0.016 82)", // 暖纸米灰；main-bg 默认跟随此色，前浪与正文连续
    "wave-bg": "rgb(198 183 163 / 50%)",
    "bg-1": "oklch(0.98 0.01 45/ 0.2)",
    "bg-2": "oklch(0.98 0.01 45)",
    "bg-3": "oklch(0.98 0.01 45)",
    "home-bg-filter": "oklch(0 0 0 / 0.65)",
    "on-main": "#ffffff",
  },
  dark: {
    ...defaultDark,
    "bg-0": "oklch(0.2 0 0)", // 深色暖炭灰
    "wave-bg": "rgb(142 129 115 / 35%)",
    "bg-1": "oklch(0.22 0 45 /0.4)",
    "bg-2": "oklch(0.25 0 45)",
    "bg-3": "oklch(0.22 0 45)",
  },
} as const satisfies StylePreset;
