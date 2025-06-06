import { drizzle } from "drizzle-orm/d1";
import type { DrizzleD1Database } from "drizzle-orm/d1";
import * as schema from "./database/schema";

// Cloudflare D1 binding取得
function getD1Database(): D1Database | null {
	// Wrangler開発環境では、__env__から取得
	if (typeof globalThis !== "undefined" && globalThis.__env__?.DB) {
		return globalThis.__env__.DB;
	}

	// Cloudflare Worker環境では、globalThis.DBから直接取得
	if (typeof globalThis !== "undefined" && globalThis.DB) {
		return globalThis.DB;
	}

	return null;
}

// Drizzle ORMインスタンスの作成（常にD1Databaseを要求）
export function createDatabase(
	d1Database: D1Database,
): DrizzleD1Database<typeof schema> {
	return drizzle(d1Database, { schema });
}

// 安全なDB取得関数（D1が利用できない場合はnullを返す）
export function getDatabaseInstance(): DrizzleD1Database<typeof schema> | null {
	const d1 = getD1Database();
	if (!d1) {
		return null;
	}
	return createDatabase(d1);
}

// 開発用のDB取得関数（D1が利用できない場合はエラーを投げる）
export function requireDatabase(): DrizzleD1Database<typeof schema> {
	const db = getDatabaseInstance();
	if (!db) {
		throw new Error(
			"D1 database not available. Ensure D1 binding is properly configured.",
		);
	}
	return db;
}
