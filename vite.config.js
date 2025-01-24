import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
    rollupOptions: {
      input: {
        index: resolve(__dirname, 'index.html'),
        background: resolve(__dirname, 'public/background.js')
      },
      output: {
        entryFileNames: '[name].js',
        assetFileNames: 'assets/[name].[ext]',
        dir: 'dist'
      }
    },
    emptyOutDir: true
  },
  publicDir: 'public'
});
