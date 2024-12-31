import { defineConfig } from 'vite';

export default defineConfig({
  server: {
    port: 3003,
  },
  build: {
    outDir: 'dist', // Output directory
    emptyOutDir: true, // Clear dist folder before build
    rollupOptions: {
      input: 'index.html', // Entry point for the app
    },
  },
  publicDir: 'public', // Copy everything from public/

  // Ensure proper handling of static assets
  assetsInclude: [
    '**/*.png',       // Include images like background.png
    '**/*.json',      // Include JSON files like tarot-descriptions.json
    '**/*.jpg',       // If JPGs are used later
    '**/*.jpeg',      // Include JPEG formats
    '**/*.webp',      // For web-optimized images
    '**/*.svg',       // SVG support if needed
  ],
});
