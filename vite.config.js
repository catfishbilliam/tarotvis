import { defineConfig } from 'vite';

export default defineConfig({
  base: './', // Relative paths for Netlify deployment
  build: {
    outDir: 'dist', // Output directory
    emptyOutDir: true, // Clear dist folder before build
    assetsDir: 'assets', // Place assets in the "assets" folder
  },
  server: {
    port: 3000, // Local development port
  },
  publicDir: 'public', // Ensure public folder is included
});
