import { handleValidationError, DesiredDaySchema } from '@shared';
import { json, type RequestHandler } from '@sveltejs/kit';
import { db } from '@server';

export const PATCH: RequestHandler = async ({ locals, request }) => {
  if (!locals.user) {
    return json({ message: 'Not signed in' }, { status: 401 });
  }
  const userId = locals.user.id;
  const payload = await request.json();

  const parseResult = DesiredDaySchema.safeParse(payload);
  if (!parseResult.success) {
    return json(handleValidationError(parseResult.error), { status: 400 });
  }
  const movie = parseResult.data;

  if (!(await db.desiredDay.doesOneExist(movie.id, userId))) {
    return json({ message: 'DesiredDay not found' }, { status: 404 });
  }

  try {
    const update = { ...DesiredDaySchema.parse(movie), userId: locals.user.id };
    return json(await db.desiredDay.updateOne(movie.id, update, userId));
  } catch (error: unknown) {
    console.error(error);
    return json({ message: 'Server Error' }, { status: 500 });
  }
};

export const DELETE: RequestHandler = async ({ locals, params }) => {
  if (!locals.user) {
    return json({ message: 'Not signed in' }, { status: 401 });
  }
  const id = parseInt(params.id || '0', 10);
  if (!id) {
    return json({ message: 'No id provided' }, { status: 400 });
  }

  try {
    await db.desiredDay.deleteOne(id, locals.user.id);
    return json({ message: 'deleted' });
  } catch (error: unknown) {
    console.error(error);
    return json({ message: 'Server Error' }, { status: 500 });
  }
};

export const GET: RequestHandler = async ({ locals, params }) => {
  if (!locals.user) {
    return json({ message: 'Not signed in' }, { status: 401 });
  }
  const id = parseInt(params.id || '0', 10);
  const movie = await db.movie.user.findOne(id, locals.user.id);
  if (!movie) {
    return json({ message: 'DesiredDay not found' }, { status: 404 });
  }
  return json(movie);
};
