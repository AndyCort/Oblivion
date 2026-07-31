/**
 * 主题风格注册表 —— 每套风格的浅色/深色配置都写在本风格内部。
 *
 * 复制以下模板并修改即可（图片资源放到 src/assets/ 下）：
 *
 * {
 *   id: 'my-style',                                    // 唯一 id（会作为 data-card-style 属性值）
 *   label: { zh: '我的风格', en: 'My Style' },          // 下拉菜单里的显示名
 *   video: '/src/assets/my-bg.mp4',                    // 可选：首页背景视频（优先于 homeBg）
 *   cardCss: `                                         // 该风格下所有 [data-card] 元素的视觉规则
 *     background: var(--bg-1);
 *     border: 1px solid var(--main-color);
 *     &:hover { transform: translateY(-2px); }
 *   `,
 *
 *   // 必填：本风格的浅色/深色配置（mainColor / homeBg / footerBg 也在这里配置）。
 *   // 与所有主题相同的值用 ...defaultLight / ...defaultDark 展开，只覆盖自己的差异：
 *   light: { ...defaultLight, mainColor: '...', homeBg: "url('...')", footerBg: "url('...')" },
 *   dark:  { ...defaultDark, homeBg: "url('...')" },
 *   // dark 里没写的键自动沿用本风格 light 的值
 * }
 *
 * 保存文件后，开发服务器会自动重新生成 src/styles/theme-vars.css 并热更新，无需重启。
 */

/** 所有主题共用的默认浅色变量（键名会转成 --kebab-case；各风格用展开引用） */
export const defaultLight: Record<string, string> = {
  "bg-0": 'oklch(0.99 0.006 45)',       // 暖白纸
  "bg-1": 'oklch(0.965 0.012 45)',      // 卡片面
  "bg-2": 'oklch(0.93 0.016 45)',       // 悬浮层
  "text-1": 'oklch(0.27 0.03 260)',     // 主文字（高对比）
  "text-2": 'oklch(0.47 0.028 260)',    // 次文字
  "text-3": 'oklch(0.6 0.022 260)',     // 弱化文字
  border: '1px solid oklch(0.4 0.015 45 / 16%)',
  boxShadow: 'oklch(0.3 0.02 260 / 0.05) 0 1px 2px, oklch(0.3 0.02 260 / 0.09) 0 8px 24px',
  homeBgFilter: 'transparent',
};

/**
 * 调整 oklch 颜色的 L（亮度）、C（色度）、H（色相）
 * 传入的值为偏移量（可正可负），例如：adjustOklch('oklch(0.99 0.01 45)', { l: -0.8, c: +0.01, h: 215 })
 */
export function adjustOklch(
  color: string,
  delta: { l?: number; c?: number; h?: number }
): string {
  const m = color.match(/oklch\(([\d.]+)\s+([\d.]+)\s+([\d.]+)(.*)\)/);
  if (!m) return color;

  const l = Math.max(0, Math.min(1, parseFloat(m[1]) + (delta.l || 0)));
  const c = Math.max(0, parseFloat(m[2]) + (delta.c || 0));
  let h = parseFloat(m[3]) + (delta.h || 0);
  if (h < 0) h = (h % 360) + 360;
  h = h % 360;

  return `oklch(${l.toFixed(3)} ${c.toFixed(3)} ${h.toFixed(1)}${m[4]})`;
}

/** 所有主题共用的默认深色变量（各风格用展开引用） */
export const defaultDark: Record<string, string> = {
  "bg-0": 'oklch(0.155 0.016 260)',     // 深蓝黑
  "bg-1": 'oklch(0.195 0.02 260)',      // 卡片面
  "bg-2": 'oklch(0.235 0.022 260)',     // 悬浮层
  "text-1": 'oklch(0.95 0.012 260)',    // 主文字
  "text-2": 'oklch(0.8 0.02 260)',      // 次文字
  "text-3": 'oklch(0.63 0.02 260)',     // 弱化文字
  border: '1px solid oklch(1 0 0 / 10%)',
  boxShadow: 'oklch(0 0 0 / 0.55) 0 5px 15px',
  homeBgFilter: 'oklch(0 0 0 / 0.65)',
};

export type StylePreset = {
  id: string;
  label: { zh: string; en: string };
  /** 首页背景视频（可选，优先于 light/dark 中的 homeBg） */
  video?: string;
  /** 该风格下 [data-card] 元素的 CSS 规则（body 内容，自动包裹在对应选择器里） */
  cardCss: string;
  /** 本风格的浅色配置（包含 mainColor / homeBg / footerBg 等所有 CSS 变量） */
  light: Record<string, string>;
  /** 本风格的深色配置（没写的键自动沿用本风格 light 的值） */
  dark: Record<string, string>;
};

