import type { Config } from 'drizzle-kit';

export default {
  schema: './src/lib/database/schema.ts',
  out: './drizzle',
  driver: 'pg',
  dbCredentials: {
    connectionString: process.env.DATABASE_URL || 'postgresql://optibody:optibody_dev_password@localhost:5432/optibody',
  },
  verbose: true,
  strict: true,
} satisfies Config;