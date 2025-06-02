// Cloudflare Workers環境の型定義
export interface CloudflareGlobal {
	DB?: D1Database;
	// Wrangler開発環境用
	__env__?: Env;
}

// globalThisの型拡張
declare global {
	interface GlobalThis extends CloudflareGlobal {}
}
