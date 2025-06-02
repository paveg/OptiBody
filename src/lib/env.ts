import dotenv from "dotenv";

// Load environment variables
dotenv.config();

// Validate required environment variables in production
function validateEnv() {
	if (process.env.NODE_ENV === "production") {
		if (
			!process.env.SESSION_SECRET ||
			process.env.SESSION_SECRET === "dev-secret-change-in-production"
		) {
			throw new Error(
				"SESSION_SECRET must be set to a secure value in production",
			);
		}

		// SESSION_SECRETの最小要件をチェック
		if (process.env.SESSION_SECRET.length < 32) {
			throw new Error("SESSION_SECRET must be at least 32 characters long");
		}
	}
}

validateEnv();

export const env = {
	SESSION_SECRET:
		process.env.SESSION_SECRET || "dev-secret-change-in-production",
	NODE_ENV: process.env.NODE_ENV || "development",
	// Cloudflare関連の環境変数（開発時のみ使用）
	CLOUDFLARE_ACCOUNT_ID: process.env.CLOUDFLARE_ACCOUNT_ID,
	CLOUDFLARE_DATABASE_ID: process.env.CLOUDFLARE_DATABASE_ID,
	CLOUDFLARE_D1_TOKEN: process.env.CLOUDFLARE_D1_TOKEN,
} as const;

// 型安全性のための型定義
export type Env = typeof env;
