import { cache } from './cache';
import { ONE_WEEK_AS_MS } from '@shared';
import type { User } from '@shared';
import type { Session } from '@server/auth/misc';

export enum CacheAccess {
  PUBLIC = 'PUBLIC',
  PRIVATE = 'PRIVATE',
}

/**
 * Domain-specific cache keys and TTLs for Public API app.
 */
class PublicAPICache {
  user = {
    key: (id: number) => `user:${id}`,
    ttl: ONE_WEEK_AS_MS,
    permission: CacheAccess.PRIVATE,
    get: async (id: number): Promise<null | User> => {
      return cache.get<User>(this.user.key(id));
    },
    set: async (user: User): Promise<void> => {
      return cache.set(this.user.key(user.id), user, this.user.ttl);
    },
    delete: async (id: number): Promise<void> => {
      return cache.delete(this.user.key(id));
    },
    wrap: async <User>(id: number, fn: () => Promise<User>): Promise<User> => {
      return cache.wrap<User>(this.user.key(id), fn, this.user.ttl);
    },
  };

  session = {
    key: (idToken: string) => `session:${idToken}`,
    ttl: ONE_WEEK_AS_MS,
    permission: CacheAccess.PRIVATE,
    get: async (idToken: string): Promise<null | Session> => {
      return cache.get<Session>(this.session.key(idToken));
    },
    set: async (idToken: string, session: Session): Promise<void> => {
      return cache.set(this.session.key(idToken), session, this.session.ttl);
    },
    delete: async (idToken: string): Promise<void> => {
      return cache.delete(this.session.key(idToken));
    },
    wrap: async <Session>(idToken: string, fn: () => Promise<Session>): Promise<Session> => {
      return cache.wrap<Session>(this.session.key(idToken), fn, this.session.ttl);
    },
  };
}

export const publicAPICache = new PublicAPICache();
