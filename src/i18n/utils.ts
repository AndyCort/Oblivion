import { readStorage, writeStorage } from '../utils/storage';
/**
 * Lightweight i18n utility — no React dependency.
 * Works in both Astro components (build-time) and React Islands (runtime).
 */

import zh from './zh.json'
import en from './en.json'

export type Locale = 'zh-CN' | 'en-US'

const LOCALE_KEY = 'locale'
const LOCALE_EVENT = 'locale-change'

const translations: Record<Locale, Record<string, unknown>> = {
  'zh-CN': zh,
  'en-US': en,
}

/** Get current locale from localStorage or default */
export function getLocale(): Locale {
  const saved = readStorage(LOCALE_KEY)
  if (saved === 'zh-CN' || saved === 'en-US') return saved
  return 'zh-CN'
}

/** Set locale and persist */
export function setLocale(locale: Locale): void {
  writeStorage(LOCALE_KEY, locale)
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(LOCALE_EVENT, { detail: locale }))
  }
}

/** Toggle between zh-CN and en-US */
export function toggleLocale(): void {
  setLocale(getLocale() === 'zh-CN' ? 'en-US' : 'zh-CN')
}

/** Get a translation value by dot-path key */
export function t(key: string, locale?: Locale): string {
  const lang = locale || getLocale()
  const dict = translations[lang] || translations['zh-CN']
  const parts = key.split('.')
  let val: unknown = dict
  for (const part of parts) {
    if (!val || typeof val !== 'object' || !Object.prototype.hasOwnProperty.call(val, part)) return key
    val = (val as Record<string, unknown>)[part]
  }
  return typeof val === 'string' ? val : key
}

/** Get localized field from multilingual object { zh: ..., en: ... } or plain string */
export function getLocalizedField(field: unknown, locale?: Locale): string {
  if (!field) return ''
  if (typeof field === 'string') return field
  if (typeof field !== 'object' || Array.isArray(field)) return ''
  const values = field as Record<string, unknown>
  const lang = (locale || getLocale()) === 'zh-CN' ? 'zh' : 'en'
  const firstValue = Object.values(field).find(v => typeof v === 'string') as string | undefined
  return [values[lang], values.zh, values.en, firstValue].find(
    (value): value is string => typeof value === 'string' && value.length > 0
  ) || ''
}

/** Subscribe to locale changes */
export function onLocaleChange(callback: (locale: Locale) => void): () => void {
  if (typeof window === 'undefined') return () => {}
  const handler = (e: Event) => callback((e as CustomEvent).detail as Locale)
  window.addEventListener(LOCALE_EVENT, handler)
  return () => window.removeEventListener(LOCALE_EVENT, handler)
}
