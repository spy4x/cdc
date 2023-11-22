import { redirect } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { auth, cache, setSession } from '@server';
import type { User } from '@shared';

export const GET: RequestHandler = async ({ cookies, url }) => {
  const code = url.searchParams.get('code');
  const state = url.searchParams.get('state');

  if (!code || !state) {
    console.error('no code or state', { code, state });
    throw redirect(302, '/auth');
  }

  try {
    const { session, user } = await auth.google.validate(code, state, cookies);
    setSession(cookies, session);
    await cache.user.set(user as User);
  } catch (e) {
    // invalid code
    console.error(e);
  }
  throw redirect(302, '/auth');
};
