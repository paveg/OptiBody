import { DrizzleSQLiteAdapter } from "@lucia-auth/adapter-drizzle";
import { Lucia, TimeSpan } from "lucia";
import { createDb } from "./database";
import { sessions, users } from "./database/schema";
import type { User } from "./database/schema";

// Lucia認証用のadapter作成関数
export function createLucia(d1Database?: D1Database) {
	const db = createDb(d1Database);
	const adapter = new DrizzleSQLiteAdapter(db, sessions, users);

	return new Lucia(adapter, {
		sessionCookie: {
			attributes: {
				secure: process.env.NODE_ENV === "production",
			},
		},
		sessionExpiresIn: new TimeSpan(30, "d"), // 30日間
		getUserAttributes: (attributes) => {
			return {
				email: attributes.email,
				username: attributes.username,
			};
		},
	});
}

// デフォルトのLuciaインスタンス（開発用）
export const lucia = createLucia();

// TypeScript用の型定義
declare module "lucia" {
	interface Register {
		Lucia: typeof lucia;
		DatabaseUserAttributes: DatabaseUserAttributes;
	}
}

interface DatabaseUserAttributes {
	email: string;
	username: string;
}

// パスワードのハッシュ化と検証
import { hash, verify } from "argon2";

export async function hashPassword(password: string): Promise<string> {
	return await hash(password);
}

export async function verifyPassword(
	password: string,
	hashedPassword: string,
): Promise<boolean> {
	return await verify(hashedPassword, password);
}
