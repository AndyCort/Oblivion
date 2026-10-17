/** Theme presets. Tokens use CSS names; dark overrides inherit resolved light tokens. */
export interface ThemeTokens {
  'bg-0': string;
  'bg-1': string;
  'bg-2': string;
  'bg-3': string;
  'text-1': string;
  'text-2': string;
  'text-3': string;
  border: string;
  'box-shadow': string;
  'main-color': string;
  'home-bg': string;
  'home-bg-filter': string;
  'main-bg': string;
  'footer-bg': string;
}

/** 正文和页脚使用主题色混合；首页保留图片背景。 */
const colorBackgrounds = {
  'home-bg': "url('/src/assets/imgs/glass-bg.jpg')",
  'home-bg-filter': "oklch(0 0 0 / 0)",
  'main-bg': "var(--bg-0)",
  'footer-bg':
    "linear-gradient(160deg, var(--bg-0), color-mix(in oklab, var(--bg-2) 90%, var(--main-color)))",
};

/** 所有主题共用的默认浅色变量（键名对应 CSS 变量；各风格用展开引用） */
export const defaultLight: ThemeTokens = {
  "bg-0": "oklch(0.99 0.006 45)", // 暖白纸
  "bg-1": "oklch(0.965 0.012 45)", // 卡片面
  "bg-2": "oklch(0.93 0.016 45)", // 悬浮层
  "bg-3": "oklch(0.93 0.016 45)",
  "main-color": "oklch(0.7 0.125 20)",
  "text-1": "oklch(0.27 0.03 260)", // 主文字（高对比）
  "text-2": "oklch(0.47 0.028 260)", // 次文字
  "text-3": "oklch(0.6 0.022 260)", // 弱化文字
  border: "1px solid oklch(0.4 0.015 45 / 16%)",
  'box-shadow':
    "oklch(0.3 0.02 260 / 0.05) 0 1px 2px, oklch(0.3 0.02 260 / 0.09) 0 8px 24px",
  ...colorBackgrounds,
};

/** 所有主题共用的默认深色变量（各风格用展开引用） */
export const defaultDark: ThemeTokens = {
  "bg-0": "oklch(0.155 0.016 260)", // 深蓝黑
  "bg-1": "oklch(0.195 0.02 260)", // 卡片面
  "bg-2": "oklch(0.235 0.022 260)", // 悬浮层
  "bg-3": "oklch(0.235 0.022 260)",
  "main-color": "oklch(0.7 0.125 20)",
  "text-1": "oklch(0.95 0.012 260)", // 主文字
  "text-2": "oklch(0.8 0.02 260)", // 次文字
  "text-3": "oklch(0.63 0.02 260)", // 弱化文字
  border: "1px solid oklch(1 0 0 / 10%)",
  'box-shadow': "oklch(0 0 0 / 0.55) 0 5px 15px",
  ...colorBackgrounds,
  'home-bg-filter': "oklch(0 0 0 / 0.65)",
};

export type StylePreset = {
  id: string;
  label: { zh: string; en: string };
  /** 首页背景视频（可选，优先于首页背景图） */
  video?: string;
  /** 该风格下 [data-card] 元素的 CSS 规则（body 内容，自动包裹在对应选择器里） */
  cardCss: string;
  /** 本风格的浅色配置（包含 main-color / home-bg / footer-bg 等所有 CSS 变量） */
  light: ThemeTokens;
  /** 本风格的深色配置（没写的键自动沿用本风格 light 的值） */
  dark: Partial<ThemeTokens>;
};

export interface ThemeConfig {
  /** 全部卡片风格（每套风格自带 light/dark 配置） */
  cardStyles: readonly StylePreset[];
}

