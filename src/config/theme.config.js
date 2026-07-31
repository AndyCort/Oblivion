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
export var cardStyles = [
    {
        id: 'base',
        label: { zh: '基础', en: 'Base' },
        mainColor: 'oklch(0.7 0.125 20)',
        homeBg: "url('/src/assets/base-bg.png')",
        footerBg: "url('/src/assets/glass-footer.jpg')",
        cardCss: "\n    background: oklch(from var(--bg-1) l c h / 0.5);\n    border-radius: var(--card-radius);\n    box-shadow: var(--box-shadow);\n    border: var(--border);\n\n    &[data-hover]:hover {\n        box-shadow: 0 6px 16px rgba(0, 0, 0, 0.06);\n    }",
    },
    {
        id: 'glass',
        label: { zh: '半生雨(beta)', en: 'Glass(beta)' },
        mainColor: 'oklch(0.7 0.125 20)',
        homeBg: "url('/src/assets/glass-footer.jpg')",
        footerBg: "url('/src/assets/glass-footer.jpg')",
        video: '/src/assets/glass-bg.mp4',
        cardCss: "\n    background: oklch(from var(--bg-1) l c h / 0.3); \n    box-shadow: var(--box-shadow);\n    border-radius: var(--card-radius);\n    backdrop-filter: blur(10px);\n    -webkit-backdrop-filter: blur(10px);\n    &[data-hover] {\n        transition: all 0.3s ease;\n\n        &:hover {\n            transform: translateY(-2px);\n            box-shadow: 0 12px 28px rgba(0, 0, 0, 0.12);\n        }\n    }",
    },
    {
        id: 'flat',
        label: { zh: '扁平(beta)', en: 'Flat(beta)' },
        mainColor: 'oklch(0.7 0.125 20)',
        homeBg: "url('/src/assets/home-bg.jpg')",
        footerBg: "url('/src/assets/glass-footer.jpg')",
        cardCss: "\n    border-radius: var(--card-radius);\n    box-shadow: none;\n    border: 1px solid var(--text-3);\n    opacity: 0.95;\n\n    &[data-hover]:hover {\n        box-shadow: 0 6px 16px rgba(0, 0, 0, 0.06);\n    }",
    },
    {
        id: 'neo',
        label: { zh: '拟态(beta)', en: 'Neo(beta)' },
        mainColor: 'oklch(0.7 0.125 20)',
        homeBg: "url('/src/assets/home-bg.jpg')",
        footerBg: "url('/src/assets/glass-footer.jpg')",
        cardCss: "\n    background: var(--bg-0);\n    border: 2px solid var(--text-1);\n    box-shadow: 4px 4px 0 var(--text-1);\n    border-radius: 12px;\n\n    &[data-hover] {\n        transition: all 0.2s ease;\n\n        &:hover {\n            transform: translate(-2px, -2px);\n            box-shadow: 6px 6px 0 var(--text-1);\n        }\n    }",
    },
];
export var themeConfig = {
    // ===== 配色设计说明 =====
    // 中性色统一为暖纸白背景(浅色) / 深蓝黑背景(暗色)，文字统一为蓝灰色相 (hue 260)
    // 强调色为玫红 (main-color, hue 20)，三档文字亮度递减：主文 → 次文 → 弱化
    // bg-0 页面底 / bg-1 卡片面 / bg-2 悬浮层（浅色越深越突出，暗色越亮越突出）
    // 浅色主题变量
    light: {
        "bg-0": 'oklch(0.99 0.006 45)', // 暖白纸
        "bg-1": 'oklch(0.965 0.012 45)', // 卡片面
        "bg-2": 'oklch(0.93 0.016 45)', // 悬浮层
        "text-1": 'oklch(0.27 0.03 260)', // 主文字（高对比）
        "text-2": 'oklch(0.47 0.028 260)', // 次文字
        "text-3": 'oklch(0.6 0.022 260)', // 弱化文字
        border: '1px solid oklch(0.4 0.015 45 / 16%)',
        boxShadow: 'oklch(0.3 0.02 260 / 0.05) 0 1px 2px, oklch(0.3 0.02 260 / 0.09) 0 8px 24px',
        homeBgFilter: 'transparent',
    },
    // 深色主题变量
    dark: {
        "bg-0": 'oklch(0.155 0.016 260)', // 深蓝黑
        "bg-1": 'oklch(0.195 0.02 260)', // 卡片面
        "bg-2": 'oklch(0.235 0.022 260)', // 悬浮层
        "text-1": 'oklch(0.95 0.012 260)', // 主文字
        "text-2": 'oklch(0.8 0.02 260)', // 次文字
        "text-3": 'oklch(0.63 0.02 260)', // 弱化文字
        border: '1px solid oklch(1 0 0 / 10%)',
        boxShadow: 'oklch(0 0 0 / 0.55) 0 5px 15px',
        homeBgFilter: 'oklch(0 0 0 / 0.65)',
    },
    // 全部卡片风格（在此处新增）
    cardStyles: cardStyles,
};
