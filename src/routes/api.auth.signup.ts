import { createAPIFileRoute } from "@tanstack/react-start/api";
import { eq, or } from "drizzle-orm";
import { generateId } from "lucia";
import { createErrorResponse, createJSONResponse } from "~/lib/api-utils";
import { createLucia, hashPassword } from "~/lib/auth";
import { requireDatabase } from "~/lib/database";
import { users } from "~/lib/database/schema";

export const APIRoute = createAPIFileRoute("/api/auth/signup")({
	POST: async ({ request }) => {
		try {
			const body = await request.json();
			const { email, username, password } = body as {
				email: string;
				username: string;
				password: string;
			};

			// バリデーション
			if (!email || !username || !password) {
				return createErrorResponse("全ての項目を入力してください", 400);
			}

			if (password.length < 8) {
				return createErrorResponse(
					"パスワードは8文字以上で入力してください",
					400,
					"password",
				);
			}

			if (!/^[a-zA-Z0-9_]+$/.test(username)) {
				return createErrorResponse(
					"ユーザー名は英数字とアンダースコアのみ使用できます",
					400,
					"username",
				);
			}

			// データベースインスタンスを取得
			const db = requireDatabase();

			// D1バインディングを取得してLuciaを初期化
			const d1Database =
				(globalThis as { __env__?: { DB: D1Database }; DB?: D1Database })
					.__env__?.DB || (globalThis as { DB?: D1Database }).DB;
			if (!d1Database) {
				return createErrorResponse("データベースに接続できませんでした", 503);
			}
			const lucia = createLucia(d1Database);

			// 既存ユーザーのチェック
			const existingUser = await db
				.select()
				.from(users)
				.where(
					or(
						eq(users.email, email.toLowerCase()),
						eq(users.username, username.toLowerCase()),
					),
				)
				.limit(1);

			if (existingUser.length > 0) {
				if (existingUser[0].email === email.toLowerCase()) {
					return createErrorResponse(
						"このメールアドレスは既に使用されています",
						409,
						"email",
					);
				}
				return createErrorResponse(
					"このユーザー名は既に使用されています",
					409,
					"username",
				);
			}

			// パスワードをハッシュ化
			const hashedPassword = await hashPassword(password);

			// ユーザーを作成
			const userId = generateId(15);
			await db.insert(users).values({
				id: userId,
				email: email.toLowerCase(),
				username: username.toLowerCase(),
				hashedPassword,
			});

			// セッションを作成
			const session = await lucia.createSession(userId, {});
			const sessionCookie = lucia.createSessionCookie(session.id);

			return createJSONResponse({ message: "アカウントを作成しました" }, 201, {
				"Set-Cookie": sessionCookie.serialize(),
			});
		} catch (error) {
			// Log error without exposing stack trace details
			console.error("Signup error occurred");
			return createErrorResponse("サーバーエラーが発生しました", 500);
		}
	},
});
