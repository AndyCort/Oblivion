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
    label: {
        zh: string;
        en: string;
    };
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
export declare const cardStyles: readonly [{
    readonly id: "base";
    readonly label: {
        readonly zh: "基础";
        readonly en: "Base";
    };
    readonly mainColor: "oklch(0.7 0.125 20)";
    readonly homeBg: "url('/src/assets/base-bg.png')";
    readonly footerBg: "url('/src/assets/glass-footer.jpg')";
    readonly cardCss: "\n    background: oklch(from var(--bg-1) l c h / 0.5);\n    border-radius: var(--card-radius);\n    box-shadow: var(--box-shadow);\n    border: var(--border);\n\n    &[data-hover]:hover {\n        box-shadow: 0 6px 16px rgba(0, 0, 0, 0.06);\n    }";
}, {
    readonly id: "glass";
    readonly label: {
        readonly zh: "半生雨(beta)";
        readonly en: "Glass(beta)";
    };
    readonly homeBg: "url('/src/assets/glass-footer.jpg')";
    readonly footerBg: "url('/src/assets/glass-footer.jpg')";
    readonly video: "/src/assets/glass-bg.mp4";
    readonly cardCss: "\n    background: oklch(from var(--bg-1) l c h / 0.3); \n    box-shadow: var(--box-shadow);\n    border-radius: var(--card-radius);\n    backdrop-filter: blur(10px);\n    -webkit-backdrop-filter: blur(10px);\n    &[data-hover] {\n        transition: all 0.3s ease;\n\n        &:hover {\n            transform: translateY(-2px);\n            box-shadow: 0 12px 28px rgba(0, 0, 0, 0.12);\n        }\n    }";
}, {
    readonly id: "flat";
    readonly label: {
        readonly zh: "扁平(beta)";
        readonly en: "Flat(beta)";
    };
    readonly mainColor: "oklch(0.7 0.125 20)";
    readonly homeBg: "url('/src/assets/home-bg.jpg')";
    readonly footerBg: "url('/src/assets/glass-footer.jpg')";
    readonly cardCss: "\n    border-radius: var(--card-radius);\n    box-shadow: none;\n    border: 1px solid var(--text-3);\n    opacity: 0.95;\n\n    &[data-hover]:hover {\n        box-shadow: 0 6px 16px rgba(0, 0, 0, 0.06);\n    }";
}, {
    readonly id: "neo";
    readonly label: {
        readonly zh: "拟态(beta)";
        readonly en: "Neo(beta)";
    };
    readonly mainColor: "oklch(0.7 0.125 20)";
    readonly homeBg: "url('/src/assets/home-bg.jpg')";
    readonly footerBg: "url('/src/assets/glass-footer.jpg')";
    readonly cardCss: "\n    background: var(--bg-0);\n    border: 2px solid var(--text-1);\n    box-shadow: 4px 4px 0 var(--text-1);\n    border-radius: 12px;\n\n    &[data-hover] {\n        transition: all 0.2s ease;\n\n        &:hover {\n            transform: translate(-2px, -2px);\n            box-shadow: 6px 6px 0 var(--text-1);\n        }\n    }";
}];
export declare const themeConfig: ThemeConfig;
