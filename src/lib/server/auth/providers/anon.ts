import type { IAnonProvider, IKeyManager, ISessionManager, IUserManager } from '../misc';
import { KeyKind } from '../misc';
import { getRandomStringSecure } from '@server/helpers';

export class AnonProvider implements IAnonProvider {
  idLength = 16;

  constructor(
    public user: IUserManager,
    public key: IKeyManager,
    public session: ISessionManager,
  ) {}

  async signUp() {
    return this.user.createWithEverything(
      {
        kind: KeyKind.ANON,
        identification: getRandomStringSecure(this.idLength),
      },
      this.session.createBody({ userId: -1, keyId: -1 }),
    );
  }
}
