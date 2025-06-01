import { createAPIFileRoute } from '@tanstack/react-start/api';
import { validateRequest } from '~/lib/auth/middleware';

export const Route = createAPIFileRoute('/api/auth/me')({
  GET: async ({ request }) => {
    const { user } = await validateRequest(request.headers.get('cookie'));

    if (!user) {
      return Response.json(
        { message: '認証が必要です' },
        { status: 401 }
      );
    }

    return Response.json({
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
      },
    });
  },
});