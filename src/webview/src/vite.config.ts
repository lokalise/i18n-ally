import { resolve } from 'path'
import { defineConfig } from 'vite'
import Vue from '@vitejs/plugin-vue'
import ViteIcons, { ViteIconsResolver } from 'vite-plugin-icons'
import ViteComponents from 'vite-plugin-components'
import { viteSingleFile } from 'vite-plugin-singlefile'

export default defineConfig({
  plugins: [
    Vue(),
    ViteComponents({
      customComponentResolvers: [
        ViteIconsResolver({
          componentPrefix: '',
        }),
      ],
    }),
    ViteIcons(),
    viteSingleFile(),
  ],
  build: {
    outDir: resolve(__dirname, '../../../dist/editor'),
    emptyOutDir: true,
  },
})
