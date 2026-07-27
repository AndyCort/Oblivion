// @ts-check
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';

import remarkSupersub from 'remark-supersub';
import remarkFlexibleMarkers from 'remark-flexible-markers';
import remarkGfm from 'remark-gfm';

// https://astro.build/config
export default defineConfig({
  integrations: [react()],
  markdown: {
    gfm: false,
    remarkPlugins: [[remarkGfm, { singleTilde: false }], remarkSupersub, remarkFlexibleMarkers],
  },
  vite: {
    server: {
      proxy: {
        '/api': {
          target: 'http://localhost:3001',
          changeOrigin: true,
        }
      }
    }
  }
});
