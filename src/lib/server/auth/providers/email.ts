import { compare, genSalt, hash as hashPassword } from 'bcrypt';
import type { IEmailProvider, IKeyManager, ISessionManager, IUserManager, User } from '../misc';
import { DEFAULT_SESSION_LENGTH, KeyKind } from '../misc';
import { getRandomStringSecure } from '../../helpers';

export class EmailProvider implements IEmailProvider {
  constructor(
    public user: IUserManager,
    public key: IKeyManager,
    public session: ISessionManager,
    public saltRounds: number,
    public pepper: string,
  ) {}

  async signUp(email: string, password: string) {
    const hash = await this.hashPassword(password);
    return this.user.createWithEverything(
      {
        kind: KeyKind.EMAIL,
        identification: email,
        secret: hash,
      },
      this.session.createBody({ userId: -1, keyId: -1 }),
      {
        email,
      },
    );
  }

  async signIn(email: string, password: string) {
    const k = await this.key.findByIdentification({
      kind: KeyKind.EMAIL,
      identification: email,
    });
    if (!k || !k.secret) {
      return null;
    }
    if (!(await this.checkPassword(password, k.secret))) {
      return null;
    }

    const [existingUser, s] = await Promise.all([
      this.user.get(k.userId),
      this.session.create({
        userId: k.userId,
        keyId: k.id,
      }),
    ]);
    if (!existingUser || !s) {
      return null;
    }
    let updatedUser: null | User = existingUser;
    if (!existingUser.email) {
      updatedUser = await this.user.update(existingUser.id, { email });
    }
    return {
      user: updatedUser || existingUser,
      key: k,
      session: s,
    };
  }

  async attach(userId: number, email: string, password: string) {
    const hash = await this.hashPassword(password);
    const k = await this.key.create({
      userId,
      kind: KeyKind.EMAIL,
      identification: email,
      secret: hash,
    });
    if (!k) {
      throw new Error('Failed to create key');
    }
    return k;
  }

  async getUserByEmail(email: string) {
    const k = await this.key.findByIdentification({
      kind: KeyKind.EMAIL,
      identification: email,
    });
    if (!k) {
      return null;
    }
    return this.user.get(k.userId);
  }

  async createPasswordResetToken(email: string) {
    const k = await this.key.findByIdentification({
      kind: KeyKind.EMAIL,
      identification: email,
    });
    if (!k) {
      return null;
    }
    return this.key.create({
      userId: k.userId,
      kind: KeyKind.RESET_PASSWORD_TOKEN,
      identification: getRandomStringSecure(DEFAULT_SESSION_LENGTH),
    });
  }

  async validatePasswordResetToken(token: string, newPassword: string) {
    const resetPasswordKey = await this.key.findByIdentification({
      kind: KeyKind.RESET_PASSWORD_TOKEN,
      identification: token,
    });
    if (!resetPasswordKey) {
      return null;
    }
    const emailKey = await this.key.findByUserId({
      kind: KeyKind.EMAIL,
      userId: resetPasswordKey.userId,
    });
    if (!emailKey) {
      return null;
    }
    const hash = await this.hashPassword(newPassword);
    await this.key.update(emailKey.id, {
      kind: KeyKind.EMAIL,
      identification: emailKey.identification,
      secret: hash,
    });
    await this.key.delete(resetPasswordKey.id);
    await this.session.deleteAll(resetPasswordKey.userId); // security measure - what if user got hacked and wants to change password, so other sessions are invalidated
    return this.session.create({
      keyId: emailKey.id,
      userId: emailKey.userId,
    });
  }

  async isEmailTaken(email: string) {
    const k = await this.key.findByIdentification({
      kind: KeyKind.EMAIL,
      identification: email,
    });
    return !!k;
  }

  async changePassword(userId: number, oldPassword: string, newPassword: string) {
    const k = await this.key.findByUserId({
      kind: KeyKind.EMAIL,
      userId,
    });
    if (!k || !k.secret) {
      return null;
    }
    if (!(await this.checkPassword(oldPassword, k.secret))) {
      return null;
    }
    const newHash = await this.hashPassword(newPassword);
    await this.key.update(k.id, { secret: newHash });
    await this.session.deleteAll(userId); // security measure - what if user got hacked and wants to change password, so other sessions are invalidated
    return this.session.create({
      userId,
      keyId: k.id,
    });
  }

  async hashPassword(password: string): Promise<string> {
    const salt = await genSalt(this.saltRounds);
    return hashPassword(password + this.pepper, salt);
  }

  async checkPassword(password: string, hash: string): Promise<boolean> {
    return compare(password + this.pepper, hash);
  }
}
