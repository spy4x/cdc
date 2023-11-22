// import { env } from '$env/dynamic/private';
import { auth } from '@server';
import { AuthPasswordResetRequestSchema, handleValidationError } from '@shared';
import { json, type RequestHandler } from '@sveltejs/kit';
import type { ZodError } from 'zod';

/** Sends a password-reset link (with token) to a user via email */
export const POST: RequestHandler = async ({ request }) => {
  try {
    const parseResult = AuthPasswordResetRequestSchema.safeParse(await request.json());
    if (!parseResult.success) {
      return json(handleValidationError(parseResult.error as unknown as ZodError), {
        status: 400,
      });
    }
    const email = parseResult.data.email;

    const key = await auth.email.createPasswordResetToken(email);
    if (!key) {
      return json({ error: 'No user with such email' }, { status: 404 });
    }

    // const link = `${env.APP_URL}/auth/password-reset?token=${key.identification}`;

    //     const subject = 'Roley: Password reset request';
    //     const text = `Someone requested a password reset for your account.
    // If it was you, please follow the link below. Otherwise ignore this email.
    // ${link}`;

    // await sendEmail(email, subject, text);

    return json({ message: `Password reset link has been sent to ${email}` });
  } catch (error) {
    console.error(error);
    return json('Server error', { status: 500 });
  }
};
