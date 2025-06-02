import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  schema: './src/lib/database/schema.ts',
  out: './drizzle',
  dialect: 'sqlite',
  dbCredentials: {
    url: process.env.LOCAL_D1_DATABASE_URL || './.wrangler/state/v3/d1/miniflare-D1DatabaseObject/a0b16d106b6ff487bd9424b1de9c40b36c21120825d7127cd21755b82d50578c.sqlite',
  },
  verbose: true,
  strict: true,
});