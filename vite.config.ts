import { defineConfig, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import fs from 'node:fs';
import { buildThemeCss, buildThemeScript } from './src/theme/build';

function generateTheme(): Plugin {
  return {
    name: 'generate-theme',
    buildStart() {
      const path = './src/styles/theme-vars.css';
      const css = buildThemeCss();
      if (!fs.existsSync(path) || fs.readFileSync(path, 'utf8') !== css) fs.writeFileSync(path, css);
    },
    transformIndexHtml() {
      return [{ tag: 'script', children: buildThemeScript(), injectTo: 'head' }];
    },
  };
}

function reactDevtools(): Plugin {
  return {
    name: 'react-devtools',
    apply: 'serve',
    transformIndexHtml() {
      return [{ tag: 'script', attrs: { src: 'http://localhost:8097' }, injectTo: 'head-prepend' }];
    },
  };
}

export default defineConfig({
  plugins: [reactDevtools(), react(), generateTheme()],
  server: {
    proxy: {
      '/api': { target: 'http://localhost:3001', changeOrigin: true },
    },
  },
});
