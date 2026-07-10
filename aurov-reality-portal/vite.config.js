import { defineConfig, transformWithEsbuild } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

function jsAsJsx() {
  return {
    name: 'aurov-js-as-jsx',
    enforce: 'pre',
    async transform(code, id) {
      if (/\/src\/.*\.js$/.test(id)) {
        return transformWithEsbuild(code, id, {
          loader: 'jsx',
          jsx: 'automatic',
        });
      }
      return null;
    },
  };
}

export default defineConfig({
  plugins: [jsAsJsx(), react({ include: /\.(js|jsx|ts|tsx)$/ }), tailwindcss()],
  optimizeDeps: {
    esbuildOptions: {
      loader: {
        '.js': 'jsx',
      },
    },
  },
});
