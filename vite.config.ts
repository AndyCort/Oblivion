import { defineConfig, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import fs from 'node:fs';
import path from 'node:path';
import { themeConfig, defaultLight, defaultDark } from './src/config/theme.config';

const OUTPUT_PATH = './src/styles/theme-vars.css';
const IMG_DIR = path.resolve(process.cwd(), 'src/assets/imgs');
const IMG_EXTENSIONS = ['.png', '.jpg', '.jpeg', '.webp', '.gif', '.avif'];
const BG_KEYS = new Set(['homeBg', 'mainBg', 'footerBg']);

const toCssVar = (key: string) => `--${key.replace(/([A-Z])/g, '-$1').toLowerCase()}`;

/**
 * 背景图路径解析：写 `main-bg`（不带扩展名）即可，
 * 自动在 src/assets/imgs/ 下探测实际文件并补全扩展名。
 * 也兼容带扩展名或已带 url() 包装的旧写法。
 */
function resolveBgUrl(value: string): string {
  if (value.startsWith('url(')) return value;
  const clean = value.startsWith('/src/assets/imgs/')
    ? value.replace('/src/assets/imgs/', '')
    : value;
  if (IMG_EXTENSIONS.some((ext) => clean.endsWith(ext))) {
    return `url('/src/assets/imgs/${clean}')`;
  }
  for (const ext of IMG_EXTENSIONS) {
    if (fs.existsSync(path.join(IMG_DIR, clean + ext))) {
      return `url('/src/assets/imgs/${clean}${ext}')`;
    }
  }
  console.warn(`⚠️ [theme] 未找到背景图 src/assets/imgs/${clean}（已尝试 ${IMG_EXTENSIONS.join(' / ')}）`);
  return `url('/src/assets/imgs/${clean}')`;
}

const toCssBlock = (selector: string, vars: Record<string, unknown>) =>
  `${selector} {\n${Object.entries(vars)
    .map(([k, v]) => {
      if (typeof v !== 'string') return null;
      const value = BG_KEYS.has(k) ? resolveBgUrl(v) : v;
      return `  ${toCssVar(k)}: ${value};`;
    })
    .filter(Boolean)
    .join('\n')}\n}`;

const toCardRulesBlock = (styleId: string, cardCss: string) =>
  `html[data-card-style="${styleId}"] :not(html)[data-card], :not(html)[data-card="${styleId}"] {\n${cardCss}\n}`;

function buildThemeCss(): string {
  const blocks = [
    '/* 自动生成的主题变量文件，请勿直接修改 (源自 theme.config.ts) */',
    '',
    // 首帧兜底：样式应用前的默认变量（与各风格的默认值一致）
    toCssBlock(':root', defaultLight),
    '',
    toCssBlock(':root[data-theme="dark"], :root.dark-mode', defaultDark),
    '',
  ];

  for (const style of themeConfig.cardStyles) {
    // 风格自带 light：浅色模式生效（排除暗色上下文）
    blocks.push(
      toCssBlock(
        `html[data-card-style="${style.id}"]:not([data-theme="dark"]):not(.dark-mode)`,
        style.light,
      ),
      '',
    );

    // 风格自带 dark：暗色模式 = 本风格 light 的值 + dark 增量（没写的键沿用 light）
    const mergedDark = { ...style.light, ...style.dark };
    blocks.push(
      toCssBlock(
        `html[data-card-style="${style.id}"][data-theme="dark"], html[data-card-style="${style.id}"].dark-mode`,
        mergedDark,
      ),
      '',
    );

    blocks.push(toCardRulesBlock(style.id, style.cardCss), '');
  }

  return blocks.join('\n');
}

function writeThemeCss() {
  fs.writeFileSync(OUTPUT_PATH, buildThemeCss());
}

function generateThemeVars(): Plugin {
  return {
    name: 'generate-theme-vars',
    buildStart() {
      writeThemeCss();
      console.log('✨ 已生成 src/styles/theme-vars.css');
    },
  };
}

export default defineConfig({
  plugins: [react(), generateThemeVars()],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      }
    }
  }
});
