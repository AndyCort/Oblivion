import { useSyncExternalStore } from 'react';
import { readStorage, writeStorage } from '../utils/storage';
import {
  DEFAULT_THEME, DEFAULT_CARD_STYLE, THEME_KEY, CARD_STYLE_KEY, DARK_MEDIA_QUERY,
  isThemeId, isCardStyleId, resolveMode, resolveTokens,
  type ThemeId, type CardStyleId,
} from '../theme/model';
import { applyThemeDocument } from '../theme/dom';
export { isThemeId, isCardStyleId } from '../theme/model';

const serverSnapshot = { theme: DEFAULT_THEME, cardStyle: DEFAULT_CARD_STYLE, effectiveTheme: resolveMode(DEFAULT_THEME, false) };
let snapshot = serverSnapshot;
const listeners = new Set<() => void>();
let dispose: (() => void) | undefined;
const prefersDark = () => typeof window !== 'undefined' && window.matchMedia(DARK_MEDIA_QUERY).matches;
export const getEffectiveTheme = (theme: ThemeId) => resolveMode(theme, prefersDark());
export const isDarkTheme = (theme: ThemeId) => getEffectiveTheme(theme) === 'dark';
export const getTheme = () => snapshot.theme;
export const getCardStyle = () => snapshot.cardStyle;
export const getThemeSnapshot = () => snapshot;
export function subscribeTheme(listener: () => void) {
  listeners.add(listener);
  return () => { listeners.delete(listener); };
}
function update(theme: ThemeId, cardStyle: CardStyleId) {
  const effectiveTheme = getEffectiveTheme(theme);
  if (typeof document !== 'undefined') {
    applyThemeDocument(effectiveTheme, cardStyle, resolveTokens(cardStyle, effectiveTheme)['bg-0']);
  }
  if (snapshot.theme === theme && snapshot.cardStyle === cardStyle && snapshot.effectiveTheme === effectiveTheme) return;
  snapshot = { theme, cardStyle, effectiveTheme };
  listeners.forEach(listener => listener());
}
export function setTheme(theme: ThemeId) {
  if (!isThemeId(theme)) return;
  writeStorage(THEME_KEY, theme);
  update(theme, snapshot.cardStyle);
}
export function setCardStyle(style: CardStyleId) {
  if (!isCardStyleId(style)) return;
  writeStorage(CARD_STYLE_KEY, style);
  update(snapshot.theme, style);
}
export function toggleTheme() {
  setTheme(snapshot.effectiveTheme === 'dark' ? 'light' : 'dark');
}
/** One listener pair per application, with explicit cleanup for HMR and tests. */
export function initTheme(): () => void {
  if (dispose) return dispose;
  if (typeof window === 'undefined') return () => {};
  const theme = readStorage(THEME_KEY);
  const style = readStorage(CARD_STYLE_KEY);
  update(isThemeId(theme) ? theme : DEFAULT_THEME, isCardStyleId(style) ? style : DEFAULT_CARD_STYLE);
  const media = window.matchMedia(DARK_MEDIA_QUERY);
  const onSystemChange = () => update(snapshot.theme, snapshot.cardStyle);
  const onStorage = (event: StorageEvent) => {
    if (event.storageArea !== window.localStorage) return;
    if (event.key === null) update(DEFAULT_THEME, DEFAULT_CARD_STYLE);
    else if (event.key === THEME_KEY) update(isThemeId(event.newValue) ? event.newValue : DEFAULT_THEME, snapshot.cardStyle);
    else if (event.key === CARD_STYLE_KEY) update(snapshot.theme, isCardStyleId(event.newValue) ? event.newValue : DEFAULT_CARD_STYLE);
  };
  media.addEventListener('change', onSystemChange);
  window.addEventListener('storage', onStorage);
  dispose = () => {
    media.removeEventListener('change', onSystemChange);
    window.removeEventListener('storage', onStorage);
    dispose = undefined;
  };
  return dispose;
}
export function useTheme() {
  const state = useSyncExternalStore(subscribeTheme, getThemeSnapshot, () => serverSnapshot);
  return { theme: state.theme, effectiveTheme: state.effectiveTheme, setTheme };
}
export function useCardStyle() {
  const state = useSyncExternalStore(subscribeTheme, getThemeSnapshot, () => serverSnapshot);
  return { cardStyle: state.cardStyle, setCardStyle };
}
