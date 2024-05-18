import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import prismjsPlugin from 'vite-plugin-prismjs'
import Icons from 'unplugin-icons/vite'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    Icons({ compiler: 'vue3', autoInstall: true }),
    prismjsPlugin({
      languages: ['java'],
      plugins: ['line-numbers', 'copy-to-clipboard'],
      theme: 'okaidia',
      css: true,
    })
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  }
})
