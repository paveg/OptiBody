import type { Session, User } from "lucia";
import type { CloudflareGlobal } from "../../types/cloudflare";
import { createLucia } from "../auth";

export interface AuthContext {
	user: User | null;
	session: Session | null;
}

export async function validateRequest(
	cookieHeader: string | null,
	d1Database?: D1Database,
): Promise<AuthContext> {
	// D1データベースを取得（グローバルかパラメータから）
	const db = d1Database || (globalThis as CloudflareGlobal).DB;
	const lucia = createLucia(db);

	const sessionId = lucia.readSessionCookie(cookieHeader ?? "");

	if (!sessionId) {
		return {
			user: null,
			session: null,
		};
	}

	const result = await lucia.validateSession(sessionId);

	return {
		user: result.user,
		session: result.session,
	};
}
