import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';
import { readFileSync } from 'fs';

export default defineConfig({
  plugins: [
    react(),
    cssAsRaw(),
    {
      name: 'raw-css-extension',
      transform(code, id) {
        if (id.endsWith('.css?raw')) {
          return `export default ${JSON.stringify(code)};`;
        }
      }
    }
  ],
  build: {
    outDir: 'dist',
    lib: {
      entry: resolve(__dirname, 'src/components/autofill/Autofill.jsx'),
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
      },
      plugins: []
    }
  },
  define: {
    'process.env.NODE_ENV': JSON.stringify('production'),
    global: 'window'
  },
  css: {
    modules: {
      localsConvention: 'camelCase',
    },
    preprocessorOptions: {
      scss: {
        additionalData: `@import "./src/App.css";`,
      }
    }
  },
  resolve: {
    alias: {
      '@picocss/pico/css/pico.css': resolve(
        __dirname,
        'node_modules/@picocss/pico/css/pico.css' // Exact v2 path
      )
    }
  }
});

export function cssAsRaw() {
  return {
    name: 'css-as-raw',
    resolveId(source) {
      if (source.endsWith('.css?raw')) return source;
    },
    load(id) {
      if (id.endsWith('.css?raw')) {
        const path = id.replace('/?raw', '');
        return `export default ${JSON.stringify(readFileSync(path, 'utf-8'))}`;
      }
    }
  };
}