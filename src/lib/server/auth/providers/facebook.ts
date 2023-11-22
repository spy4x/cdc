import type { Cookies } from '@sveltejs/kit';
import type {
  Everything,
  IFacebookProvider,
  IKeyManager,
  ISessionManager,
  IUserManager,
  User,
  UserBase,
} from '../misc';
import { KeyKind } from '../misc';
import { getRandomStringSecure } from '@server/helpers';
import { setSession } from '..';

const FACEBOOK_AUTH_COOKIE_NAME = 'facebook_auth_state';

interface FacebookUser {
  id: string;
  name: string;
  first_name: string;
  last_name: string;
  email?: string;
  picture: {
    data: {
      height: number;
      is_silhouette: boolean;
      url: string;
      width: number;
    };
  };
}

export class FacebookProvider implements IFacebookProvider {
  constructor(
    public user: IUserManager,
    public key: IKeyManager,
    public session: ISessionManager,
    public appId: string,
    public appSecret: string,
    public redirectUri: string,
  ) {}

  getRedirectURL(cookies: Cookies): string {
    const state = getRandomStringSecure(32);

    const url = new URL('https://www.facebook.com/v16.0/dialog/oauth');
    url.searchParams.set('client_id', this.appId);
    url.searchParams.set('redirect_uri', this.redirectUri);
    url.searchParams.set('response_type', 'code');
    url.searchParams.set('scope', '');
    url.searchParams.set('state', state);

    cookies.set(FACEBOOK_AUTH_COOKIE_NAME, state, {
      path: '/',
      maxAge: 60 * 60,
      httpOnly: true,
    });

    return url.toString();
  }

  async validate(code: string, state: string, cookies: Cookies): Promise<Everything> {
    const storedState = cookies.get(FACEBOOK_AUTH_COOKIE_NAME);
    if (!state || !storedState || state !== storedState || !code) {
      throw new Error('invalid state');
    }

    const url = new URL('https://graph.facebook.com/v16.0/oauth/access_token');
    url.searchParams.set('client_id', this.appId);
    url.searchParams.set('client_secret', this.appSecret);
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

    const fetchUserURL = new URL('https://graph.facebook.com/me');
    fetchUserURL.searchParams.set('fields', 'id,name,first_name,last_name,picture,email');
    const facebookUser: FacebookUser = await fetch(fetchUserURL.toString(), {
      headers: {
        Authorization: `Bearer ${token.access_token}`,
      },
    }).then(res => res.json());
    if (!facebookUser.id) {
      console.error('Invalid user:', JSON.stringify(facebookUser, null, 4));
      throw new Error('Invalid user');
    }
    console.log({ facebookUser });

    const existingKey = await this.key.findByIdentification({
      identification: facebookUser.id,
      kind: KeyKind.FACEBOOK,
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
      if (!existingUser.email && facebookUser.email) {
        update.email = facebookUser.email;
      }
      if (!existingUser.firstName && facebookUser.first_name) {
        update.firstName = facebookUser.first_name;
      }
      if (!existingUser.lastName && facebookUser.last_name) {
        update.lastName = facebookUser.last_name;
      }
      if (!existingUser.photoUrl && facebookUser.picture?.data?.url) {
        update.photoUrl = facebookUser.picture?.data?.url;
      }

      let updatedUser: null | User = existingUser;
      if (Object.keys(update).length > 0) {
        updatedUser = await this.user.update(existingUser.id, update);
      }

      cookies.set(FACEBOOK_AUTH_COOKIE_NAME, '', {
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
        email: facebookUser.email || null,
        firstName: facebookUser.first_name || null,
        lastName: facebookUser.last_name || null,
        photoUrl: facebookUser.picture?.data?.url || null,
      });
      if (!u) {
        throw new Error('Failed to create user');
      }
      const k = await this.key.create({
        userId: u.id,
        kind: KeyKind.FACEBOOK,
        identification: facebookUser.id,
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
      cookies.set(FACEBOOK_AUTH_COOKIE_NAME, '', {
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
