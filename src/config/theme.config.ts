export { defaultLight, defaultDark } from './themes/tokens';
export type { ThemeTokens, StylePreset } from './themes/tokens';
import { base } from './themes/base';
import { glass } from './themes/glass';
import { flat } from './themes/flat';

export const cardStyles = [base, glass, flat] as const;
