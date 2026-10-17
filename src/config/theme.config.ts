/** Single registration point; each preset owns its light/dark appearance. */
export { defaultLight, defaultDark } from './themes/tokens';
export type { ThemeTokens, StylePreset } from './themes/tokens';
import { base } from './themes/base';
import { glass } from './themes/glass';
import { flat } from './themes/flat';
import { neo } from './themes/neo';
import { expressive } from './themes/expressive';

export const cardStyles = [base, glass, flat, neo, expressive] as const;
