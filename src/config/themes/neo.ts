import { defaultLight, defaultDark, type StylePreset } from './tokens';

export const neo = {
    id: "neo",
    label: { zh: "拟态(beta)", en: "Neo(beta)" },
    // 硬描边和偏移阴影是本风格例外；复用主文字色保证轮廓对比。
    cardCss: `
    background: var(--bg-1);
    border: 2px solid var(--text-1);
    box-shadow: 4px 4px 0 var(--text-1);
    border-radius: 12px;
    `,
    light: {
      ...defaultLight,
      'main-color': "oklch(0.7 0.125 20)",
    },
    dark: { ...defaultDark },
  } as const satisfies StylePreset;
