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
    },
  },
  define: {
    'process.env.IS_WEB': JSON.stringify(true),
  },
});
