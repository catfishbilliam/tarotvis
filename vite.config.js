import { defineConfig } from 'vite';

export default defineConfig({
  base: './', // Relative paths for Netlify
  build: {
    outDir: 'dist', // Output directory for build
    emptyOutDir: true, // Clear output directory before build
    assetsDir: 'assets', // Ensure assets go in 'assets' folder
  },
  publicDir: 'public', // Serve static assets like images and JSON files
  server: {
    port: 3000, // Local dev server port
  },
  resolve: {
    alias: {
      '@': '/src', // Optional: Use '@' as alias for 'src/' folder
    },
  },
});
