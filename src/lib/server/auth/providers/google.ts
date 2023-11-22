import type { Cookies } from '@sveltejs/kit';
import type { Everything, IGoogleProvider, IKeyManager, ISessionManager, IUserManager, User, UserBase } from '../misc';
import { KeyKind } from '../misc';
import { getRandomStringSecure } from '@server/helpers';
import { setSession } from '..';

const GOOGLE_AUTH_COOKIE_NAME = 'google_auth_state';

interface GoogleUser {
  /** unique id */
  sub: string;
  email: string;
  email_verified: boolean;
  /** full name */
  name: string;
  /** given_name = first name */
  given_name: string;
  /** family_name = last name */
  family_name: string;
  /** picture url */
  picture: string;
  locale: string;
  /** hd = hosted domain */
  hd: string;
}

export class GoogleProvider implements IGoogleProvider {
  constructor(
    public user: IUserManager,
    public key: IKeyManager,
    public session: ISessionManager,
    public clientId: string,
    public clientSecret: string,
    public redirectUri: string,
  ) {}

  getRedirectURL(cookies: Cookies): string {
    const state = getRandomStringSecure(32);

    const url = new URL('https://accounts.google.com/o/oauth2/v2/auth');
    url.searchParams.set('client_id', this.clientId);
    url.searchParams.set('redirect_uri', this.redirectUri);
    url.searchParams.set('response_type', 'code');
    url.searchParams.set('scope', 'email profile');
    url.searchParams.set('state', state);

    cookies.set(GOOGLE_AUTH_COOKIE_NAME, state, {
      path: '/',
      maxAge: 60 * 60,
      httpOnly: true,
    });

    return url.toString();
  }

  async validate(code: string, state: string, cookies: Cookies): Promise<Everything> {
    const storedState = cookies.get(GOOGLE_AUTH_COOKIE_NAME);
    if (!state || !storedState || state !== storedState || !code) {
      throw new Error('invalid state');
    }

    const url = new URL('https://oauth2.googleapis.com/token');
    url.searchParams.set('client_id', this.clientId);
    url.searchParams.set('client_secret', this.clientSecret);
    url.searchParams.set('code', code);
    url.searchParams.set('grant_type', 'authorization_code');
    url.searchParams.set('redirect_uri', this.redirectUri);

    const res = await fetch(url.toString(), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });
    const token: { access_token: string } = await res.json();
    if (!token.access_token) {
      console.error('Invalid token:', JSON.stringify(token, null, 4));
      throw new Error('Invalid token');
    }

    const googleUser: GoogleUser = await fetch('https://www.googleapis.com/oauth2/v3/userinfo?alt=json', {
      headers: {
        Authorization: `Bearer ${token.access_token}`,
      },
    }).then(res => res.json());
    if (!googleUser.sub) {
      console.error('Invalid user:', JSON.stringify(googleUser, null, 4));
      throw new Error('Invalid user');
    }

    const existingKey = await this.key.findByIdentification({
      identification: googleUser.sub,
      kind: KeyKind.GOOGLE,
    });
    if (existingKey) {
      const [existingUser, s] = await Promise.all([
        this.user.get(existingKey.userId),
        this.session.create({
          userId: existingKey.userId,
          keyId: existingKey.id,
        }),
      ]);
      if (!existingUser || !s) {
        throw new Error('Failed to create session');
      }
      const update: Partial<Pick<UserBase, 'email' | 'firstName' | 'lastName' | 'photoUrl'>> = {};
      if (!existingUser.email && googleUser.email) {
        update.email = googleUser.email;
      }
      if (!existingUser.firstName && googleUser.given_name) {
        update.firstName = googleUser.given_name;
      }
      if (!existingUser.lastName && googleUser.family_name) {
        update.lastName = googleUser.family_name;
      }
      if (!existingUser.photoUrl && googleUser.picture) {
        update.photoUrl = googleUser.picture;
      }

      let updatedUser: null | User = existingUser;
      if (Object.keys(update).length > 0) {
        updatedUser = await this.user.update(existingUser.id, update);
      }

      cookies.set(GOOGLE_AUTH_COOKIE_NAME, '', {
        path: '/',
        maxAge: 0,
        httpOnly: true,
      });

      return {
        user: updatedUser || existingUser,
        key: existingKey,
        session: s,
      };
    } else {
      const u = await this.user.create({
        email: googleUser.email || null,
        firstName: googleUser.given_name || null,
        lastName: googleUser.family_name || null,
        photoUrl: googleUser.picture || null,
      });
      if (!u) {
        throw new Error('Failed to create user');
      }
      const k = await this.key.create({
        userId: u.id,
        kind: KeyKind.GOOGLE,
        identification: googleUser.sub,
        secret: null,
      });
      if (!k) {
        throw new Error('Failed to create key');
      }
      const s = await this.session.create({
        userId: u.id,
        keyId: k.id,
      });
      if (!s) {
        throw new Error('Failed to create session');
      }
      setSession(cookies, s);
      cookies.set(GOOGLE_AUTH_COOKIE_NAME, '', {
        path: '/',
        maxAge: 0,
        httpOnly: true,
      });
      return {
        user: u,
        key: k,
        session: s,
      };
    }
  }
}
