import { sequence } from '@sveltejs/kit/hooks';
import { dev } from '$app/environment';
import { cache, db, getSessionIdToken, invalidateSession, validateSession } from '@server';
import type { Handle } from '@sveltejs/kit';
import { env } from '$env/dynamic/public';
import { captureException, handleErrorWithSentry, init, sentryHandle } from '@sentry/sveltekit';
import type { Session } from '@server/auth/misc';
import type { User } from '@shared';
import { shutdown } from '@server/helpers';

if (!dev) {
  init({
    dsn: env.PUBLIC_SENTRY_DSN_TOKEN,
    tracesSampleRate: 1,
  });
}

export const handle: Handle = sequence(sentryHandle(), async ({ event, resolve }) => {
  try {
    const start = Date.now();
    console.log(event.request.method, event.request.url);
    const sessionIdToken = getSessionIdToken(event.cookies);
    let userId: null | number = null;
    let user: null | User = null;
    let session: null | Session = null;
    if (sessionIdToken) {
      session = await cache.session.wrap(sessionIdToken, () => validateSession(event.cookies));
      if (!session) {
        invalidateSession(event.cookies);
      }
      event.locals.session = session;
      userId = session?.userId ?? null;
      if (userId) {
        user = await cache.user.wrap(userId, async () => (userId ? db.user.findOne(userId) : null));
        event.locals.user = user;
      }
    }
    // console.log({ sessionId: sessionIdToken, session, userId, user });
    const result = await resolve(event);
    console.log(event.request.method, event.request.url, result.status, Date.now() - start + 'ms');
    return result;
  } catch (error: unknown) {
    console.error(error);
    captureException(error);
    return new Response((error as Error).message, {
      status: 500,
    });
  }
});

export const handleError = handleErrorWithSentry();

void initialize();

async function initialize(): Promise<void> {
  console.log('Initializing...');

  process.on('SIGTERM', shutdown);
  process.on('SIGINT', shutdown);

  try {
    console.log('Connecting to DB...');
    await db.$connect();
    console.log('✅ Connected to DB.');
  } catch (error: unknown) {
    console.error(`❌ Connecting to DB failed:`, error);
    captureException(error);
  }
}
