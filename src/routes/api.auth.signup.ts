import { createAPIFileRoute } from '@tanstack/react-start/api';
import { lucia, hashPassword } from '~/lib/auth';
import { db } from '~/lib/database';
import { users } from '~/lib/database/schema';
import { eq, or } from 'drizzle-orm';
import { generateId } from 'lucia';

export const Route = createAPIFileRoute('/api/auth/signup')({
  POST: async ({ request }) => {
    try {
      const body = await request.json();
      const { email, username, password } = body;

      // バリデーション
      if (!email || !username || !password) {
        return Response.json(
          { message: '全ての項目を入力してください' },
          { status: 400 }
        );
      }

      if (password.length < 8) {
        return Response.json(
          { message: 'パスワードは8文字以上で入力してください', field: 'password' },
          { status: 400 }
        );
      }

      if (!/^[a-zA-Z0-9_]+$/.test(username)) {
        return Response.json(
          { message: 'ユーザー名は英数字とアンダースコアのみ使用できます', field: 'username' },
          { status: 400 }
        );
      }

      // 既存ユーザーのチェック
      const existingUser = await db
        .select()
        .from(users)
        .where(
          or(
            eq(users.email, email.toLowerCase()),
            eq(users.username, username.toLowerCase())
          )
        )
        .limit(1);

      if (existingUser.length > 0) {
        if (existingUser[0].email === email.toLowerCase()) {
          return Response.json(
            { message: 'このメールアドレスは既に使用されています', field: 'email' },
            { status: 409 }
          );
        } else {
          return Response.json(
            { message: 'このユーザー名は既に使用されています', field: 'username' },
            { status: 409 }
          );
        }
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

      return new Response(JSON.stringify({ message: 'アカウントを作成しました' }), {
        status: 201,
        headers: {
          'Content-Type': 'application/json',
          'Set-Cookie': sessionCookie.serialize(),
        },
      });
    } catch (error) {
      console.error('Signup error:', error);
      return Response.json(
        { message: 'サーバーエラーが発生しました' },
        { status: 500 }
      );
    }
  },
});