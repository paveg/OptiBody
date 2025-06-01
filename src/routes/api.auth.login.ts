import { createAPIFileRoute } from '@tanstack/react-start/api';
import { lucia, verifyPassword } from '~/lib/auth';
import { db } from '~/lib/database';
import { users } from '~/lib/database/schema';
import { eq } from 'drizzle-orm';

export const Route = createAPIFileRoute('/api/auth/login')({
  POST: async ({ request }) => {
    try {
      const body = await request.json();
      const { email, password } = body;

      if (!email || !password) {
        return Response.json(
          { message: 'メールアドレスとパスワードは必須です' },
          { status: 400 }
        );
      }

      // ユーザーを検索
      const user = await db
        .select()
        .from(users)
        .where(eq(users.email, email.toLowerCase()))
        .limit(1);

      if (user.length === 0) {
        return Response.json(
          { message: 'メールアドレスまたはパスワードが正しくありません' },
          { status: 401 }
        );
      }

      const validPassword = await verifyPassword(password, user[0].hashedPassword);
      if (!validPassword) {
        return Response.json(
          { message: 'メールアドレスまたはパスワードが正しくありません' },
          { status: 401 }
        );
      }

      // セッションを作成
      const session = await lucia.createSession(user[0].id, {});
      const sessionCookie = lucia.createSessionCookie(session.id);

      return new Response(JSON.stringify({ message: 'ログインに成功しました' }), {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Set-Cookie': sessionCookie.serialize(),
        },
      });
    } catch (error) {
      console.error('Login error:', error);
      return Response.json(
        { message: 'サーバーエラーが発生しました' },
        { status: 500 }
      );
    }
  },
});