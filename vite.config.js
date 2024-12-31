import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  root: 'public', // Set 'public' as the root directory
  server: {
    port: 3003, // Changed the port from 3000 to 3001
    proxy: {
      '/generate-tarot-story': {
        target: 'http://localhost:3003', // Match Express server port
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
