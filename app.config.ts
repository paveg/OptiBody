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
    rollupConfig: {
      external: ['better-sqlite3'],
    },
    // Nitro config for Cloudflare Pages
    nitro: {
      compatibilityDate: '2024-12-01',
      // Enable Node.js compatibility
      cloudflare: {
        wrangler: {
          compatibility_flags: ['nodejs_compat'],
        }
      }
    }
  },
  vite: {
    plugins: [
      // this is the plugin that enables path aliases
      viteTsConfigPaths({
        projects: ['./tsconfig.json'],
      }),
      tailwindcss(),
    ],
    build: {
      rollupOptions: {
        external: ['better-sqlite3'],
      },
    },
  },
})

export default config
