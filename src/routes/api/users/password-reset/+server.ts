import { auth, setSession } from '@server';
import { AuthPasswordResetSchema, handleValidationError } from '@shared';
import { json, type RequestHandler } from '@sveltejs/kit';
import type { ZodError } from 'zod';

/** Sets new password if reset-password token is correct and returns user */
export const POST: RequestHandler = async ({ request, cookies }) => {
  try {
    const parseResult = AuthPasswordResetSchema.safeParse(await request.json());
    if (!parseResult.success) {
      return json(handleValidationError(parseResult.error as unknown as ZodError), {
        status: 400,
      });
    }
    const { token, password } = parseResult.data;

    const session = await auth.email.validatePasswordResetToken(token, password);
    if (!session) {
      return json({ error: 'Invalid token' }, { status: 400 });
    }

    setSession(cookies, session);

    const user = await auth.user.get(session.userId);
    if (!user) {
      return json('Server error', { status: 500 });
    }

    return json(user);
  } catch (error) {
    console.error(error);
    return json('Server error', { status: 500 });
  }
};
