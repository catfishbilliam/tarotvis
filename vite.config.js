import { defineConfig } from 'vite';

export default defineConfig({
  base: './', // Relative paths for Netlify
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    assetsDir: 'assets', // Ensure assets folder
  },
  publicDir: 'public', // Serve static assets
  server: {
    port: 3000,
  },
});
