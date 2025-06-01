import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './database/schema';

// 環境変数からデータベースURLを取得
const DATABASE_URL = process.env.DATABASE_URL || 'postgresql://optibody:optibody_dev_password@localhost:5432/optibody';

// PostgreSQL接続の作成
const client = postgres(DATABASE_URL);

// Drizzle ORMインスタンスの作成
export const db = drizzle(client, { schema });

export default db;