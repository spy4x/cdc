import { KeyManager, SessionManager, UserManager } from './managers';
import { AnonProvider, EmailProvider, FacebookProvider, GoogleProvider } from './providers';
import type { Adapter, IKeyManager, ISessionManager, IUserManager } from './misc';
import {
  DEFAULT_PASSWORD_PEPPER,
  DEFAULT_SALT_ROUNDS,
  DEFAULT_SESSION_DURATION_MIN,
  DEFAULT_SESSION_LENGTH,
} from './misc';
import { env } from '$env/dynamic/private';

class Auth {
  constructor(
    public user: IUserManager,
    public key: IKeyManager,
    public session: ISessionManager,
    public anon: AnonProvider,
    public email: EmailProvider,
    public google: GoogleProvider,
    public facebook: FacebookProvider,
  ) {}
}

interface Options {
  adapter: Adapter;
  passwordPepper?: string;
  passwordSaltRounds?: number;
  sessionLength?: number;
  sessionDurationMin?: number;
}

export function createAuth(options: Options): Auth {
  const pepper = options.passwordPepper || DEFAULT_PASSWORD_PEPPER;
  const saltRounds = options.passwordSaltRounds || DEFAULT_SALT_ROUNDS;
  const sessionLength = options.sessionLength || DEFAULT_SESSION_LENGTH;
  const sessionDurationMin = options.sessionDurationMin || DEFAULT_SESSION_DURATION_MIN;

  const user = new UserManager(options.adapter);
  const session = new SessionManager(options.adapter, sessionLength, sessionDurationMin);
  const key = new KeyManager(options.adapter);

  const email = new EmailProvider(user, key, session, saltRounds, pepper);
  const anon = new AnonProvider(user, key, session);
  const google = new GoogleProvider(
    user,
    key,
    session,
    env.AUTH_GOOGLE_CLIENT_ID,
    env.AUTH_GOOGLE_CLIENT_SECRET,
    env.APP_URL + '/api/users/google/callback',
  );
  const facebook = new FacebookProvider(
    user,
    key,
    session,
    env.AUTH_FACEBOOK_APP_ID,
    env.AUTH_FACEBOOK_APP_SECRET,
    env.APP_URL + '/api/users/facebook/callback',
  );

  return new Auth(user, key, session, anon, email, google, facebook);
}
