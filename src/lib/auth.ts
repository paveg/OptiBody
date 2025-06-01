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

// パスワードのハッシュ化と検証 (Web Crypto API使用)
export async function hashPassword(password: string): Promise<string> {
	const encoder = new TextEncoder();
	const data = encoder.encode(password);
	
	// ソルトを生成
	const salt = crypto.getRandomValues(new Uint8Array(16));
	
	// PBKDF2でハッシュ化
	const key = await crypto.subtle.importKey(
		"raw",
		data,
		{ name: "PBKDF2" },
		false,
		["deriveBits"]
	);
	
	const bits = await crypto.subtle.deriveBits(
		{
			name: "PBKDF2",
			salt: salt,
			iterations: 100000,
			hash: "SHA-256"
		},
		key,
		256
	);
	
	// ソルトとハッシュを結合してBase64エンコード
	const combined = new Uint8Array(salt.length + bits.byteLength);
	combined.set(salt);
	combined.set(new Uint8Array(bits), salt.length);
	
	return btoa(String.fromCharCode(...combined));
}

export async function verifyPassword(
	password: string,
	hashedPassword: string,
): Promise<boolean> {
	try {
		const encoder = new TextEncoder();
		const data = encoder.encode(password);
		
		// Base64デコードして、ソルトとハッシュを分離
		const combined = Uint8Array.from(atob(hashedPassword), c => c.charCodeAt(0));
		const salt = combined.slice(0, 16);
		const storedHash = combined.slice(16);
		
		// 入力パスワードをハッシュ化
		const key = await crypto.subtle.importKey(
			"raw",
			data,
			{ name: "PBKDF2" },
			false,
			["deriveBits"]
		);
		
		const bits = await crypto.subtle.deriveBits(
			{
				name: "PBKDF2",
				salt: salt,
				iterations: 100000,
				hash: "SHA-256"
			},
			key,
			256
		);
		
		const computedHash = new Uint8Array(bits);
		
		// 比較
		if (computedHash.length !== storedHash.length) {
			return false;
		}
		
		for (let i = 0; i < computedHash.length; i++) {
			if (computedHash[i] !== storedHash[i]) {
				return false;
			}
		}
		
		return true;
	} catch {
		return false;
	}
}
