import { createAPIFileRoute } from '@tanstack/react-start/api';
import { lucia } from '~/lib/auth';

export const Route = createAPIFileRoute('/api/auth/logout')({
  POST: async ({ request }) => {
    const sessionId = lucia.readSessionCookie(request.headers.get('cookie') ?? '');
    
    if (!sessionId) {
      return Response.json(
        { message: 'ログインしていません' },
        { status: 401 }
      );
    }

    await lucia.invalidateSession(sessionId);

    const blankSessionCookie = lucia.createBlankSessionCookie();

    return new Response(JSON.stringify({ message: 'ログアウトしました' }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Set-Cookie': blankSessionCookie.serialize(),
      },
    });
  },
});