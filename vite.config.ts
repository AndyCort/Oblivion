import { defineConfig, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import fs from 'node:fs';
import path from 'node:path';
import { buildThemeCss, buildThemeScript } from './src/theme/build';
import { siteConfig } from './src/config/site';

function generateTheme(): Plugin {
  return {
    name: 'generate-theme',
    configResolved(config) {
      // 从 Vite 配置依赖中移除主题源码，避免 Vite 误判其为配置文件而频繁重启开发服务器并强制整页刷新
      const deps = (config as unknown as { configFileDependencies?: string[] }).configFileDependencies;
      if (Array.isArray(deps)) {
        const filtered = deps.filter(
          (file) => !file.includes('/src/config/theme') && !file.includes('/src/theme/')
        );
        deps.length = 0;
        deps.push(...filtered);
      }
    },
    buildStart() {
      const targetPath = './src/styles/theme-vars.css';
      const css = buildThemeCss();
      if (!fs.existsSync(targetPath) || fs.readFileSync(targetPath, 'utf8') !== css) {
        fs.writeFileSync(targetPath, css);
      }
    },
    async handleHotUpdate({ file, server }) {
      if (file.includes('/src/config/theme') || file.includes('/src/theme/')) {
        try {
          // 通过 Vite 的 ssrLoadModule 重新载入最新修改的配置与编译逻辑，突破 Node ESM 静态缓存
          const mod = await server.ssrLoadModule('/src/theme/build.ts');
          const targetPath = './src/styles/theme-vars.css';
          const css = mod.buildThemeCss();
          fs.writeFileSync(targetPath, css);

          // 仅向浏览器推送 CSS 样式模块热更新，绝不刷新页面！
          const stylePath = path.resolve('./src/styles/style.css');
          const varsPath = path.resolve(targetPath);
          const mods = new Set<any>();

          const varsMods = server.moduleGraph.getModulesByFile(varsPath);
          if (varsMods) varsMods.forEach(m => mods.add(m));

          const styleMods = server.moduleGraph.getModulesByFile(stylePath);
          if (styleMods) styleMods.forEach(m => mods.add(m));

          if (mods.size === 0) {
            server.moduleGraph.urlToModuleMap.forEach(m => {
              if (m.file && (m.file.endsWith('style.css') || m.file.endsWith('theme-vars.css'))) {
                mods.add(m);
              }
            });
          }

          mods.forEach(m => {
            server.moduleGraph.invalidateModule(m);
          });

          // 返回样式模块列表给 Vite，Vite 会通过 CSS HMR 在浏览器中静默无感替换 <style>，保持页面和滚动状态！
          return Array.from(mods);
        } catch (e) {
          console.error('[generateTheme] HMR error:', e);
        }
      }
    },
    transformIndexHtml(html: string) {
      const transformedHtml = html
        .replace(/%VITE_SITE_NAME%/g, siteConfig.name.zh)
        .replace(/%VITE_SITE_DESCRIPTION%/g, siteConfig.description.zh)
        .replace(/<title>.*?<\/title>/, `<title>${siteConfig.name.zh}</title>`)
        .replace(/(<meta\s+name="description"\s+content=")[^"]*(")/, `$1${siteConfig.description.zh}$2`);
      return {
        html: transformedHtml,
        tags: [{ tag: 'script', children: buildThemeScript(), injectTo: 'head' }],
      };
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
  plugins: [
    reactDevtools(),
    react({
      babel: {
        plugins: [
          [
            'babel-plugin-styled-components',
            {
              displayName: true,
              fileName: false,
            },
          ],
        ],
      },
    }),
    generateTheme(),
  ],
  server: {
    proxy: {
      '/api': { target: 'http://localhost:3001', changeOrigin: true },
    },
  },
});
