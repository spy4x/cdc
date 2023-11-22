import { createAuth } from '@server/auth/lib';
import { PostgresAdapter } from '@server/auth/adapter';
import { env } from '$env/dynamic/private';
import type { Cookies } from '@sveltejs/kit';
import { ONE_YEAR_AS_SEC, SESSION_ID_COOKIE_NAME, USER_ID_COOKIE_NAME } from '@shared';
import { dev } from '$app/environment';
import type { Session } from './misc';

export const auth = createAuth({
  adapter: new PostgresAdapter(),
  passwordPepper: env.PASSWORD_PEPPER,
});

export function getSessionIdToken(cookies: Cookies): string | null {
  return cookies.get(SESSION_ID_COOKIE_NAME) ?? null;
}

export async function validateSession(cookies: Cookies): Promise<Session | null> {
  const sessionIdToken = getSessionIdToken(cookies);
  if (sessionIdToken) {
    return auth.session.validate(sessionIdToken);
  }
  return null;
}

export function setSession(cookies: Cookies, session: Session): void {
  const maxAge = session.expiresAt ? session.expiresAt.getTime() - Date.now() : ONE_YEAR_AS_SEC;
  cookies.set(SESSION_ID_COOKIE_NAME, auth.session.getIdTokenForCookie(session), {
    path: '/',
    maxAge,
    httpOnly: true,
    sameSite: 'strict',
    secure: !dev,
  });
  // set js-accessible cookie with user.id
  cookies.set(USER_ID_COOKIE_NAME, session.userId.toString(), {
    path: '/',
    maxAge,
    httpOnly: false,
    sameSite: 'strict',
    secure: !dev,
  });
}

export function invalidateSession(cookies: Cookies): void {
  const sessionIdToken = getSessionIdToken(cookies);
  if (sessionIdToken) {
    void auth.session.delete(sessionIdToken);
  }

  // remove session cookie
  cookies.set(SESSION_ID_COOKIE_NAME, '', {
    path: '/',
    maxAge: 0,
    httpOnly: true,
    sameSite: 'strict',
    secure: !dev,
  });

  // remove js-accessible userId cookie
  cookies.set(USER_ID_COOKIE_NAME, '', {
    path: '/',
    maxAge: 0,
    httpOnly: false,
    sameSite: 'strict',
    secure: !dev,
  });
}
