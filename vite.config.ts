import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'Fetchios',
      fileName: 'fetchios',
      formats: ['es', 'cjs'],
    },
    rollupOptions: {
      external: [],
      output: {
        globals: {},
      },
    },
    sourcemap: true,
    minify: false,
  },
  test: {
    globals: true,
    environment: 'jsdom',
  },
}); 