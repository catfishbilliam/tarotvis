import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  root: 'public', // Set 'public' as the root directory
  server: {
    port: 3000,
    proxy: {
      '/generate-tarot-story': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        secure: false,
      },
    },
  },
  build: {
    outDir: '../dist', // Output directory outside the project root
    emptyOutDir: true, // Force emptying the output directory
    rollupOptions: {
      input: resolve(__dirname, 'public/index.html'), // Entry point
    },
  },
});