export interface ThemeConfig {
  /** 全部卡片风格（每套风格自带 light/dark 配置） */
  cardStyles: readonly StylePreset[];
}

export const cardStyles = [
  {
    id: 'base',
    label: { zh: '基础', en: 'Base' },
    cardCss: `
    background: oklch(from var(--bg-1) l c h / 0.5);
    border-radius: var(--card-radius);
    box-shadow: var(--box-shadow);
    border: var(--border);

    &[data-hover]:hover {
        box-shadow: 0 6px 16px rgba(0, 0, 0, 0.06);
    }`,
    light: {
      "bg-0": 'oklch(0.99 0.006 45)',       // 暖白纸
      "bg-1": 'oklch(0.965 0.012 45)',      // 卡片面
      "bg-2": 'oklch(0.93 0.016 45)',       // 悬浮层
      "text-1": 'oklch(0.27 0.03 260)',     // 主文字（高对比）
      "text-2": 'oklch(0.47 0.028 260)',    // 次文字
      "text-3": 'oklch(0.6 0.022 260)',     // 弱化文字
      mainColor: 'oklch(0.75 0.175 20)',
      homeBg: "url('/src/assets/imgs/base-bg.png')",
      footerBg: "url('/src/assets/imgs/base-footer.png')",
    },
    dark: {
      "bg-0": adjustOklch(defaultLight["bg-0"], { l: -0.3, c: +0, h: +0 }),     // 深蓝黑
      "bg-1": adjustOklch(defaultLight["bg-1"], { l: -0.3, c: +0, h: +0 }),      // 卡片面
      "bg-2": adjustOklch(defaultLight["bg-2"], { l: -0.3, c: +0, h: +0 }),     // 悬浮层
      "text-1": adjustOklch(defaultLight["text-1"], { l: +0.5, c: +0, h: +0 }),    // 主文字
      "text-2": adjustOklch(defaultLight["text-2"], { l: +0.5, c: +0, h: +0 }),      // 次文字
      "text-3": adjustOklch(defaultLight["text-3"], { l: +0.5, c: +0, h: +0 }),     // 弱化文字
    },
  },
  {
    id: 'glass',
    label: { zh: '半生雨(beta)', en: 'Glass(beta)' },
    video: '/src/assets/vids/glass-bg.mp4',
    cardCss: `
    background: oklch(from var(--bg-1) l c h / 0.3); 
    box-shadow: var(--box-shadow);
    border-radius: var(--card-radius);
    backdrop-filter: blur(10px);
    -webkit-backdrop-filter: blur(10px);
    &[data-hover] {
        transition: all 0.3s ease;

        &:hover {
            transform: translateY(-2px);
            box-shadow: 0 12px 28px rgba(0, 0, 0, 0.12);
        }
    }`,
    light: {
      ...defaultLight,
      mainColor: 'oklch(0.7 0.125 20)',
      homeBg: "url('/src/assets/imgs/glass-bg.jpg')",
      footerBg: "url('/src/assets/imgs/glass-footer.jpg')",
    },
    dark: { ...defaultDark },
  },
  {
    id: 'flat',
    label: { zh: '扁平(beta)', en: 'Flat(beta)' },
    cardCss: `
    border-radius: var(--card-radius);
    box-shadow: none;
    border: 1px solid var(--text-3);
    opacity: 0.95;

    &[data-hover]:hover {
        box-shadow: 0 6px 16px rgba(0, 0, 0, 0.06);
    }`,
    light: {
      ...defaultLight,
      mainColor: 'oklch(0.7 0.125 20)',
      homeBg: "url('/src/assets/imgs/flat-bg.jpg')",
      footerBg: "url('/src/assets/imgs/flat-footer.jpg')",
    },
    dark: { ...defaultDark },
  },
  {
    id: 'neo',
    label: { zh: '拟态(beta)', en: 'Neo(beta)' },
    cardCss: `
    background: var(--bg-0);
    border: 2px solid var(--text-1);
    box-shadow: 4px 4px 0 var(--text-1);
    border-radius: 12px;

    &[data-hover] {
        transition: all 0.2s ease;

        &:hover {
            transform: translate(-2px, -2px);
            box-shadow: 6px 6px 0 var(--text-1);
        }
    }`,
    light: {
      ...defaultLight,
      mainColor: 'oklch(0.7 0.125 20)',
      homeBg: "url('/src/assets/imgs/neo-bg.jpg')",
      footerBg: "url('/src/assets/imgs/neo-footer.jpg')",
    },
    dark: { ...defaultDark },
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
