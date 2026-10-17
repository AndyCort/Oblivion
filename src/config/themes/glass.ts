import { defaultLight, defaultDark, type StylePreset } from './tokens';

export const glass = {
    id: "glass",
    video: "/vids/glass-bg.mp4",
    label: { zh: "半生雨(beta)", en: "Glass(beta)" },
    cardCss: `
    border: var(--border);
    box-shadow: var(--box-shadow);
    border-radius: var(--card-radius);
    backdrop-filter: blur(10px);
    -webkit-backdrop-filter: blur(10px);
    `,
    light: {
      ...defaultLight,
      "bg-1": "oklch(0.98 0.01 45)",
      "bg-2": "oklch(0.98 0.01 45)",
      "bg-3": "oklch(0.98 0.01 45)",
      'home-bg-filter': "oklch(0 0 0 / 0.65)",
      'main-color': "oklch(0.7 0.125 20)",
    },
    dark: {
      ...defaultDark,
      "bg-1": "oklch(0.22 0 45)",
      "bg-2": "oklch(0.25 0 45)",
      "bg-3": "oklch(0.22 0 45)",
    },
  } as const satisfies StylePreset;
