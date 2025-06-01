import { createAPIFileRoute } from "@tanstack/react-start/api";

export const APIRoute = createAPIFileRoute("/api/db-test")({
	GET: async ({ request, context }) => {
		try {
			// 様々な方法でD1データベースにアクセスを試行
			const global = globalThis as any;
			const ctx = context as any;
			
			let dbResult = null;
			let dbSource = "none";
			
			// 方法1: globalThis.DB
			if (global.DB) {
				try {
					dbResult = await global.DB.prepare("SELECT 1 as test").first();
					dbSource = "globalThis.DB";
				} catch (e) {
					dbResult = `Error: ${e}`;
				}
			}
			
			// 方法2: context.cloudflare.env.DB
			if (!dbResult && ctx?.cloudflare?.env?.DB) {
				try {
					dbResult = await ctx.cloudflare.env.DB.prepare("SELECT 1 as test").first();
					dbSource = "context.cloudflare.env.DB";
				} catch (e) {
					dbResult = `Error: ${e}`;
				}
			}
			
			// 方法3: context.env.DB
			if (!dbResult && ctx?.env?.DB) {
				try {
					dbResult = await ctx.env.DB.prepare("SELECT 1 as test").first();
					dbSource = "context.env.DB";
				} catch (e) {
					dbResult = `Error: ${e}`;
				}
			}

			return new Response(JSON.stringify({
				status: "ok",
				timestamp: new Date().toISOString(),
				dbTest: {
					result: dbResult,
					source: dbSource,
					globalDB: !!global.DB,
					contextCloudflareEnvDB: !!(ctx?.cloudflare?.env?.DB),
					contextEnvDB: !!(ctx?.env?.DB),
					contextKeys: ctx ? Object.keys(ctx) : [],
					cloudflareKeys: ctx?.cloudflare ? Object.keys(ctx.cloudflare) : [],
					envKeys: ctx?.env ? Object.keys(ctx.env) : []
				}
			}), {
				status: 200,
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