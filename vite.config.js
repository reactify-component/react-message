import { defineConfig } from 'vite'
import tsconfigPaths from 'vite-tsconfig-paths'

const { resolve } = require('path')

export default defineConfig({
  base: '',
  plugins: [
    tsconfigPaths({
      projects: [
        resolve(__dirname, './example/tsconfig.json'),
        resolve(__dirname, './tsconfig.json'),
      ],
    }),
  ],
  root: resolve(__dirname, './example'),
  optimizeDeps: {
    exclude: ['react-dom/client'],
  },
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, './example/index.html'),
      },
    },
  },
})
