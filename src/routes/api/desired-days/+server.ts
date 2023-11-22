import { handleValidationError, DesiredDayCreateSchema } from '@shared';
import { json, type RequestHandler } from '@sveltejs/kit';
import { db } from '@server';

export const GET: RequestHandler = async ({ locals }) => {
  if (!locals.user) {
    return json({ message: 'Not signed in' }, { status: 401 });
  }
  const result = await db.desiredDay.findMany(locals.user.id);
  return json(result);
};

export const POST: RequestHandler = async ({ locals, request }) => {
  if (!locals.user) {
    return json({ message: 'Not signed in' }, { status: 401 });
  }
  const requestBody = await request.json();
  const parseResult = DesiredDayCreateSchema.safeParse(requestBody);
  if (!parseResult.success) {
    return json(handleValidationError(parseResult.error), { status: 400 });
  }
  const payload = parseResult.data;
  try {
    const result = await db.desiredDay.createOne(locals.user.id, { ...payload, userId: locals.user.id });
    return json(result);
  } catch (error: unknown) {
    console.error(error);
    return json({ message: 'Server Error' }, { status: 500 });
  }
};
