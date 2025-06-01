import { lucia } from '../auth';
import type { Session, User } from 'lucia';

export interface AuthContext {
  user: User | null;
  session: Session | null;
}

export async function validateRequest(
  cookieHeader: string | null
): Promise<AuthContext> {
  const sessionId = lucia.readSessionCookie(cookieHeader ?? '');
  
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