import { cache, db, invalidateSession } from '@server';
import { json, type RequestHandler } from '@sveltejs/kit';
import { handleValidationError, UserUpdateSchema } from '@shared';

export const GET: RequestHandler = async ({ locals, cookies }) => {
  if (locals.user) {
    return json(locals.user);
  } else {
    invalidateSession(cookies);
    return json({ message: 'Not authenticated.' }, { status: 401 });
  }
};

export const DELETE: RequestHandler = async ({ locals, cookies }) => {
  if (!locals.user) {
    return json({ message: 'Not authenticated.' }, { status: 401 });
  }
  await db.user.deleteOne(locals.user.id);
  await cache.user.delete(locals.user.id);
  invalidateSession(cookies);
  return json({ message: 'User deleted.' });
};

export const PATCH: RequestHandler = async ({ locals, request }) => {
  if (!locals.user) {
    return json({ message: 'Not authenticated.' }, { status: 401 });
  }
  const payload = await request.json();
  const parseResult = UserUpdateSchema.safeParse(payload);
  if (!parseResult.success) {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore - something weird with type incompatibility
    return json({ error: handleValidationError(parseResult.error) }, { status: 400 });
  }
  const update = parseResult.data;
  const oldUser = await db.user.findOne(locals.user.id);
  if (!oldUser) {
    return json({ message: 'User not found' }, { status: 404 });
  }
  try {
    const updatedUser = await db.user.updateOne(locals.user.id, update);
    if (!updatedUser) {
      return json({ message: 'User not found' }, { status: 404 });
    }
    await cache.user.set(updatedUser);
    return json(updatedUser);
  } catch (error: unknown) {
    return json({ message: 'Server Error - Save to DB' }, { status: 500 });
  }
};
