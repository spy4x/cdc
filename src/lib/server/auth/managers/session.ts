import type { Adapter, ISessionManager, Session, SessionBase } from '../misc';
import { getRandomStringSecure } from '../../helpers';

export class SessionManager implements ISessionManager {
  constructor(
    public adapter: Adapter,
    public sessionLength: number,
    public sessionDurationMin: number,
  ) {}

  createBody(session: Pick<SessionBase, 'userId' | 'keyId'>): SessionBase {
    return {
      ...session,
      token: getRandomStringSecure(this.sessionLength),
      expiresAt: this.getSessionExpirationDate(),
    };
  }

  async create(session: Pick<SessionBase, 'userId' | 'keyId'>): Promise<null | Session> {
    return this.adapter.createSession(this.createBody(session));
  }

  async validate(sessionIdToken: string): Promise<null | Session> {
    const idToken = this.parseSessionIdToken(sessionIdToken);
    if (!idToken) {
      return null;
    }
    const session = await this.adapter.getSession(idToken.id);
    if (!session) {
      return null;
    }
    if (session.token !== idToken.token) {
      return null;
    }
    if (session.expiresAt && session.expiresAt < new Date()) {
      return null;
    }
    // if expires in less than 1/4 of the duration, update it to extend
    if (session.expiresAt && session.expiresAt < new Date(Date.now() + (this.sessionDurationMin * 60 * 1000) / 4)) {
      const updatedSession = await this.adapter.updateSession(session.id, {
        expiresAt: this.getSessionExpirationDate(),
      });
      if (updatedSession) {
        return updatedSession;
      }
    }
    return session;
  }

  async delete(sessionIdToken: string): Promise<boolean> {
    const idToken = this.parseSessionIdToken(sessionIdToken);
    if (!idToken) {
      return false;
    }
    await this.adapter.deleteSessionByIdToken(idToken.id, idToken.token);
    return true;
  }

  async deleteAll(userId: number): Promise<void> {
    return this.adapter.deleteAllSessions(userId);
  }

  async deleteExpired(): Promise<void> {
    return this.adapter.deleteExpiredSessions();
  }

  async get(id: number): Promise<null | Session> {
    return this.adapter.getSession(id);
  }

  async getAll(userId: number): Promise<Session[]> {
    return this.adapter.getAllSessions(userId);
  }

  async update(id: number, session: Partial<SessionBase>): Promise<null | Session> {
    return this.adapter.updateSession(id, session);
  }

  getIdTokenForCookie(session: Session): string {
    return `${session.id}:${session.token}`;
  }

  parseSessionIdToken(sessionIdToken: string): null | { id: number; token: string } {
    const [sessionIdString, token] = sessionIdToken.split(':');
    if (!sessionIdString || !token) {
      return null;
    }
    const id = parseInt(sessionIdString, 10);
    if (!id) {
      return null;
    }
    return { id, token };
  }

  private getSessionExpirationDate(): Date {
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + this.sessionDurationMin);
    return expiresAt;
  }
}
