import { json, type RequestHandler } from '@sveltejs/kit';
import { UserPermission } from '@shared';
import { shutdown } from '@server/helpers';

export const GET: RequestHandler = async ({ locals }) => {
  if (!locals.user) {
    return json({ message: 'Not signed in' }, { status: 401 });
  }
  if (locals.user.permission !== UserPermission.ADMIN) {
    return json({ message: 'Not an admin' }, { status: 403 });
  }
  const userId = locals.user.id;

  console.log(`Admin id=${userId}, email=${locals.user.email} is rebooting the server.`);
  setTimeout(() => shutdown('SIGTERM'), 100);
  return json({ success: true, message: `Rebooting...` });
};
