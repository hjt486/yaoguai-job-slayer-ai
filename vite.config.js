import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
    chunkSizeWarningLimit: 1500,
    rollupOptions: {
      input: {
        index: resolve(__dirname, 'index.html'),
        background: resolve(__dirname, 'public/background.js')
      },
      output: {
        entryFileNames: '[name].js',
        assetFileNames: 'assets/[name].[ext]',
        dir: 'dist',
        manualChunks: (id) => {
          // React core libraries
          if (id.includes('node_modules/react/') || 
              id.includes('node_modules/react-dom/')) {
            return 'vendor-react';
          }
          // PDF related libraries
          if (id.includes('node_modules/pdfjs-dist/')) {
            return 'vendor-pdfjs';
          }
          if (id.includes('node_modules/jspdf/')) {
            return 'vendor-jspdf';
          }
          // Utilities
          if (id.includes('node_modules/moment/')) {
            return 'vendor-utils';
          }
          // UI Components
          if (id.includes('components/')) {
            return 'components';
          }
        }
      },
      external: ['html2canvas', 'canvg', 'dompurify']
    },
    emptyOutDir: true
  },
  publicDir: 'public'
});
