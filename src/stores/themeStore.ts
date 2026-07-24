/**
 * Vanilla JS theme store — works in both Astro components and React Islands.
 * Uses custom events for cross-island communication.
 */

export type Theme = 'light' | 'dark'

const THEME_KEY = 'theme'
const THEME_EVENT = 'theme-change'

/** Read the current theme from the DOM class (source of truth) */
export function getTheme(): Theme {
  if (typeof document === 'undefined') return 'light'
  return document.documentElement.classList.contains('dark-mode') ? 'dark' : 'light'
}

/** Apply theme to DOM and persist to localStorage */
export function setTheme(theme: Theme): void {
  if (typeof document === 'undefined') return
  if (theme === 'dark') {
    document.documentElement.classList.add('dark-mode')
  } else {
    document.documentElement.classList.remove('dark-mode')
  }
  localStorage.setItem(THEME_KEY, theme)
  window.dispatchEvent(new CustomEvent(THEME_EVENT, { detail: theme }))
}

/** Toggle between light and dark */
export function toggleTheme(): void {
  setTheme(getTheme() === 'light' ? 'dark' : 'light')
}

/** Initialize theme from localStorage or system preference */
export function initTheme(): void {
  if (typeof window === 'undefined') return
  const saved = localStorage.getItem(THEME_KEY)
  if (saved === 'dark' || saved === 'light') {
    setTheme(saved)
  } else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
    setTheme('dark')
  } else {
    setTheme('light')
  }
}

/** Subscribe to theme changes (returns unsubscribe fn) */
export function onThemeChange(callback: (theme: Theme) => void): () => void {
  const handler = (e: Event) => callback((e as CustomEvent).detail as Theme)
  window.addEventListener(THEME_EVENT, handler)
  return () => window.removeEventListener(THEME_EVENT, handler)
}
