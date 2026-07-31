import { Sun, Moon, Monitor, type LucideIcon } from 'lucide-react';
import { cardStyles } from './theme.config';

/** Available theme options (id is also the actual value used by the store) */
export type ThemeId = 'light' | 'system' | 'dark';

/** A theme resolved to an actual color scheme */
export type EffectiveTheme = 'light' | 'dark';

/** Card style ids are derived from the registry in theme.config.ts */
export type CardStyleId = (typeof cardStyles)[number]['id'];

export interface ThemeOption {
  id: ThemeId;
  /** i18n key under `theme.` */
  labelKey: string;
  icon: LucideIcon;
}

export interface CardStyleOption {
  id: CardStyleId;
  label: { zh: string; en: string };
  /** 首页背景视频（可选） */
  video?: string;
}

export const THEME_OPTIONS: ThemeOption[] = [
  { id: 'light', labelKey: 'light', icon: Sun },
  { id: 'system', labelKey: 'system', icon: Monitor },
  { id: 'dark', labelKey: 'dark', icon: Moon },
];

export const CARD_STYLES: CardStyleOption[] = cardStyles.map((s) => ({
  id: s.id,
  label: s.label,
  video: 'video' in s ? s.video : undefined,
}));

export const DEFAULT_THEME: ThemeId = 'system';
/** 默认卡片风格：优先 glass，若注册表里没有则取第一个 */
export const DEFAULT_CARD_STYLE: CardStyleId =
  (cardStyles.find((s) => s.id === 'glass') ?? cardStyles[0]).id;

/** theme-color meta values for each effective theme (browser UI color) */
export const THEME_META_COLOR: Record<EffectiveTheme, string> = {
  light: 'oklch(0.985 0.006 45)',
  dark: 'oklch(0.155 0.016 260)',
};
