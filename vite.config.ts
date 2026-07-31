import { defineConfig, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import fs from 'node:fs';
import { themeConfig } from './src/config/theme.config';

const OUTPUT_PATH = './src/styles/theme-vars.css';

const toCssVar = (key: string) => `--${key.replace(/([A-Z])/g, '-$1').toLowerCase()}`;

const toCssBlock = (selector: string, vars: Record<string, unknown>) =>
  `${selector} {\n${Object.entries(vars)
    .map(([k, v]) => (typeof v === 'string' ? `  ${toCssVar(k)}: ${v};` : null))
    .filter(Boolean)
    .join('\n')}\n}`;

const toCardRulesBlock = (styleId: string, cardCss: string) =>
  `html[data-card-style="${styleId}"] :not(html)[data-card], :not(html)[data-card="${styleId}"] {\n${cardCss}\n}`;

function buildThemeCss(): string {
  const blocks = [
    '/* 自动生成的主题变量文件，请勿直接修改 (源自 theme.config.ts) */',
    '',
    toCssBlock(':root', themeConfig.light),
    '',
    toCssBlock(':root[data-theme="dark"], :root.dark-mode', themeConfig.dark),
    '',
  ];

  for (const style of themeConfig.cardStyles) {
    const vars = { mainColor: style.mainColor, homeBg: style.homeBg, footerBg: style.footerBg };
    blocks.push(
      toCssBlock(`html[data-card-style="${style.id}"]`, vars),
      '',
      toCardRulesBlock(style.id, style.cardCss),
      '',
    );
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
