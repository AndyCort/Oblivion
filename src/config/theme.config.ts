/**
 * 主题风格注册表 —— 新增一套卡片风格，只需在下方 cardStyles 数组里加一个对象。
 *
 * 复制以下模板并修改即可（图片资源放到 src/assets/ 下）：
 *
 * {
 *   id: 'my-style',                                    // 唯一 id（会作为 data-card-style 属性值）
 *   label: { zh: '我的风格', en: 'My Style' },          // 下拉菜单里的显示名
 *   mainColor: 'oklch(0.7 0.125 300)',                 // 可选：主题色，覆盖全局 --main-color
 *   homeBg: "url('/src/assets/my-bg.jpg')",            // 首页背景图
 *   footerBg: "url('/src/assets/glass-footer.jpg')",   // 页脚背景图
 *   video: '/src/assets/my-bg.mp4',                    // 可选：首页背景视频（优先于 homeBg）
 *   cardCss: `                                         // 该风格下所有 [data-card] 元素的视觉规则
 *     background: var(--bg-1);
 *     border: 1px solid var(--main-color);
 *     &:hover { transform: translateY(-2px); }
 *   `,
 * }
 *
 * 保存文件后，开发服务器会自动重新生成 src/styles/theme-vars.css 并热更新，无需重启。
 */

export type StylePreset = {
  id: string;
  label: { zh: string; en: string };
  /** 覆盖全局 --main-color */
  mainColor?: string;
  homeBg: string;
  footerBg: string;
  /** 首页背景视频（可选，优先于 homeBg） */
  video?: string;
  /** 该风格下 [data-card] 元素的 CSS 规则（body 内容，自动包裹在对应选择器里） */
  cardCss: string;
};

export interface ThemeConfig {
  /** 浅色主题 CSS 变量（键名会转成 --kebab-case） */
  light: Record<string, string>;
  /** 深色主题 CSS 变量 */
  dark: Record<string, string>;
  /** 全部卡片风格 */
  cardStyles: readonly StylePreset[];
}

export const cardStyles = [
  {
    id: 'base',
    label: { zh: '基础', en: 'Base' },
    mainColor: 'oklch(0.7 0.125 20)',
    homeBg: "url('/src/assets/base-bg.png')",
    footerBg: "url('/src/assets/glass-footer.jpg')",
    cardCss: `
    background: oklch(from var(--bg-1) l c h / 0.5);
    border-radius: var(--card-radius);
    box-shadow: var(--box-shadow);
    border: var(--border);

    &[data-hover]:hover {
        box-shadow: 0 6px 16px rgba(0, 0, 0, 0.06);
    }`,
  },
  {
    id: 'glass',
    label: { zh: '半生雨(beta)', en: 'Glass(beta)' },
    homeBg: "url('/src/assets/glass-footer.jpg')",
    footerBg: "url('/src/assets/glass-footer.jpg')",
    video: '/src/assets/glass-bg.mp4',
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
  },
  {
    id: 'flat',
    label: { zh: '扁平(beta)', en: 'Flat(beta)' },
    mainColor: 'oklch(0.7 0.125 20)',
    homeBg: "url('/src/assets/home-bg.jpg')",
    footerBg: "url('/src/assets/glass-footer.jpg')",
    cardCss: `
    border-radius: var(--card-radius);
    box-shadow: none;
    border: 1px solid var(--text-3);
    opacity: 0.95;

    &[data-hover]:hover {
        box-shadow: 0 6px 16px rgba(0, 0, 0, 0.06);
    }`,
  },
  {
    id: 'neo',
    label: { zh: '拟态(beta)', en: 'Neo(beta)' },
    mainColor: 'oklch(0.7 0.125 20)',
    homeBg: "url('/src/assets/home-bg.jpg')",
    footerBg: "url('/src/assets/glass-footer.jpg')",
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
  },
] as const satisfies readonly StylePreset[];

export const themeConfig: ThemeConfig = {
  // ===== 配色设计说明 =====
  // 中性色统一为暖纸白背景(浅色) / 深蓝黑背景(暗色)，文字统一为蓝灰色相 (hue 260)
  // 强调色为玫红 (main-color, hue 20)，三档文字亮度递减：主文 → 次文 → 弱化
  // bg-0 页面底 / bg-1 卡片面 / bg-2 悬浮层（浅色越深越突出，暗色越亮越突出）

  // 浅色主题变量
  light: {
    "bg-0": 'oklch(0.99 0.006 45)',       // 暖白纸
    "bg-1": 'oklch(0.965 0.012 45)',      // 卡片面
    "bg-2": 'oklch(0.93 0.016 45)',       // 悬浮层
    "text-1": 'oklch(0.27 0.03 260)',     // 主文字（高对比）
    "text-2": 'oklch(0.47 0.028 260)',    // 次文字
    "text-3": 'oklch(0.6 0.022 260)',     // 弱化文字
    border: '1px solid oklch(0.4 0.015 45 / 16%)',
    boxShadow: 'oklch(0.3 0.02 260 / 0.05) 0 1px 2px, oklch(0.3 0.02 260 / 0.09) 0 8px 24px',
    homeBgFilter: 'transparent',
  },

  // 深色主题变量
  dark: {
    "bg-0": 'oklch(0.155 0.016 260)',     // 深蓝黑
    "bg-1": 'oklch(0.195 0.02 260)',      // 卡片面
    "bg-2": 'oklch(0.235 0.022 260)',     // 悬浮层
    "text-1": 'oklch(0.95 0.012 260)',    // 主文字
    "text-2": 'oklch(0.8 0.02 260)',      // 次文字
    "text-3": 'oklch(0.63 0.02 260)',     // 弱化文字
    border: '1px solid oklch(1 0 0 / 10%)',
    boxShadow: 'oklch(0 0 0 / 0.55) 0 5px 15px',
    homeBgFilter: 'oklch(0 0 0 / 0.65)',
  },

  // 全部卡片风格（在此处新增）
  cardStyles,
};
