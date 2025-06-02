import { createAPIFileRoute } from "@tanstack/react-start/api";
import { createErrorResponse, createJSONResponse } from "~/lib/api-utils";
import { createLucia } from "~/lib/auth";
import type { CloudflareGlobal } from "~/types/cloudflare";

export const APIRoute = createAPIFileRoute("/api/auth/logout")({
	POST: async ({ request }) => {
		// Cloudflare D1データベースを取得
		const d1Database = globalThis.__env__?.DB || globalThis.DB;
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
