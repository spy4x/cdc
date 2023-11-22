import { auth } from '@server';
import { redirect, type RequestHandler } from '@sveltejs/kit';

export const GET: RequestHandler = async ({ locals, cookies }) => {
  if (locals.user) {
    throw redirect(302, '/'); // if already authenticated, redirect to home
  }

  // get url to redirect the user to, with the state
  const url = auth.facebook.getRedirectURL(cookies);

  // redirect to authorization url
  return new Response(null, {
    status: 302,
    headers: {
      location: url,
    },
  });
};
