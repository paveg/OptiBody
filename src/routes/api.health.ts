import { getDatabaseInstance } from "@/lib/database";
import { createAPIFileRoute } from "@tanstack/react-start/api";

export const APIRoute = createAPIFileRoute("/api/health")({
	GET: async ({ request, context }) => {
		try {
			// 基本的な動作確認
			const global = globalThis as Record<string, unknown> & {
				DB?: D1Database;
				__env__?: { DB?: D1Database };
			};

			const env = {
				NODE_ENV: process.env.NODE_ENV,
				SESSION_SECRET_EXISTS: !!process.env.SESSION_SECRET,
				// グローバルからのDB
				GLOBAL_DB_EXISTS: !!global.DB,
				// WranglerのenvからのDB
				ENV_DB_EXISTS: !!global.__env__?.DB,
				// 利用可能なグローバル変数を確認
				AVAILABLE_GLOBALS: Object.keys(global).filter(
					(key) =>
						key.includes("DB") ||
						key.includes("database") ||
						key.includes("env"),
				),
				// Cloudflare関連のグローバル変数
				CLOUDFLARE_GLOBALS: Object.keys(global).filter(
					(key) =>
						key.toLowerCase().includes("cloudflare") ||
						key.toLowerCase().includes("cf"),
				),
			};

			// データベース接続のテスト
			let dbTest = null;
			try {
				const db = getDatabaseInstance();
				if (db) {
					// 使用可能なD1インスタンスを取得
					const d1Instance = global.__env__?.DB || global.DB;
					if (d1Instance) {
						// 単純なクエリを実行してDBアクセスを確認
						const result = await d1Instance.prepare("SELECT 1 as test").first();

						// テーブル存在確認
						const tablesResult = await d1Instance
							.prepare(
								"SELECT name FROM sqlite_master WHERE type='table' AND name IN ('users', 'sessions', 'user_metrics')",
							)
							.all();

						dbTest = {
							connection: true,
							query_success: !!result,
							result: result,
							d1_source: global.__env__?.DB ? "__env__.DB" : "globalThis.DB",
							tables: tablesResult.results.map((t: { name: string }) => t.name),
							tables_count: tablesResult.results.length,
						};
					} else {
						dbTest = {
							connection: false,
							error:
								"D1 instance not found in both __env__.DB and globalThis.DB",
						};
					}
				} else {
					dbTest = {
						connection: false,
						error: "Drizzle database instance not available",
					};
				}
			} catch (error) {
				dbTest = {
					connection: false,
					error: error instanceof Error ? error.message : String(error),
				};
			}

			return new Response(
				JSON.stringify({
					status: "ok",
					timestamp: new Date().toISOString(),
					environment: env,
					database: dbTest,
				}),
				{
					status: 200,
					headers: { "Content-Type": "application/json" },
				},
			);
		} catch (error) {
			return new Response(
				JSON.stringify({
					status: "error",
					error: error instanceof Error ? error.message : String(error),
					stack: error instanceof Error ? error.stack : undefined,
				}),
				{
					status: 500,
					headers: { "Content-Type": "application/json" },
				},
			);
		}
	},
});
