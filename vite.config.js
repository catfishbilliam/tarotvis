import { defineConfig } from 'vite';

export default defineConfig({
  base: './', // Relative paths for Netlify deployment
  build: {
    outDir: 'dist', // Output directory
    emptyOutDir: true, // Clear directory before building
  },
  server: {
    port: 3000, // Development server
  },
  assetsInclude: ['**/*.png', '**/*.json'], // Ensure static assets are bundled
});
