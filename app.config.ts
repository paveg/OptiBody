import { defineConfig } from '@tanstack/react-start/config'
import viteTsConfigPaths from 'vite-tsconfig-paths'
import tailwindcss from '@tailwindcss/vite'
import { cloudflare } from 'unenv'

const config = defineConfig({
  tsr: {
    appDirectory: 'src',
  },
  server: {
    preset: 'cloudflare-pages',
    unenv: cloudflare,
  },
  vite: {
    plugins: [
      // this is the plugin that enables path aliases
      viteTsConfigPaths({
        projects: ['./tsconfig.json'],
      }),
      tailwindcss(),
    ],
  },
})

export default config
