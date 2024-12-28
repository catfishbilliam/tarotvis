import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  root: 'public', // Set 'public' as the root directory
  build: {
    outDir: '../dist', // Adjust output directory outside 'public'
    rollupOptions: {
      input: resolve(__dirname, 'public/index.html'), // Explicit entry point
    },
  },
});
