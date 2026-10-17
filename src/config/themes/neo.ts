import { defaultLight, defaultDark, type StylePreset } from './tokens';

export const neo = {
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
  } as const satisfies StylePreset;
