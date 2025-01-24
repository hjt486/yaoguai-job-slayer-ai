import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      input: {
        popup: 'index.html',
        content: 'src/content.jsx',
        background: 'public/background.js',
    },
      output: {
        entryFileNames: '[name].js',
        assetFileNames: 'assets/[name].[ext]', // Output assets
      }
    }
  },
  publicDir: 'public'
});
