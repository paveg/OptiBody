import { defineConfig } from 'drizzle-kit';
import { config } from 'dotenv';

config();

// production/previewかどうかを環境変数で判定
const isProduction = process.env.NODE_ENV === 'production' || 
                    process.env.CLOUDFLARE_ACCOUNT_ID !== undefined;

export default defineConfig({
  schema: './src/lib/database/schema.ts',
  out: './drizzle',
  dialect: 'sqlite',
  ...(isProduction ? {
    // production/preview: リモートD1
    driver: 'd1-http',
    dbCredentials: {
      accountId: process.env.CLOUDFLARE_ACCOUNT_ID!,
      databaseId: process.env.CLOUDFLARE_DATABASE_ID!,
      token: process.env.CLOUDFLARE_D1_TOKEN!,
    },
  } : {
    // ローカル開発: ローカルD1ファイル
    dbCredentials: {
      url: './.wrangler/state/v3/d1/miniflare-D1DatabaseObject/a0b16d106b6ff487bd9424b1de9c40b36c21120825d7127cd21755b82d50578c.sqlite',
    },
  }),
  verbose: true,
  strict: true,
});