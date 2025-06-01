import { createAPIFileRoute } from "@tanstack/react-start/api";

export const APIRoute = createAPIFileRoute("/api/health")({
	GET: async ({ request, context }) => {
		try {
			// 基本的な動作確認
			const global = globalThis as any;
			const ctx = context as any;
			
			const env = {
				NODE_ENV: process.env.NODE_ENV,
				SESSION_SECRET_EXISTS: !!process.env.SESSION_SECRET,
				// グローバルからのDB
				GLOBAL_DB_EXISTS: !!global.DB,
				// コンテキストからのDB
				CONTEXT_DB_EXISTS: !!(ctx?.cloudflare?.env?.DB),
				CONTEXT_ENV_KEYS: ctx?.cloudflare?.env ? Object.keys(ctx.cloudflare.env) : [],
				// 利用可能なグローバル変数を確認
				AVAILABLE_GLOBALS: Object.keys(global).filter(key => 
					key.includes('DB') || key.includes('database') || key.toUpperCase() === key
				),
				// CloudflareWorkerのコンテキストを確認
				CF_CONTEXT: !!global.cloudflare,
				CONTEXT_STRUCTURE: ctx ? Object.keys(ctx) : [],
			};

			return new Response(JSON.stringify({
				status: "ok",
				timestamp: new Date().toISOString(),
				environment: env
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