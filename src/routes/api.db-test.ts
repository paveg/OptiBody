import { createAPIFileRoute } from "@tanstack/react-start/api";
import type { CloudflareGlobal } from "~/types/cloudflare";
import { createDb } from "~/lib/database";

export const APIRoute = createAPIFileRoute("/api/db-test")({
	GET: async ({ request, context }) => {
		try {
			// 様々な方法でD1データベースを探す
			const global = globalThis as any;
			const ctx = context as any;
			
			let dbResult = null;
			let dbSource = "none";
			let error = null;
			let d1Database = null;
			
			// 方法1: globalThis.DB
			if (global.DB) {
				d1Database = global.DB;
				dbSource = "globalThis.DB";
			}
			// 方法2: globalThis.env?.DB
			else if (global.env?.DB) {
				d1Database = global.env.DB;
				dbSource = "globalThis.env.DB";
			}
			// 方法3: context.env?.DB
			else if (ctx?.env?.DB) {
				d1Database = ctx.env.DB;
				dbSource = "context.env.DB";
			}
			// 方法4: context.cloudflare?.env?.DB
			else if (ctx?.cloudflare?.env?.DB) {
				d1Database = ctx.cloudflare.env.DB;
				dbSource = "context.cloudflare.env.DB";
			}
			
			if (d1Database) {
				try {
					// 直接D1を使ってテスト
					dbResult = await d1Database.prepare("SELECT 1 as test").first();
					
					// Drizzle経由でもテスト
					const db = createDb(d1Database);
					const drizzleResult = await db.run({ sql: "SELECT 2 as drizzle_test" });
					
					return new Response(JSON.stringify({
						status: "ok",
						timestamp: new Date().toISOString(),
						dbTest: {
							direct: {
								result: dbResult,
								source: dbSource
							},
							drizzle: {
								result: drizzleResult,
								source: `createDb(${dbSource})`
							},
							available: true
						}
					}), {
						status: 200,
						headers: { "Content-Type": "application/json" }
					});
				} catch (e) {
					error = e instanceof Error ? e.message : String(e);
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
						contextEnvDB: !!ctx?.env?.DB,
						contextCloudflareEnvDB: !!ctx?.cloudflare?.env?.DB,
						envRelatedGlobalKeys: envRelatedKeys,
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