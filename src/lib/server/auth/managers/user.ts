import type { Adapter, Everything, IUserManager, KeyBase, SessionBase, User, UserBase } from '../misc';

export class UserManager implements IUserManager {
  constructor(public adapter: Adapter) {}

  create(payload?: Partial<UserBase>): Promise<UserBase> {
    return this.adapter.createUser(payload);
  }

  createWithEverything(
    key: Pick<KeyBase, 'kind' | 'identification' | 'secret'>,
    session: SessionBase,
    user?: Partial<UserBase>,
  ): Promise<Everything> {
    return this.adapter.createUserWithEverything(key, session, user);
  }

  update(id: number, update: Partial<UserBase>): Promise<User | null> {
    return this.adapter.updateUser(id, update);
  }

  get(id: number): Promise<User | null> {
    return this.adapter.getUser(id);
  }
}
