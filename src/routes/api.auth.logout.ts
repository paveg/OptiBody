import { createAPIFileRoute } from "@tanstack/react-start/api";
import { createErrorResponse, createJSONResponse } from "~/lib/api-utils";
import { createLucia } from "~/lib/auth";
import type { CloudflareGlobal } from "~/types/cloudflare";

export const APIRoute = createAPIFileRoute("/api/auth/logout")({
	POST: async ({ request, context }) => {
		// Cloudflare D1データベースを取得
		let d1Database: D1Database | null = null;
		
		// 複数の方法でD1データベースを取得を試行
		d1Database = context?.cloudflare?.env?.DB || 
					 context?.env?.DB || 
					 globalThis.__env__?.DB || 
					 globalThis.DB;

		if (!d1Database) {
			return createErrorResponse("データベースに接続できませんでした", 503);
		}

		const lucia = createLucia(d1Database);

		const sessionId = lucia.readSessionCookie(
			request.headers.get("cookie") ?? "",
		);

		if (!sessionId) {
			return createErrorResponse("ログインしていません", 401);
		}

		await lucia.invalidateSession(sessionId);

		const blankSessionCookie = lucia.createBlankSessionCookie();

		return createJSONResponse({ message: "ログアウトしました" }, 200, {
			"Set-Cookie": blankSessionCookie.serialize(),
		});
	},
});
