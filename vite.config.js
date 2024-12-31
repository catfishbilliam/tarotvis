import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  root: 'public', // Set 'public' as the root directory
  server: {
    port: 3003,
    proxy: {
      '/generate-tarot-story': {
        target: 'http://localhost:3003',
        changeOrigin: true,
        secure: false,
      },
    },
  },
  build: {
    outDir: '../dist', // Output directory
    emptyOutDir: true,
    rollupOptions: {
      input: resolve(__dirname, 'public/index.html'),
    },
    assetsDir: '', // Keep assets at the root level in dist
  },
});
