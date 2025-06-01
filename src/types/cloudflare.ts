// Cloudflare Workers環境の型定義
export interface CloudflareGlobal {
	DB?: D1Database;
}

// globalThisの型拡張
declare global {
	interface GlobalThis extends CloudflareGlobal {}
}
