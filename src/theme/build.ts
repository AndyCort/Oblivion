import { cardStyles } from '../config/theme.config';
import { DEFAULT_CARD_STYLE, DEFAULT_THEME, THEME_KEY, CARD_STYLE_KEY, DARK_MEDIA_QUERY, resolveMode, resolveTokens, toCssVariables } from './model';
import { applyThemeDocument } from './dom';
import { validatePresets } from './validate';

export function buildThemeCss(): string {
  validatePresets(cardStyles, DEFAULT_CARD_STYLE);
  const blocks = ['/* Generated from theme.config.ts. Do not edit. */'];
  for (const style of cardStyles) {
    for (const mode of ['light', 'dark'] as const) {
      const selector = `:root[data-card-style="${style.id}"][data-theme="${mode}"]`;
      const fallback = style.id === DEFAULT_CARD_STYLE ? (mode === 'light' ? ':root, ' : ':root[data-theme="dark"], ') : '';
      const variables = Object.entries(toCssVariables(resolveTokens(style.id, mode)))
        .map(([key, value]) => `  ${key}: ${value};`).join('\n');
      blocks.push(`${fallback}${selector} {\n${variables}\n}`);
    }
    blocks.push(`:root[data-card-style="${style.id}"] [data-card=""], [data-card="${style.id}"] {\n${style.cardCss}\n}`);
  }
  return blocks.join('\n\n') + '\n';
}

/** Build only data here; DOM application is shared with the runtime store. */
export function buildThemeScript(): string {
  validatePresets(cardStyles, DEFAULT_CARD_STYLE);
  const colors = Object.fromEntries(cardStyles.map(style => [style.id, {
    light: resolveTokens(style.id, 'light')['bg-0'], dark: resolveTokens(style.id, 'dark')['bg-0'],
  }]));
  return `(() => {
    const read = key => { try { return localStorage.getItem(key); } catch { return null; } };
    const colors = ${JSON.stringify(colors)};
    const saved = read(${JSON.stringify(THEME_KEY)});
    const preference = ['light', 'dark', 'system'].includes(saved) ? saved : ${JSON.stringify(DEFAULT_THEME)};
    const savedStyle = read(${JSON.stringify(CARD_STYLE_KEY)});
    const style = Object.prototype.hasOwnProperty.call(colors, savedStyle) ? savedStyle : ${JSON.stringify(DEFAULT_CARD_STYLE)};
    const mode = (${resolveMode.toString()})(preference, matchMedia(${JSON.stringify(DARK_MEDIA_QUERY)}).matches);
    (${applyThemeDocument.toString()})(mode, style, colors[style][mode]);
    window.__locale = read('locale') || 'zh-CN';
  })();`;
}
