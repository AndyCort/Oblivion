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

