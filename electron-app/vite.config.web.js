import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

// Web-only build configuration (no Electron)
export default defineConfig({
  plugins: [react()],
  base: './',
  build: {
    outDir: 'dist-web',
    emptyOutDir: true,
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
      },
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          recharts: ['recharts'],
          lucide: ['lucide-react'],
        },
      },
    },
    // Copy assets directory to build output
    copyPublicDir: true,
    // Increase chunk size warning limit to avoid noise
    chunkSizeWarningLimit: 1000,
  },
  // Ensure assets are available
  publicDir: 'assets',
  define: {
    'process.env.IS_WEB': JSON.stringify(true),
  },
});
