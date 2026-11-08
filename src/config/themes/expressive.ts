import { defaultLight, type StylePreset } from './tokens';

export const expressive = {
    id: "expressive",
    label: { zh: "悦动(Expressive)", en: "Expressive" },
    components: {
      card: `
        background: var(--bg-1);
        border-radius: 32px 12px 32px 12px;
        box-shadow: var(--box-shadow);
        border: 1px solid color-mix(in oklab, var(--main-color) 10%, transparent);
        transition: background-color 0.4s, box-shadow 0.4s, transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
      `,
      navbar: `
        border-radius: 999px;
        background: var(--bg-1);
        border: 1px solid color-mix(in oklab, var(--main-color) 15%, transparent);
        box-shadow: var(--box-shadow);
      `,
      button: `
        border-radius: 50%;
        background: var(--bg-3);
        border: 1px solid color-mix(in oklab, var(--main-color) 15%, transparent);
        box-shadow: var(--box-shadow);
        color: var(--text-1);

        &:hover:not(:disabled) {
          color: var(--main-color);
          border-color: var(--main-color);
          transform: scale(1.08);
        }

        &:disabled {
          cursor: not-allowed;
          opacity: 0.4;
        }
      `,
    },
    light: {
      ...defaultLight,
      "bg-0": "oklch(0.98 0.01 45)",
      "bg-1": "oklch(1 0 0)",
      "bg-2": "oklch(0.96 0.02 45)",
      "text-1": "oklch(0.2 0.05 270)",
      "text-2": "oklch(0.4 0.04 270)",
      "text-3": "oklch(0.6 0.03 270)",
      'main-color': "oklch(0.65 0.25 15)", // Vibrant expressive magenta/red
      border: "1px solid oklch(0.65 0.25 15 / 15%)",
      'box-shadow':
        "oklch(0.65 0.25 15 / 0.12) 0 8px 24px, oklch(0.65 0.25 15 / 0.04) 0 2px 4px",
    },
    dark: {
      'home-bg-filter': "oklch(0 0 0 / 0.7)",
      "bg-0": "oklch(0.12 0.03 270)",
      "bg-1": "oklch(0.18 0.04 270)",
      "bg-2": "oklch(0.24 0.05 270)",
      "bg-3": "oklch(0.24 0.05 270)",
      "text-0": "oklch(1 0 270)",
      "text-1": "oklch(0.98 0.02 270)",
      "text-2": "oklch(0.85 0.03 270)",
      "text-3": "oklch(0.7 0.03 270)",
      'main-color': "oklch(0.7 0.25 15)",
      border: "1px solid oklch(0.7 0.25 15 / 20%)",
      'box-shadow': "oklch(0.7 0.25 15 / 0.2) 0 8px 32px",
    },
  } as const satisfies StylePreset;
