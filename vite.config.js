import { defineConfig } from 'vite';

// Vite Configuration
export default defineConfig({
  base: './', // Ensures relative paths for Netlify deployment
  build: {
    outDir: 'dist', // Output directory for the build
    emptyOutDir: true, // Clean the output directory before building
  },
  server: {
    port: 3000, // Local development server port
  },
  assetsInclude: ['**/*.png', '**/*.jpg', '**/*.json'], // Ensure assets like images and JSON files are included
  resolve: {
    alias: {
      '@': '/src', // Allows shorthand imports if needed later
    },
  },
});
