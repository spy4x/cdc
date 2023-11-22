import { auth, setSession } from '@server';
import { AuthEmailPasswordSchema, handleValidationError } from '@shared';
import { json, type RequestHandler } from '@sveltejs/kit';

export const POST: RequestHandler = async ({ locals, request, cookies }) => {
  if (locals.user && locals.session) {
    console.log('User already signed in');
    setSession(cookies, locals.session);
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

  const result = await auth.email.signIn(email, password);
  if (!result) {
    return json(
      {
        message: 'The provided email and password combination does not match any existing user.',
      },
      { status: 401 },
    );
  }
  const { user, session } = result;
  setSession(cookies, session);
  return json(user);
};
