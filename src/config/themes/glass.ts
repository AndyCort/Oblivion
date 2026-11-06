import { defaultLight, defaultDark, type StylePreset } from "./tokens";

export const glass = {
  id: "glass",
  label: { zh: "半生雨(beta)", en: "Glass(beta)" },
  components: {
    card: `
      background: var(--bg-1);
      border: var(--border);
      box-shadow: var(--box-shadow);
      border-radius: var(--card-radius);
      backdrop-filter: blur(20px);
      -webkit-backdrop-filter: blur(20px);
      color: var(--text-1);
    `,
    navbar: `
      border-radius: 999px;
      background: var(--bg-1);
      border: var(--border);
      box-shadow: var(--box-shadow);
      backdrop-filter: blur(12px);
      -webkit-backdrop-filter: blur(12px);
    `,
    button: `
      border-radius: 50%;
      background: var(--bg-1);
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
    // 玫瑰雾白玻璃 + 梅紫墨色；main-color 沿用 defaultLight，不覆盖品牌主色。
    "bg-0": "oklch(0.965 0.012 330)",
    "bg-1": "oklch(0.985 0.008 330 / 0.90)",
    "bg-2": "oklch(0.93 0.02 330)",
    "bg-3": "oklch(0.982 0.009 330)",
    "text-1": "oklch(0.28 0.035 310)",
    "text-2": "oklch(0.43 0.03 315)",
    "text-3": "oklch(0.49 0.03 320)",
    "on-main": "oklch(0.23 0.04 335)",
    border: "1px solid oklch(0.50 0.055 325 / 0.24)",
    "box-shadow": "0 1px 0 oklch(1 0 0 / 0.72) inset, 0 8px 24px oklch(0.25 0.035 315 / 0.14)",
    "home-bg-filter": "oklch(0 0 0 / 0.65)",
  },
  dark: {
    ...defaultDark,
    // 烟紫玻璃与暮色背景呼应；main-color 沿用 defaultDark。
    "bg-0": "oklch(0.16 0.018 310)",
    "bg-1": "oklch(0.26 0.035 315 / 0.86)",
    "bg-2": "oklch(0.30 0.032 315)",
    "bg-3": "oklch(0.245 0.025 315)",
    "text-1": "oklch(0.96 0.012 325)",
    "text-2": "oklch(0.84 0.022 320)",
    "text-3": "oklch(0.77 0.028 320)",
    "on-main": "oklch(0.23 0.04 335)",
    border: "1px solid oklch(0.80 0.05 330 / 0.22)",
    "box-shadow": "0 1px 0 oklch(0.90 0.025 325 / 0.08) inset, 0 8px 24px oklch(0.10 0.02 310 / 0.40)",
  },
} as const satisfies StylePreset;
