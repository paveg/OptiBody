import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import * as schema from "./database/schema";

// ローカル開発用SQLite接続
const sqlite = new Database("./local.db");
export const localDb = drizzle(sqlite, { schema });

// マイグレーションを実行する関数
export function runLocalMigrations() {
	try {
		// 手動でテーブルを作成
		sqlite.exec(`
      CREATE TABLE IF NOT EXISTS users (
        id text PRIMARY KEY NOT NULL,
        email text NOT NULL,
        username text NOT NULL,
        hashed_password text NOT NULL,
        created_at integer DEFAULT (unixepoch()) NOT NULL,
        updated_at integer DEFAULT (unixepoch()) NOT NULL
      );
      
      CREATE UNIQUE INDEX IF NOT EXISTS users_email_unique ON users (email);
      CREATE UNIQUE INDEX IF NOT EXISTS users_username_unique ON users (username);
      
      CREATE TABLE IF NOT EXISTS sessions (
        id text PRIMARY KEY NOT NULL,
        user_id text NOT NULL,
        expires_at integer NOT NULL,
        FOREIGN KEY (user_id) REFERENCES users(id) ON UPDATE no action ON DELETE cascade
      );
      
      CREATE TABLE IF NOT EXISTS user_metrics (
        id text PRIMARY KEY NOT NULL,
        user_id text NOT NULL,
        height real,
        weight real,
        age integer,
        gender text,
        activity_level text,
        body_fat_percentage real,
        created_at integer DEFAULT (unixepoch()) NOT NULL,
        FOREIGN KEY (user_id) REFERENCES users(id) ON UPDATE no action ON DELETE cascade
      );
    `);

		console.log("Local database initialized successfully");
	} catch (error) {
		console.error("Failed to initialize local database:", error);
	}
}

export default localDb;
