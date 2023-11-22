import { auth, setSession } from '@server';
import { AuthEmailPasswordSchema, handleValidationError } from '@shared';
import { json, type RequestHandler } from '@sveltejs/kit';

export const POST: RequestHandler = async ({ locals, request, cookies }) => {
  if (locals.user) {
    console.log('User already signed in');
    return json(locals.user);
  }
  const payload = await request.json();
  const parseResult = AuthEmailPasswordSchema.safeParse(payload);
  if (!parseResult.success) {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore - something weird with type incompatibility
    return json(handleValidationError(parseResult.error), { status: 400 });
  }
  const { email, password } = parseResult.data;

  try {
    const isTaken = await auth.email.isEmailTaken(email);
    if (isTaken) {
      return json(
        {
          message: 'The provided email is already in use.',
        },
        { status: 401 },
      );
    }

    const result = await auth.email.signUp(email, password);
    if (!result) {
      return json(
        {
          message: 'Server error',
        },
        { status: 500 },
      );
    }

    setSession(cookies, result.session);

    return json(result.user);
  } catch (error: unknown) {
    console.error(error);
    return json({ message: 'Server Error' }, { status: 500 });
  }
};
