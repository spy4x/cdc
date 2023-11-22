interface Data<T = unknown> {
  value: T;
  meta: {
    expireAt: number;
  };
}

/** Simple cache service class. Operations are async (to be able to replace with redis or other cache service), but right now they are sync, since current implementation is "in-memory". */
export class CacheService {
  public inMemory: Map<string, Data> = new Map();

  public async get<T>(key: string): Promise<null | T> {
    const data = this.inMemory.get(key);
    if (!data) {
      return null;
    }
    if (data.meta.expireAt < Date.now()) {
      this.inMemory.delete(key);
      return null;
    }
    return data.value as T;
  }

  public async set<T>(key: string, value: T, ttlMs: number): Promise<void> {
    this.inMemory.set(key, {
      value,
      meta: {
        expireAt: Date.now() + ttlMs,
      },
    });
  }

  public async delete(key: string): Promise<void> {
    this.inMemory.delete(key);
  }

  public async wrap<T>(key: string, fn: () => Promise<T>, ttlMs: number): Promise<T> {
    const data = this.inMemory.get(key);
    if (data && data.meta.expireAt >= Date.now()) {
      return data.value as T;
    }
    const value = await fn();
    this.set(key, value, ttlMs);
    return value;
  }

  public async reset(): Promise<void> {
    this.inMemory = new Map();
  }
}

export const cache = new CacheService();
