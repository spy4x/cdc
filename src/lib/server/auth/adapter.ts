import type { Adapter, Everything, Key, Session, User, UserBase } from './misc';
import { sql } from '@server';

export class PostgresAdapter implements Adapter {
  async createKey(key: Pick<Key, 'userId' | 'kind' | 'identification' | 'secret'>): Promise<Key | null> {
    return (await sql<Key[]>`INSERT INTO keys ${sql(key)} RETURNING *`)[0];
  }

  async createSession(session: Pick<Session, 'token' | 'userId' | 'keyId' | 'expiresAt'>): Promise<Session | null> {
    return (await sql<Session[]>`INSERT INTO sessions ${sql(session)} RETURNING *`)[0];
  }

  async createUser(payload?: Partial<User>): Promise<User> {
    if (payload) {
      return (await sql<User[]>`INSERT INTO users ${sql(payload)} RETURNING *`)[0];
    }
    return (await sql<User[]>`INSERT INTO users DEFAULT VALUES RETURNING *`)[0];
  }

  async createUserWithEverything(
    key: Pick<Key, 'kind' | 'identification' | 'secret'>,
    session: Session,
    user?: Partial<UserBase>,
  ): Promise<Everything> {
    return sql.begin(async tx => {
      let createdUser: User;
      if (user) {
        [createdUser] = await tx<User[]>`INSERT INTO users ${sql(user)} RETURNING *`;
      } else {
        [createdUser] = await tx<User[]>`INSERT INTO users DEFAULT VALUES RETURNING *`;
      }
      const keyData: Partial<Key> = { ...key, userId: createdUser.id };
      const [createdKey] = await tx<Key[]>`INSERT INTO keys ${sql(keyData)} RETURNING *`;
      const sessionData: Partial<Session> = {
        ...session,
        userId: createdUser.id,
        keyId: createdKey.id,
      };
      delete sessionData.id;
      const [createdSession] = await tx<Session[]>`INSERT INTO sessions ${sql(sessionData)} RETURNING *`;
      return { user: createdUser, key: createdKey, session: createdSession };
    });
  }

  async updateUser(id: number, update: Partial<UserBase>): Promise<User | null> {
    return (await sql<User[]>`UPDATE users SET ${sql(update)} WHERE id = ${id} RETURNING *`)[0];
  }

  async deleteAllSessions(userId: number): Promise<void> {
    await sql`DELETE FROM sessions WHERE user_id = ${userId}`;
  }

  async deleteExpiredSessions(): Promise<void> {
    await sql`DELETE FROM sessions WHERE expires_at < NOW()`;
  }

  async deleteKey(id: number): Promise<void> {
    await sql`DELETE FROM keys WHERE id = ${id}`;
  }

  async deleteSession(id: number): Promise<void> {
    await sql`DELETE FROM sessions WHERE id = ${id}`;
  }

  async deleteSessionByIdToken(id: number, token: string): Promise<void> {
    await sql`DELETE FROM sessions WHERE id = ${id} AND token = ${token}`;
  }

  async findKeyByIdentification(key: Pick<Key, 'kind' | 'identification'>): Promise<Key | null> {
    return (
      await sql<Key[]>`SELECT * FROM keys WHERE kind = ${key.kind} AND identification = ${key.identification}`
    )[0];
  }

  async findKeyByUserId(key: Pick<Key, 'kind' | 'userId'>): Promise<Key | null> {
    return (await sql<Key[]>`SELECT * FROM keys WHERE kind = ${key.kind} AND user_id = ${key.userId}`)[0];
  }

  async getAllKeys(userId: number): Promise<Key[]> {
    return sql<Key[]>`SELECT * FROM keys WHERE user_id = ${userId}`;
  }

  async getAllSessions(userId: number): Promise<Session[]> {
    return sql<Session[]>`SELECT * FROM sessions WHERE user_id = ${userId}`;
  }

  async getKey(id: number): Promise<Key | null> {
    return (await sql<Key[]>`SELECT * FROM keys WHERE id = ${id}`)[0];
  }

  async getSession(id: number): Promise<Session | null> {
    return (await sql<Session[]>`SELECT * FROM sessions WHERE id = ${id}`)[0];
  }

  async getUser(id: number): Promise<User | null> {
    return (await sql<User[]>`SELECT * FROM users WHERE id = ${id}`)[0];
  }

  async updateKey(id: number, key: Partial<Key>): Promise<Key | null> {
    return (await sql<Key[]>`UPDATE keys SET ${sql(key)} WHERE id = ${id} RETURNING *`)[0];
  }

  async updateSession(id: number, session: Partial<Session>): Promise<Session | null> {
    const [s] = await sql<Session[]>`UPDATE sessions SET ${sql(session)} WHERE id = ${id} RETURNING *`;
    return s;
  }
}
