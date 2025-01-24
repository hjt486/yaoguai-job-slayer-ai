import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
    lib: {
      entry: resolve(__dirname, 'src/components/autofill/AutoFill.jsx'),
      name: 'Content',
      formats: ['iife']
    },
    rollupOptions: {
      output: {
        entryFileNames: 'content.js',
        extend: true,
        globals: {
          'react': 'React',
          'react-dom': 'ReactDOM',
          'react-dom/client': 'ReactDOM'
        }
      }
    }
  },
  define: {
    'process.env.NODE_ENV': JSON.stringify('production'),
    global: 'window'
  }
});