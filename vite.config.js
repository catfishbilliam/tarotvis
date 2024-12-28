import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  root: 'public', // Set 'public' as the root directory
  build: {
    outDir: '../dist', // Output directory outside 'public'
    rollupOptions: {
      input: resolve(__dirname, 'public/index.html'), // Explicit entry point
    },
  },
  server: {
    proxy: {
      '/generate-tarot-story': 'http://localhost:3000', // Proxy API requests to Express server
    },
  },
});
