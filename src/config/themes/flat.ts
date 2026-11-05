import { defaultLight, defaultDark, type StylePreset } from './tokens';

export const flat = {
    id: "flat",
    label: { zh: "扁平(beta)", en: "Flat(beta)" },
    components: {
      card: `
        border-radius: var(--card-radius);
        box-shadow: none;
        border: 1px solid var(--text-3);
        background: var(--bg-1);
      `,
      navbar: `
        border-radius: 999px;
        background: var(--bg-1);
        border: 1px solid var(--text-3);
        box-shadow: none;
      `,
      button: `
        border-radius: 50%;
        background: var(--bg-3);
        border: 1px solid var(--text-3);
        box-shadow: none;
        color: var(--text-1);

        &:hover:not(:disabled) {
          color: var(--main-color);
          border-color: var(--main-color);
        }

        &:disabled {
          cursor: not-allowed;
          opacity: 0.4;
        }
      `,
    },
    light: {
      ...defaultLight,
      'main-color': "oklch(0.7 0.125 20)",
    },
    dark: { ...defaultDark },
  } as const satisfies StylePreset;
