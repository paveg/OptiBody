import { drizzle } from "drizzle-orm/d1";
import type { DrizzleD1Database } from "drizzle-orm/d1";
import * as schema from "./database/schema";

// Cloudflare D1 binding取得
function getD1Database() {
	// Wrangler開発環境では、__env__から取得
	if (typeof globalThis !== "undefined" && globalThis.__env__?.DB) {
		return globalThis.__env__.DB;
	}
	// Cloudflare Worker環境では、globalThisから取得
	if (typeof globalThis !== "undefined" && globalThis.DB) {
		return globalThis.DB;
	}

	return null;
}

// Drizzle ORMインスタンスの作成
export function createDb(
	d1Database?: D1Database,
): DrizzleD1Database<typeof schema> {
	if (d1Database) {
		return drizzle(d1Database, { schema });
	}

	const d1 = getD1Database();
	if (d1) {
		return drizzle(d1, { schema });
	}

	// D1が利用できない場合はエラー
	throw new Error("D1 database connection required");
}

// デフォルトのDBインスタンス（本番環境ではnullになる可能性がある）
export const db = (() => {
	try {
		return createDb();
	} catch {
		// ビルド時にはD1が利用できないため、nullを返す
		// これは開発時のみ使用され、本番環境では常にD1が提供される
		return {} as DrizzleD1Database<typeof schema>;
	}
})();

export default db;
