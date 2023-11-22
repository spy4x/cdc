import { auth, setSession } from '@server';
import { json, type RequestHandler } from '@sveltejs/kit';

export const POST: RequestHandler = async ({ locals, cookies }) => {
  if (locals.user) {
    console.log('User already signed in');
    return json(locals.user);
  }
  try {
    const result = await auth.anon.signUp();
    if (!result) {
      return json({ message: 'Server error' }, { status: 500 });
    }

    setSession(cookies, result.session);

    return json(result.user);
  } catch (error: unknown) {
    console.error(error);
    return json({ message: 'Server Error' }, { status: 500 });
  }
};
