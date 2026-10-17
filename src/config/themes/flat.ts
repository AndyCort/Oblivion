import { defaultLight, defaultDark, type StylePreset } from './tokens';

export const flat = {
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
  } as const satisfies StylePreset;
