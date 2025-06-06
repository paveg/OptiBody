import { createAPIFileRoute } from "@tanstack/react-start/api";
import { eq } from "drizzle-orm";
import { createErrorResponse, createJSONResponse } from "~/lib/api-utils";
import { createLucia, verifyPassword } from "~/lib/auth";
import { requireDatabase } from "~/lib/database";
import { users } from "~/lib/database/schema";

export const APIRoute = createAPIFileRoute("/api/auth/login")({
	POST: async ({ request, context }) => {
		try {
			const body = await request.json();
			const { email, password } = body;

			if (!email || !password) {
				return createErrorResponse("メールアドレスとパスワードは必須です", 400);
			}

			// データベースインスタンスを取得
			const db = requireDatabase();

			// D1バインディングを取得してLuciaを初期化
			const d1Database = globalThis.__env__?.DB || globalThis.DB;
			if (!d1Database) {
				return createErrorResponse("データベースに接続できませんでした", 503);
			}
			const lucia = createLucia(d1Database);

			// ユーザーを検索
			const user = await db
				.select()
				.from(users)
				.where(eq(users.email, email.toLowerCase()))
				.limit(1);

			if (user.length === 0) {
				return createErrorResponse(
					"メールアドレスまたはパスワードが正しくありません",
					401,
				);
			}

			const validPassword = await verifyPassword(
				password,
				user[0].hashedPassword,
			);
			if (!validPassword) {
				return createErrorResponse(
					"メールアドレスまたはパスワードが正しくありません",
					401,
				);
			}

			// セッションを作成
			const session = await lucia.createSession(user[0].id, {});
			const sessionCookie = lucia.createSessionCookie(session.id);

			return createJSONResponse({ message: "ログインに成功しました" }, 200, {
				"Set-Cookie": sessionCookie.serialize(),
			});
		} catch (error) {
			console.error("Login error:", error);
			return createErrorResponse("サーバーエラーが発生しました", 500);
		}
	},
});
