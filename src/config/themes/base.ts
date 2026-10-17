import { defaultLight, type StylePreset } from './tokens';

export const base = {
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
  } as const satisfies StylePreset;
