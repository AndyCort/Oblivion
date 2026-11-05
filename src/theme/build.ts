import { cardStyles } from '../config/theme.config';
import { DEFAULT_CARD_STYLE, DEFAULT_THEME, THEME_KEY, CARD_STYLE_KEY, DARK_MEDIA_QUERY, resolveMode, resolveTokens, toCssVariables } from './model';
import { applyThemeDocument } from './dom';
import { validatePresets } from './validate';

export function buildThemeCss(): string {
  validatePresets(cardStyles, DEFAULT_CARD_STYLE);
  const blocks = [
    '/* 自动生成，请修改 themes/*.ts。bg-0 页面底色 / bg-1 主表面 / bg-2 内嵌 / bg-3 浮层；text-1 主要 / text-2 次要 / text-3 辅助。数字不是 DOM 深度或 z-index。区域 *-bg 可含渐变，bg-* 必须是颜色。 */',
  ];

  for (const style of cardStyles) {
    // 独立深浅模式变量定义
    for (const mode of ['light', 'dark'] as const) {
      const selector = `:root[data-card-style="${style.id}"][data-theme="${mode}"]`;
      const modeSelectors = `:root[data-card-style="${style.id}"][data-mode="${mode}"], [data-mode="${mode}"][data-card-style="${style.id}"]`;
      const fallback = style.id === DEFAULT_CARD_STYLE ? (mode === 'light' ? ':root, ' : ':root[data-theme="dark"], :root[data-mode="dark"], ') : '';
      const variables = Object.entries(toCssVariables(resolveTokens(style.id, mode)))
        .map(([key, value]) => `  ${key}: ${value};`).join('\n');
      blocks.push(`${fallback}${selector}, ${modeSelectors} {\n${variables}\n}`);
    }

    // 视觉主题材质层 (纯粹由 components 字典驱动)
    for (const [compName, compCss] of Object.entries(style.components || {})) {
      if (!compCss || !compCss.trim()) continue;
      blocks.push(
        `:root[data-card-style="${style.id}"] [data-${compName}=""], :root[data-card-style="${style.id}"] [data-${compName}="true"], :root[data-theme-style="${style.id}"] [data-${compName}=""], :root[data-theme-style="${style.id}"] [data-${compName}="true"], [data-${compName}="${style.id}"] {\n${compCss}\n}`
      );
    }
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
