/** Theme presets. Tokens use CSS names; dark overrides inherit resolved light tokens. */
/**
 * 背景编号表示表面用途，不表示 DOM 嵌套或 z-index；深浅模式保持相同语义。
 * bg/text/main-color/on-main 必须是颜色，不能填渐变或图片。
 * 透明度由表面变量管理，不再给整张卡片或普通文字叠加 opacity。
 * 渐变和图片放在区域背景中；玻璃表面允许透明，浮层需有足够遮挡与对比。
 */
export interface ThemeTokens {
  /** 页面底色：画布、背景兜底及浏览器顶栏。 */
  "bg-0": string;
  /** 主表面：卡片、导航主体、内容面板；可按风格设置透明度。 */
  "bg-1": string;
  /** 内嵌表面：输入框、次级内容区、控件槽。 */
  "bg-2": string;
  /** 浮动表面：下拉、弹出菜单、提示与抽屉，避免内容透出。 */
  "bg-3": string;
  /** 主要文字：标题、正文、主要操作。 */
  "text-1": string;
  /** 次要文字：摘要、说明、次级标签。 */
  "text-2": string;
  /** 辅助文字：时间、作者、来源、占位提示；仍需可读。 */
  "text-3": string;
  /** 完整边框声明，仅用于 border / border-top 等，不能用于 border-color。 */
  border: string;
  /** 表面投影；特殊风格可覆盖，不用于模拟文字层级。 */
  "box-shadow": string;
  /** 品牌强调、链接、选中状态与强调填充。 */
  "main-color": string;
  /** main-color 实心底上的文字和图标；与 text-1 的普通表面用途区分。 */
  "on-main": string;
  /** 首页背景图片/渐变，用于 background-image。 */
  "home-bg": string;
  /** 首页背景遮罩颜色，允许 alpha，不是 CSS filter。 */
  "home-bg-filter": string;
  /** 正文区域完整背景，允许颜色、渐变或图片；不能用于颜色混合。 */
  "main-bg": string;
  /** 首页衔接处的后层波浪颜色，允许 alpha；前浪直接延续 main-bg。 */
  "wave-bg": string;
  /** 页脚面板完整背景，允许颜色、渐变或图片。 */
  "footer-bg": string;
}

/** 正文和页脚使用主题色混合；首页保留图片背景。 */
const colorBackgrounds = {
  "home-bg": "url('/src/assets/imgs/glass-bg.jpg')",
  "home-bg-filter": "oklch(0 0 0 / 0)",
  "main-bg": "var(--bg-0)",
  "footer-bg":
    "linear-gradient(160deg, var(--bg-0), color-mix(in oklab, var(--bg-2) 90%, var(--main-color)))",
};

/** 所有主题共用的默认浅色变量（键名对应 CSS 变量；各风格用展开引用） */
export const defaultLight: ThemeTokens = {
  "bg-0": "oklch(0.99 0.006 45)", // 暖白纸
  "bg-1": "oklch(0.965 0.012 45)", // 卡片面
  "bg-2": "oklch(0.93 0.016 45)", // 内嵌表面
  "bg-3": "oklch(0.93 0.016 45)",
  "main-color": "oklch(0.75 0.125 20)",
  "on-main": "oklch(0.2 0.02 260)",
  "text-1": "oklch(0.27 0.03 260)", // 主文字（高对比）
  "text-2": "oklch(0.47 0.028 260)", // 次文字
  "text-3": "oklch(0.6 0.022 260)", // 辅助文字（不额外降低透明度）
  border: "1px solid oklch(0.4 0.015 45 / 16%)",
  "box-shadow":
    "oklch(0.3 0.02 260 / 0.05) 0 1px 2px, oklch(0.3 0.02 260 / 0.09) 0 8px 24px",
  ...colorBackgrounds,
  "wave-bg": "color-mix(in oklab, var(--bg-0) 50%, transparent)",
};

/** 所有主题共用的默认深色变量（各风格用展开引用） */
export const defaultDark: ThemeTokens = {
  "bg-0": "oklch(0.255 0 260)", // 深灰
  "bg-1": "oklch(0.275 0.02 260)", // 卡片面
  "bg-2": "oklch(0.295 0.022 260)", // 内嵌表面
  "bg-3": "oklch(0.315 0.022 260)",
  "main-color": "oklch(0.75 0.125 20)",
  "on-main": "oklch(0.2 0.02 260)",
  "text-1": "oklch(0.95 0.012 260)", // 主文字
  "text-2": "oklch(0.8 0.02 260)", // 次文字
  "text-3": "oklch(0.63 0.02 260)", // 辅助文字（不额外降低透明度）
  border: "1px solid oklch(1 0 0 / 10%)",
  "box-shadow": "oklch(0 0 0 / 0.55) 0 5px 15px",
  ...colorBackgrounds,
  "wave-bg": "color-mix(in oklab, var(--bg-0) 35%, transparent)",
  "home-bg-filter": "oklch(0 0 0 / 0.65)",
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
