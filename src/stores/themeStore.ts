/**
 * Theme store — vanilla JS core with optional React bindings.
 * Uses custom events so any framework can subscribe.
 * React components can use `useTheme()` / `useCardStyle()`.
 */
import { useEffect, useState } from 'react';
import {
  THEME_OPTIONS,
  CARD_STYLES,
  DEFAULT_THEME,
  DEFAULT_CARD_STYLE,
  THEME_META_COLOR,
  type ThemeId,
  type CardStyleId,
  type EffectiveTheme,
} from '../config/theme';

const THEME_KEY = 'theme';
const CARD_STYLE_KEY = 'card-style';
const THEME_EVENT = 'theme-change';
const CARD_STYLE_EVENT = 'card-style-change';
const DARK_MEDIA_QUERY = '(prefers-color-scheme: dark)';
const THEME_COLOR_META_ID = 'theme-color-meta';

// ---------- Guards ----------

export function isThemeId(value: unknown): value is ThemeId {
  return THEME_OPTIONS.some((o) => o.id === value);
}

export function isCardStyleId(value: unknown): value is CardStyleId {
  return CARD_STYLES.some((s) => s.id === value);
}

// ---------- Pure helpers ----------

/** Resolve a theme preference to an actual light/dark value ('system' follows the OS) */
export function getEffectiveTheme(themeId: ThemeId): EffectiveTheme {
  if (themeId === 'system') {
    const prefersDark = typeof window !== 'undefined' && window.matchMedia(DARK_MEDIA_QUERY).matches;
    return prefersDark ? 'dark' : 'light';
  }
  return themeId;
}

/** Whether the resolved theme is dark (used for direct light/dark decisions) */
export function isDarkTheme(themeId: ThemeId): boolean {
  return getEffectiveTheme(themeId) === 'dark';
}

// ---------- Theme ----------

/** Read the current theme preference (validated against configured options) */
export function getTheme(): ThemeId {
  if (typeof localStorage === 'undefined') return DEFAULT_THEME;
  const saved = localStorage.getItem(THEME_KEY);
  return isThemeId(saved) ? saved : DEFAULT_THEME;
}

/**
 * Apply a theme to the DOM and notify subscribers.
 * - sets `data-theme` to the effective (light/dark) value for CSS attribute selectors
 * - toggles the generic `.dark-mode` class
 * - updates the browser theme-color meta
 */
function applyTheme(themeId: ThemeId): void {
  if (typeof document === 'undefined') return;

  const effective = getEffectiveTheme(themeId);
  const isDark = effective === 'dark';

  document.documentElement.setAttribute('data-theme', effective);
  document.documentElement.classList.toggle('dark-mode', isDark);

  const meta = document.getElementById(THEME_COLOR_META_ID);
  if (meta) meta.setAttribute('content', THEME_META_COLOR[effective]);

  window.dispatchEvent(new CustomEvent<ThemeId>(THEME_EVENT, { detail: themeId }));
}

/** Set the theme preference, persist it, and apply it */
export function setTheme(themeId: ThemeId): void {
  if (typeof document === 'undefined') return;
  localStorage.setItem(THEME_KEY, themeId);
  applyTheme(themeId);
}

/** Toggle between light and dark (resolving 'system' to its actual value first) */
export function toggleTheme(): void {
  setTheme(isDarkTheme(getTheme()) ? 'light' : 'dark');
}

/** Apply the saved theme & card style on startup and follow OS preference changes while theme is 'system' */
export function initTheme(): void {
  if (typeof window === 'undefined') return;
  applyTheme(getTheme());
  setCardStyle(getCardStyle());

  const media = window.matchMedia(DARK_MEDIA_QUERY);
  const handleSystemChange = () => {
    if (getTheme() === 'system') applyTheme('system');
  };
  if (typeof media.addEventListener === 'function') {
    media.addEventListener('change', handleSystemChange);
  } else {
    media.addListener(handleSystemChange); // legacy Safari
  }
}

/** Subscribe to theme changes (returns unsubscribe fn) */
export function onThemeChange(callback: (theme: ThemeId) => void): () => void {
  const handler = (e: Event) => callback((e as CustomEvent<ThemeId>).detail);
  window.addEventListener(THEME_EVENT, handler);
  return () => window.removeEventListener(THEME_EVENT, handler);
}

// ---------- Card style ----------

/** Read the current card style (validated against configured options) */
export function getCardStyle(): CardStyleId {
  if (typeof localStorage === 'undefined') return DEFAULT_CARD_STYLE;
  const saved = localStorage.getItem(CARD_STYLE_KEY);
  if (isCardStyleId(saved)) return saved;
  const attr = typeof document !== 'undefined' ? document.documentElement.getAttribute('data-card-style') : null;
  return isCardStyleId(attr) ? attr : DEFAULT_CARD_STYLE;
}

/** Set the card style, persist it, and apply it */
export function setCardStyle(style: CardStyleId): void {
  if (typeof document === 'undefined') return;
  localStorage.setItem(CARD_STYLE_KEY, style);
  document.documentElement.setAttribute('data-card-style', style);
  window.dispatchEvent(new CustomEvent<CardStyleId>(CARD_STYLE_EVENT, { detail: style }));
}

/** Subscribe to card style changes (returns unsubscribe fn) */
export function onCardStyleChange(callback: (style: CardStyleId) => void): () => void {
  const handler = (e: Event) => callback((e as CustomEvent<CardStyleId>).detail);
  window.addEventListener(CARD_STYLE_EVENT, handler);
  return () => window.removeEventListener(CARD_STYLE_EVENT, handler);
}

// ---------- React bindings ----------

export function useTheme() {
  const [theme, setThemeState] = useState<ThemeId>(getTheme);

  useEffect(() => {
    setThemeState(getTheme());
    return onThemeChange(setThemeState);
  }, []);

  return { theme, setTheme };
}

export function useCardStyle() {
  const [cardStyle, setCardStyleState] = useState<CardStyleId>(getCardStyle);

  useEffect(() => {
    setCardStyleState(getCardStyle());
    return onCardStyleChange(setCardStyleState);
  }, []);

  return { cardStyle, setCardStyle };
}
