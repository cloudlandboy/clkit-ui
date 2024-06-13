import { fileURLToPath, URL } from 'node:url'

import { version } from "./package.json";
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import prismjsPlugin from 'vite-plugin-prismjs'
import Icons from 'unplugin-icons/vite'
import { viteStaticCopy } from 'vite-plugin-static-copy'

export default defineConfig({
  plugins: [
    vue(),
    Icons({ compiler: 'vue3', autoInstall: true }),
    prismjsPlugin({
      languages: ['java', 'json'],
      plugins: ['line-numbers', 'copy-to-clipboard'],
      theme: 'okaidia',
      css: true,
    }),
    viteStaticCopy({
      targets: [
        {
          src: 'node_modules/tinymce',
          dest: 'lib'
        },
        {
          src: 'node_modules/tinymce-i18n/langs7/*',
          dest: 'lib/tinymce/langs'
        }
      ]
    })
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  define: {
    __CLKIT_VERSION__: JSON.stringify(version)
  }
})
