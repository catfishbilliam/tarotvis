import { defineConfig } from 'vite';

export default defineConfig({
  server: {
    port: 3003,
  },
  build: {
    outDir: 'dist', // Output directory
    emptyOutDir: true, // Clear dist folder before build
  },
  publicDir: 'public', // Copy everything from public/
});
