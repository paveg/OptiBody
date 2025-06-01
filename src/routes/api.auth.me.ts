import { createAPIFileRoute } from "@tanstack/react-start/api";
import { createErrorResponse, createJSONResponse } from "~/lib/api-utils";
import { validateRequest } from "~/lib/auth/middleware";

export const APIRoute = createAPIFileRoute("/api/auth/me")({
	GET: async ({ request }) => {
		const { user } = await validateRequest(request.headers.get("cookie"));

		if (!user) {
			return createErrorResponse("認証が必要です", 401);
		}

		return createJSONResponse({
			user: {
				id: user.id,
				email: user.email,
				username: user.username,
			},
		});
	},
});
