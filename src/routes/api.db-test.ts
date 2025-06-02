import { createAPIFileRoute } from "@tanstack/react-start/api";
import type { CloudflareGlobal } from "~/types/cloudflare";
import { createDb } from "~/lib/database";

export const APIRoute = createAPIFileRoute("/api/db-test")({
	GET: async ({ request, context }) => {
		try {
			// 様々な方法でD1データベースを探す
			const global = globalThis;
			const ctx = context;
			
			let dbResult = null;
			let dbSource = "none";
			let error = null;
			let d1Database = null;
			
			// 方法1: globalThis.__env__?.DB
			if (global.__env__?.DB) {
				d1Database = global.__env__.DB;
				dbSource = "globalThis.__env__.DB";
			}
			// 方法2: globalThis.DB
			else if (global.DB) {
				d1Database = global.DB;
				dbSource = "globalThis.DB";
			}
			// 方法3: globalThis.env?.DB
			else if (global.env?.DB) {
				d1Database = global.env.DB;
				dbSource = "globalThis.env.DB";
			}
			// 方法4: context.env?.DB
			else if (ctx?.env?.DB) {
				d1Database = ctx.env.DB;
				dbSource = "context.env.DB";
			}
			// 方法5: context.cloudflare?.env?.DB
			else if (ctx?.cloudflare?.env?.DB) {
				d1Database = ctx.cloudflare.env.DB;
				dbSource = "context.cloudflare.env.DB";
			}
			
			if (d1Database) {
				try {
					// 直接D1を使ってテスト
					dbResult = await d1Database.prepare("SELECT 1 as test").first();
					
					// D1が正常に動作している場合
					if (dbResult) {
						return new Response(JSON.stringify({
							status: "ok",
							timestamp: new Date().toISOString(),
							dbTest: {
								direct: {
									result: dbResult,
									source: dbSource
								},
								available: true,
								note: "Direct D1 access works. Drizzle ORM integration temporarily disabled."
							}
						}), {
							status: 200,
							headers: { "Content-Type": "application/json" }
						});
					}
				} catch (e) {
					error = e instanceof Error ? e.message : String(e);
					
					// エラーの詳細情報を取得
					if (e instanceof Error && e.stack) {
						error = `${e.message}\nStack: ${e.stack}`;
					}
				}
			}

			// デバッグ情報を詳細に
			const allGlobalKeys = Object.keys(globalThis);
			const envRelatedKeys = allGlobalKeys.filter(k => 
				k.toLowerCase().includes('env') || 
				k.includes('DB') || 
				k.includes('d1') ||
				k.includes('cloudflare') ||
				k.includes('binding')
			);

			return new Response(JSON.stringify({
				status: "error",
				timestamp: new Date().toISOString(),
				dbTest: {
					available: false,
					error: error || "D1 database not available",
					debugging: {
						globalDB: !!global.DB,
						globalEnvDB: !!global.env?.DB,
						global__env__DB: !!global.__env__?.DB,
						contextEnvDB: !!ctx?.env?.DB,
						contextCloudflareEnvDB: !!ctx?.cloudflare?.env?.DB,
						envRelatedGlobalKeys: envRelatedKeys,
						__env__Keys: global.__env__ ? Object.keys(global.__env__) : [],
						contextKeys: ctx ? Object.keys(ctx) : [],
						contextEnvKeys: ctx?.env ? Object.keys(ctx.env) : [],
						requestHeaders: Object.fromEntries(request.headers.entries())
					}
				}
			}), {
				status: 503,
				headers: { "Content-Type": "application/json" }
			});
		} catch (error) {
			return new Response(JSON.stringify({
				status: "error",
				error: error instanceof Error ? error.message : String(error),
				stack: error instanceof Error ? error.stack : undefined
			}), {
				status: 500,
				headers: { "Content-Type": "application/json" }
			});
		}
	},
});