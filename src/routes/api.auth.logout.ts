import { createAPIFileRoute } from "@tanstack/react-start/api";
import { createErrorResponse, createJSONResponse } from "~/lib/api-utils";
import { lucia } from "~/lib/auth";

export const APIRoute = createAPIFileRoute("/api/auth/logout")({
	POST: async ({ request }) => {
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
