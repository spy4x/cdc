import type { Cookies } from '@sveltejs/kit';

export interface BaseModel {
  id: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserBase extends BaseModel {
  email: string | null;
  firstName: string | null;
  lastName: string | null;
  photoUrl: string | null;
}
export interface User extends UserBase {}

export enum KeyKind {
  EMAIL = 0,
  RESET_PASSWORD_TOKEN = 1,
  GOOGLE = 2,
  FACEBOOK = 3,
  ANON = 4,
  // more to come
}

export interface KeyBase {
  userId: number;
  kind: KeyKind;
  /** Email address, google id, facebook id, token value etc */
  identification: string;
  /** Password hash or similar value */
  secret?: null | string;
}
export interface Key extends KeyBase, BaseModel {}

export interface SessionBase {
  token: string;
  userId: number;
  keyId: number;
  expiresAt?: null | Date;
}
export interface Session extends SessionBase, BaseModel {}

export interface Everything {
  user: User;
  key: Key;
  session: Session;
}

export interface Adapter {
  getUser(id: number): Promise<null | User>;
  createUser(payload?: Partial<User>): Promise<User>;
  createUserWithEverything(
    key: Pick<KeyBase, 'kind' | 'identification' | 'secret'>,
    session: SessionBase,
    user?: Partial<UserBase>,
  ): Promise<Everything>;
  updateUser(id: number, update: Partial<UserBase>): Promise<null | User>;

  getKey(id: number): Promise<null | Key>;
  getAllKeys(userId: number): Promise<Key[]>;
  createKey(key: Pick<KeyBase, 'userId' | 'kind' | 'identification' | 'secret'>): Promise<null | Key>;
  deleteKey(id: number): Promise<void>;
  updateKey(id: number, key: Partial<KeyBase>): Promise<null | Key>;
  findKeyByIdentification(key: Pick<KeyBase, 'kind' | 'identification'>): Promise<null | Key>;
  findKeyByUserId(key: Pick<Key, 'kind' | 'userId'>): Promise<null | Key>;

  getSession(id: number): Promise<null | Session>;
  getAllSessions(userId: number): Promise<Session[]>;
  createSession(session: Pick<SessionBase, 'token' | 'userId' | 'keyId' | 'expiresAt'>): Promise<null | Session>;
  updateSession(id: number, session: Partial<SessionBase>): Promise<null | Session>;
  deleteSession(id: number): Promise<void>;
  deleteSessionByIdToken(id: number, token: string): Promise<void>;
  deleteAllSessions(userId: number): Promise<void>;
  deleteExpiredSessions(): Promise<void>;
}

export interface IUserManager {
  get(id: number): Promise<null | User>;
  create(payload?: Partial<UserBase>): Promise<User>;
  createWithEverything(
    key: Pick<KeyBase, 'kind' | 'identification' | 'secret'>,
    session: SessionBase,
    user?: Partial<UserBase>,
  ): Promise<Everything>;
  update(id: number, user: Partial<UserBase>): Promise<null | User>;
}

export interface ISessionManager {
  get(id: number): Promise<null | Session>;
  getAll(userId: number): Promise<Session[]>;
  validate(sessionIdToken: string): Promise<null | Session>;
  getIdTokenForCookie(session: Session): string;
  parseSessionIdToken(sessionIdToken: string): null | { id: number; token: string };
  createBody(session: Pick<SessionBase, 'userId' | 'keyId'>): SessionBase;
  create(session: Pick<SessionBase, 'userId' | 'keyId'>): Promise<null | Session>;
  update(id: number, session: Partial<SessionBase>): Promise<null | Session>;
  delete(sessionIdToken: string): Promise<boolean>;
  deleteAll(userId: number): Promise<void>;
  deleteExpired(): Promise<void>;
}

export interface IKeyManager {
  get(keyId: number): Promise<null | Key>;
  getAll(userId: number): Promise<Key[]>;
  findByIdentification(key: Pick<KeyBase, 'kind' | 'identification'>): Promise<null | Key>;
  findByUserId(key: Pick<KeyBase, 'kind' | 'userId'>): Promise<null | Key>;
  create(key: Pick<KeyBase, 'userId' | 'kind' | 'identification' | 'secret'>): Promise<null | Key>;
  update(keyId: number, key: Partial<KeyBase>): Promise<null | Key>;
  delete(keyId: number): Promise<void>;
}

export interface IAnonProvider {
  signUp(): Promise<Everything>;
}

export interface IEmailProvider {
  signUp(email: string, password: string): Promise<Everything>;
  signIn(email: string, password: string): Promise<null | Everything>;
  attach(userId: number, email: string, password: string): Promise<Key>;
  getUserByEmail(email: string): Promise<null | User>;
  createPasswordResetToken(email: string): Promise<null | Key>;
  validatePasswordResetToken(token: string, newPassword: string): Promise<null | Session>;
  isEmailTaken(email: string): Promise<boolean>;
  changePassword(userId: number, oldPassword: string, newPassword: string): Promise<null | Session>;
  hashPassword(password: string): Promise<string>;
  checkPassword(password: string, hash: string): Promise<boolean>;
}

export interface IGoogleProvider {
  getRedirectURL(cookies: Cookies): string;
}

export interface IFacebookProvider {
  getRedirectURL(cookies: Cookies): string;
}
