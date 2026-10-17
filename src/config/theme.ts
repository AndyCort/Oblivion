import { Sun, Moon, Monitor } from 'lucide-react';
import { cardStyles } from './theme.config';
export * from '../theme/model';

export const THEME_OPTIONS = [
  { id: 'light', labelKey: 'light', icon: Sun },
  { id: 'system', labelKey: 'system', icon: Monitor },
  { id: 'dark', labelKey: 'dark', icon: Moon },
] as const;
export const CARD_STYLES = cardStyles.map(style => ({
  ...style,
  video: 'video' in style ? style.video : undefined,
}));
