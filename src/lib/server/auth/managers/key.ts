import type { Adapter, IKeyManager, Key, KeyBase } from '../misc';

export class KeyManager implements IKeyManager {
  constructor(public adapter: Adapter) {}

  async get(keyId: number): Promise<null | Key> {
    return this.adapter.getKey(keyId);
  }

  async getAll(userId: number): Promise<Key[]> {
    return this.adapter.getAllKeys(userId);
  }

  async findByIdentification(key: Pick<KeyBase, 'kind' | 'identification'>): Promise<null | Key> {
    return this.adapter.findKeyByIdentification(key);
  }

  async findByUserId(key: Pick<KeyBase, 'kind' | 'userId'>): Promise<null | Key> {
    return this.adapter.findKeyByUserId(key);
  }

  async create(key: Pick<KeyBase, 'userId' | 'kind' | 'identification' | 'secret'>): Promise<null | Key> {
    return this.adapter.createKey(key);
  }

  async update(keyId: number, key: Partial<KeyBase>): Promise<null | Key> {
    return this.adapter.updateKey(keyId, key);
  }

  async delete(keyId: number): Promise<void> {
    return this.adapter.deleteKey(keyId);
  }
}
