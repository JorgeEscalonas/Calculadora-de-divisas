import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    vueDevTools(),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    },
  },
  server: {
    proxy: {
      '/api/rates': {
        target: 'https://scraping-bcv.vercel.app',
        changeOrigin: true,
      },
      '/binance-api': {
        target: 'https://p2p.binance.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/binance-api/, ''),
        headers: {
          'Origin': 'https://p2p.binance.com',
          'Referer': 'https://p2p.binance.com/'
        }
      }
    }
  }
})
