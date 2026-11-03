import { defaultLight, defaultDark, type StylePreset } from "./tokens";

export const glass = {
  id: "glass",
  label: { zh: "半生雨(beta)", en: "Glass(beta)" },
  cardCss: `
 
    background: oklch(0.75 0.15 360 / 0.12);
    border: var(--border);
    box-shadow: var(--box-shadow);
    border-radius: var(--card-radius);
    backdrop-filter: blur(10px);
    -webkit-backdrop-filter: blur(10px);
    `,
  buttonCss: `
    width: 40px;
    height: 40px;
    border-radius: 50%;
    background: oklch(from var(--bg-3) l c h / 0.3);
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--text-1);
    cursor: pointer;
    outline: none;
    backdrop-filter: blur(10px);
    -webkit-backdrop-filter: blur(10px);
    &:hover:not(:disabled) {
      color: var(--main-color);
    }

    &:disabled {
      cursor: not-allowed;
      opacity: 0.4;
    }

    `,
  light: {
    ...defaultLight,
    "bg-0": "oklch(0.93 0.016 82)", // 暖纸米灰；main-bg 默认跟随此色
    "bg-1": "oklch(0.98 0.01 45)",
    "bg-2": "oklch(0.98 0.01 45)",
    "bg-3": "oklch(0.98 0.01 45)",
    "home-bg-filter": "oklch(0 0 0 / 0.65)",
    "on-main": "#ffffff",
    "text-1": "oklch(0.1 0 260)",
  },
  dark: {
    ...defaultDark,
    "bg-0": "oklch(0.2 0 0)", // 深色暖炭灰
    "bg-1": "oklch(0.22 0 45)",
    "bg-2": "oklch(0.25 0 45)",
    "bg-3": "oklch(0.22 0 45)",
  },
} as const satisfies StylePreset;
