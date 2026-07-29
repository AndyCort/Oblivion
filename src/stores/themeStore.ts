/**
 * Vanilla JS theme store — works in both Astro components and React Islands.
 * Uses custom events for cross-island communication.
 */

export type Theme = 'light' | 'dark' | 'system'
export type CardStyle = 'base' | 'glass' | 'flat' | 'neo'

const THEME_KEY = 'theme'
const CARD_STYLE_KEY = 'card-style'
const THEME_EVENT = 'theme-change'
const CARD_STYLE_EVENT = 'card-style-change'

/** Read the current theme preference */
export function getTheme(): Theme {
  if (typeof document === 'undefined') return 'system'
  return (localStorage.getItem(THEME_KEY) as Theme) || 'system'
}

/** Apply actual DOM changes based on theme preference */
function applyTheme(theme: Theme): void {
  if (typeof document === 'undefined') return
  const isDark = theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)
  const themeColorMeta = document.getElementById('theme-color-meta')
  
  if (isDark) {
    document.documentElement.classList.add('dark-mode')
    if (themeColorMeta) themeColorMeta.setAttribute('content', 'oklch(0.15 0.015 240)')
  } else {
    document.documentElement.classList.remove('dark-mode')
    if (themeColorMeta) themeColorMeta.setAttribute('content', 'oklch(0.95 0.015 20)')
  }
}

/** Apply theme and persist to localStorage */
export function setTheme(theme: Theme): void {
  if (typeof document === 'undefined') return
  localStorage.setItem(THEME_KEY, theme)
  applyTheme(theme)
  window.dispatchEvent(new CustomEvent(THEME_EVENT, { detail: theme }))
}

/** Toggle between light and dark (legacy) */
export function toggleTheme(): void {
  const current = getTheme()
  setTheme(current === 'light' ? 'dark' : 'light')
}

/** Initialize theme from localStorage or system preference */
export function initTheme(): void {
  if (typeof window === 'undefined') return
  const saved = getTheme()
  applyTheme(saved)

  // Listen for system preference changes
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
    if (getTheme() === 'system') {
      applyTheme('system')
    }
  })
}

/** Subscribe to theme changes (returns unsubscribe fn) */
export function onThemeChange(callback: (theme: Theme) => void): () => void {
  const handler = (e: Event) => callback((e as CustomEvent).detail as Theme)
  window.addEventListener(THEME_EVENT, handler)
  return () => window.removeEventListener(THEME_EVENT, handler)
}

/** Read the current card style */
export function getCardStyle(): CardStyle {
  if (typeof document === 'undefined') return 'glass' // fallback default
  return (localStorage.getItem(CARD_STYLE_KEY) as CardStyle) || document.documentElement.getAttribute('data-card-style') as CardStyle || 'glass'
}

/** Apply card style and persist */
export function setCardStyle(style: CardStyle): void {
  if (typeof document === 'undefined') return
  localStorage.setItem(CARD_STYLE_KEY, style)
  document.documentElement.setAttribute('data-card-style', style)
  window.dispatchEvent(new CustomEvent(CARD_STYLE_EVENT, { detail: style }))
}

/** Subscribe to card style changes */
export function onCardStyleChange(callback: (style: CardStyle) => void): () => void {
  const handler = (e: Event) => callback((e as CustomEvent).detail as CardStyle)
  window.addEventListener(CARD_STYLE_EVENT, handler)
  return () => window.removeEventListener(CARD_STYLE_EVENT, handler)
}
