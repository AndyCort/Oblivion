import { defaultLight, defaultDark, type StylePreset } from './tokens';

export const flat = {
    id: "flat",
    label: { zh: "扁平(beta)", en: "Flat(beta)" },
    cardCss: `
    border-radius: var(--card-radius);
    box-shadow: none;
    border: 1px solid var(--text-3);
    background: var(--bg-1);
    `,
    buttonCss: `
    width: 40px;
    height: 40px;
    border-radius: 50%;
    background: var(--bg-3);
    border: 1px solid var(--text-3);
    box-shadow: none;
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--text-1);
    cursor: pointer;
    outline: none;
    transition: all 0.25s ease;

    &:hover:not(:disabled) {
      color: var(--main-color);
      border-color: var(--main-color);
    }

    &:disabled {
      cursor: not-allowed;
      opacity: 0.4;
    }
    `,
    light: {
      ...defaultLight,
      'main-color': "oklch(0.7 0.125 20)",
    },
    dark: { ...defaultDark },
  } as const satisfies StylePreset;
