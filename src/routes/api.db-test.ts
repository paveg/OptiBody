import { createAPIFileRoute } from "@tanstack/react-start/api";
import type { CloudflareGlobal } from "~/types/cloudflare";
import { createDb } from "~/lib/database";

export const APIRoute = createAPIFileRoute("/api/db-test")({
	GET: async ({ request, context }) => {
		try {
			// D1データベースにアクセス
			const d1Database = (globalThis as CloudflareGlobal).DB;
			
			let dbResult = null;
			let dbSource = "none";
			let error = null;
			
			if (d1Database) {
				try {
					// 直接D1を使ってテスト
					dbResult = await d1Database.prepare("SELECT 1 as test").first();
					dbSource = "globalThis.DB (direct)";
					
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
								source: "createDb(globalThis.DB)"
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

			return new Response(JSON.stringify({
				status: "error",
				timestamp: new Date().toISOString(),
				dbTest: {
					available: false,
					error: error || "D1 database not available in globalThis.DB",
					debugging: {
						hasGlobalDB: !!d1Database,
						globalKeys: Object.keys(globalThis).filter(k => k.includes('DB') || k.includes('d1')),
						contextKeys: context ? Object.keys(context) : []
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