export const cardStyles = [
  {
    id: "base",
    label: { zh: "基础", en: "Base" },
    cardCss: `
    background: var(--bg-1);
    border-radius: var(--card-radius);
    box-shadow: var(--box-shadow);
    border: var(--border);
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
    `,
    light: {
      ...defaultLight,
      "bg-0": "oklch(0.99 0.006 45)", // 暖白纸
      "bg-1": "oklch(1 0 0 / 0.3)", // 卡片面
      "bg-2": "oklch(0.93 0.016 45)", // 悬浮层
      "text-1": "oklch(0.2 0.03 260)", // 主文字（高对比）
      "text-2": "oklch(0.3 0.025 260)", // 次文字
      "text-3": "oklch(0.45 0.02 260)", // 弱化文字

      'main-color': "oklch(0.75 0.175 20)",
      'home-bg': "url('/src/assets/imgs/base-bg.png')",
    },
    dark: {
      'home-bg-filter': "oklch(0 0 0 / 0.65)",
      "bg-0": "oklch(0.15 0.02 260)", // 深蓝黑
      "bg-1": "oklch(0.20 0.02 260)", // 卡片面
      "bg-2": "oklch(0.25 0.02 260)", // 悬浮层
      "bg-3": "oklch(0.25 0.02 260)",
      "text-1": "oklch(0.95 0.012 260)", // 主文字
      "text-2": "oklch(0.8 0.02 260)", // 次文字
      "text-3": "oklch(0.63 0.02 260)", // 弱化文字
      border: "1px solid oklch(0 0 0 / 10%)",
      'box-shadow': "oklch(1 0 0 / 0.2) 0 5px 15px",
    },
  },
  {
    id: "glass",
    video: "/vids/glass-bg.mp4",
    label: { zh: "半生雨(beta)", en: "Glass(beta)" },
    cardCss: `
    border: var(--border);
    box-shadow: var(--box-shadow);
    border-radius: var(--card-radius);
    backdrop-filter: blur(10px);
    -webkit-backdrop-filter: blur(10px);
    `,
    light: {
      ...defaultLight,
      "bg-1": "oklch(0.98 0.01 45)",
      "bg-2": "oklch(0.98 0.01 45)",
      "bg-3": "oklch(0.98 0.01 45)",
      'home-bg-filter': "oklch(0 0 0 / 0.65)",
      'main-color': "oklch(0.7 0.125 20)",
    },
    dark: {
      ...defaultDark,
      "bg-1": "oklch(0.22 0 45)",
      "bg-2": "oklch(0.25 0 45)",
      "bg-3": "oklch(0.22 0 45)",
    },
  },
  {
    id: "flat",
    label: { zh: "扁平(beta)", en: "Flat(beta)" },
    cardCss: `
    border-radius: var(--card-radius);
    box-shadow: none;
    border: 1px solid var(--text-3);
    opacity: 0.95;
    `,
    light: {
      ...defaultLight,
      'main-color': "oklch(0.7 0.125 20)",
    },
    dark: { ...defaultDark },
  },
  {
    id: "neo",
    label: { zh: "拟态(beta)", en: "Neo(beta)" },
    cardCss: `
    background: var(--bg-0);
    border: 2px solid var(--text-1);
    box-shadow: 4px 4px 0 var(--text-1);
    border-radius: 12px;
    `,
    light: {
      ...defaultLight,
      'main-color': "oklch(0.7 0.125 20)",
    },
    dark: { ...defaultDark },
  },
  {
    id: "expressive",
    label: { zh: "悦动(Expressive)", en: "Expressive" },
    cardCss: `
    background: var(--bg-1);
    border-radius: 32px 12px 32px 12px;
    box-shadow: var(--box-shadow);
    border: 1px solid color-mix(in oklab, var(--main-color) 10%, transparent);
    transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    `,
    light: {
      ...defaultLight,
      "bg-0": "oklch(0.98 0.01 45)",
      "bg-1": "oklch(1 0 0)",
      "bg-2": "oklch(0.96 0.02 45)",
      "text-1": "oklch(0.2 0.05 270)",
      "text-2": "oklch(0.4 0.04 270)",
      "text-3": "oklch(0.6 0.03 270)",
      'main-color': "oklch(0.65 0.25 15)", // Vibrant expressive magenta/red
      border: "1px solid oklch(0.65 0.25 15 / 15%)",
      'box-shadow':
        "oklch(0.65 0.25 15 / 0.12) 0 8px 24px, oklch(0.65 0.25 15 / 0.04) 0 2px 4px",
    },
    dark: {
      'home-bg-filter': "oklch(0 0 0 / 0.7)",
      "bg-0": "oklch(0.12 0.03 270)",
      "bg-1": "oklch(0.18 0.04 270)",
      "bg-2": "oklch(0.24 0.05 270)",
      "bg-3": "oklch(0.24 0.05 270)",
      "text-1": "oklch(0.98 0.02 270)",
      "text-2": "oklch(0.85 0.03 270)",
      "text-3": "oklch(0.7 0.03 270)",
      'main-color': "oklch(0.7 0.25 15)",
      border: "1px solid oklch(0.7 0.25 15 / 20%)",
      'box-shadow': "oklch(0.7 0.25 15 / 0.2) 0 8px 32px",
    },
  },
] as const satisfies readonly StylePreset[];

export const themeConfig: ThemeConfig = {
  // ===== 配色设计说明 =====
  // 中性色统一为暖纸白背景(浅色) / 深蓝黑背景(暗色)，文字统一为蓝灰色相 (hue 260)
  // 强调色为玫红 (main-color, hue 20)，三档文字亮度递减：主文 → 次文 → 弱化
  // bg-0 页面底 / bg-1 卡片面 / bg-2 悬浮层（浅色越深越突出，暗色越亮越突出）
  // 各风格的 light/dark 配置写在 cardStyles 数组里每个风格对象内部

  cardStyles,
};
