import { invalidateSession } from '@server';
import { json, type RequestHandler } from '@sveltejs/kit';

export const GET: RequestHandler = async ({ cookies }) => {
  invalidateSession(cookies);
  return json({}, { status: 200 });
};

export const POST: RequestHandler = async ({ cookies }) => {
  invalidateSession(cookies);
  return json({}, { status: 200 });
};
