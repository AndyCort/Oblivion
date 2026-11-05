import { defaultLight, defaultDark, type StylePreset } from "./tokens";

export const glass = {
  id: "glass",
  label: { zh: "半生雨(beta)", en: "Glass(beta)" },
  components: {
    card: `
      background: oklch(0.85 0.1 360 / 0.35);
      border: var(--border);
      box-shadow: var(--box-shadow);
      border-radius: var(--card-radius);
      backdrop-filter: blur(20px);
      -webkit-backdrop-filter: blur(20px);
      --text-1: oklch(1 0 0);
      --text-2: oklch(1 0 0 / 0.6);
      --text-3: oklch(0.85 0.12 80);
    `,
    navbar: `
      border-radius: 999px;
      background: oklch(from var(--bg-3) l c h / 0.3);
      border: var(--border);
      box-shadow: var(--box-shadow);
      backdrop-filter: blur(12px);
      -webkit-backdrop-filter: blur(12px);
    `,
    button: `
      border-radius: 50%;
      background: oklch(from var(--bg-3) l c h / 0.3);
      border: var(--border);
      box-shadow: var(--box-shadow);
      backdrop-filter: blur(10px);
      -webkit-backdrop-filter: blur(10px);
      color: var(--text-1);

      &:hover:not(:disabled) {
        color: var(--main-color);
        border-color: var(--main-color);
      }

      &:disabled {
        cursor: not-allowed;
        opacity: 0.4;
      }
    `,
  },
  light: {
    ...defaultLight,
    "bg-0": "oklch(0.93 0.016 82)", // 暖纸米灰；main-bg 默认跟随此色
    "bg-1": "oklch(0.98 0.01 45)",
    "bg-2": "oklch(0.98 0.01 45)",
    "bg-3": "oklch(0.98 0.01 45)",
    "home-bg-filter": "oklch(0 0 0 / 0.65)",
    "on-main": "#ffffff",
    //"text-1": "oklch(0.1 0 260)",
  },
  dark: {
    ...defaultDark,
    "bg-0": "oklch(0.08 0 0)", // 极深深空纯黑，取代原有偏灰的 0.2
    "bg-1": "oklch(0.14 0.01 45)",
    "bg-2": "oklch(0.18 0.01 45)",
    "bg-3": "oklch(0.14 0.01 45)",
  },
} as const satisfies StylePreset;
