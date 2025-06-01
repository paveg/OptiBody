import { Lucia, TimeSpan } from 'lucia';
import { DrizzlePostgreSQLAdapter } from '@lucia-auth/adapter-postgresql';
import { db } from './database';
import { sessions, users } from './database/schema';
import type { User } from './database/schema';

// Lucia認証の設定
const adapter = new DrizzlePostgreSQLAdapter(db, sessions, users);

export const lucia = new Lucia(adapter, {
  sessionCookie: {
    attributes: {
      secure: process.env.NODE_ENV === 'production',
    },
  },
  sessionExpiresIn: new TimeSpan(30, 'd'), // 30日間
  getUserAttributes: (attributes) => {
    return {
      email: attributes.email,
      username: attributes.username,
    };
  },
});

// TypeScript用の型定義
declare module 'lucia' {
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
import { hash, verify } from 'argon2';

export async function hashPassword(password: string): Promise<string> {
  return await hash(password);
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return await verify(hashedPassword, password);
}