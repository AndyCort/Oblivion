import { cardStyles, type ThemeTokens } from '../config/theme.config';

export type ThemeId = 'light' | 'system' | 'dark';
export type EffectiveTheme = 'light' | 'dark';
export type CardStyleId = (typeof cardStyles)[number]['id'];
export const DEFAULT_THEME: ThemeId = 'system';
export const DEFAULT_CARD_STYLE: CardStyleId = 'glass';
export const THEME_KEY = 'theme';
export const CARD_STYLE_KEY = 'card-style';
export const DARK_MEDIA_QUERY = '(prefers-color-scheme: dark)';

export function isThemeId(value: unknown): value is ThemeId {
  return value === 'light' || value === 'dark' || value === 'system';
}
export function isCardStyleId(value: unknown): value is CardStyleId {
  return cardStyles.some(style => style.id === value);
}
export function resolveMode(preference: ThemeId, prefersDark: boolean): EffectiveTheme {
  return preference === 'system' ? (prefersDark ? 'dark' : 'light') : preference;
}
export function getPreset(id: CardStyleId) {
  return cardStyles.find(style => style.id === id)!;
}
export function resolveTokens(id: CardStyleId, mode: EffectiveTheme): ThemeTokens {
  const preset = getPreset(id);
  return { ...preset.light, ...(mode === 'dark' ? preset.dark : {}) };
}
export function toCssVariables(tokens: ThemeTokens): Record<`--${string}`, string> {
  return Object.fromEntries(Object.entries(tokens).map(([key, value]) => [`--${key}`, value]));
}
