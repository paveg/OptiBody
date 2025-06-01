import { drizzle } from "drizzle-orm/d1";
import { localDb } from "./database-local";
import * as schema from "./database/schema";

// Cloudflare D1 binding取得
function getD1Database() {
	// Cloudflare Worker環境では、context.cloudflareから取得
	if (typeof globalThis !== "undefined" && globalThis.DB) {
		return globalThis.DB;
	}

	// 開発環境では、ローカルSQLiteを使用
	return null;
}

// Drizzle ORMインスタンスの作成
export function createDb(d1Database?: D1Database) {
	if (d1Database) {
		return drizzle(d1Database, { schema });
	}

	const d1 = getD1Database();
	if (d1) {
		return drizzle(d1, { schema });
	}

	// ローカル開発環境では、SQLiteを使用
	return localDb;
}

// デフォルトのDBインスタンス（ローカル開発用）
export const db = createDb();

export default db;
