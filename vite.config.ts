import { defineConfig } from 'vite';
import { resolve } from 'path';
import dts from 'vite-plugin-dts';

export default defineConfig({
  plugins: [
    dts({
      include: ['src'],
      exclude: ['**/*.spec.ts'],
      outDir: 'dist'
    })
  ],
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),  // ← точка входа index.ts
      name: 'Firebird',
      formats: ['es', 'cjs'],
      fileName: (format) => format === 'es' ? 'index.js' : 'index.cjs'
    },
    rollupOptions: {
      external: ['three'],  // three не включаем в сборку
      output: {
        globals: {
          three: 'THREE'
        },
        // Сохраняем структуру экспортов
        preserveModules: false
      }
    },
    sourcemap: true,
    emptyOutDir: true
  }
});
