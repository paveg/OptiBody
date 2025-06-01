import { createAPIFileRoute } from "@tanstack/react-start/api";

export const APIRoute = createAPIFileRoute("/api/health")({
	GET: async ({ request }) => {
		try {
			// 基本的な動作確認
			const global = globalThis as any;
			const env = {
				NODE_ENV: process.env.NODE_ENV,
				SESSION_SECRET_EXISTS: !!process.env.SESSION_SECRET,
				DB_EXISTS: !!global.DB,
				// 利用可能なグローバル変数を確認
				AVAILABLE_GLOBALS: Object.keys(global).filter(key => 
					key.includes('DB') || key.includes('database') || key.toUpperCase() === key
				),
				// CloudflareWorkerのコンテキストを確認
				CF_CONTEXT: !!global.cloudflare,
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