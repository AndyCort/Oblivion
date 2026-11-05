import { defaultLight, defaultDark, type StylePreset } from './tokens';

export const neo = {
    id: "neo",
    label: { zh: "拟态(beta)", en: "Neo(beta)" },
    components: {
      card: `
        background: var(--bg-1);
        border: 2px solid var(--text-1);
        box-shadow: 4px 4px 0 var(--text-1);
        border-radius: 12px;
      `,
      navbar: `
        border-radius: 999px;
        background: var(--bg-1);
        border: 2px solid var(--text-1);
        box-shadow: 3px 3px 0 var(--text-1);
      `,
      button: `
        border-radius: 50%;
        background: var(--bg-3);
        border: 2px solid var(--text-1);
        box-shadow: 2px 2px 0 var(--text-1);
        color: var(--text-1);

        &:hover:not(:disabled) {
          color: var(--main-color);
          transform: translate(-1px, -1px);
          box-shadow: 3px 3px 0 var(--text-1);
        }
        &:active:not(:disabled) {
          transform: translate(1px, 1px);
          box-shadow: 1px 1px 0 var(--text-1);
        }

        &:disabled {
          cursor: not-allowed;
          opacity: 0.4;
          box-shadow: none;
        }
      `,
    },
    light: {
      ...defaultLight,
      'main-color': "oklch(0.7 0.125 20)",
    },
    dark: { ...defaultDark },
  } as const satisfies StylePreset;
