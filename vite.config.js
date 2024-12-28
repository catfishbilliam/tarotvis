import { defineConfig } from 'vite';

export default defineConfig({
  root: 'public', // Set 'public' as the root directory
  build: {
    outDir: '../dist', // Adjust output directory to be outside 'public'
    rollupOptions: {
      input: 'index.html', // Entry point inside 'public'
    },
  },
});
