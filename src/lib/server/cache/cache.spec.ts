import { cache } from './cache.service';

describe(cache.constructor.name, () => {
  beforeEach(async () => cache.reset());

  describe(cache.reset.name, () => {
    it('clears in-memory map', async () => {
      cache.inMemory.set('key', { value: 'value', meta: { expireAt: 0 } });
      await cache.reset();
      expect(cache.inMemory.size).toBe(0);
    });
  });

  describe(cache.get.name, () => {
    it('returns null if it is not in', async () => {
      expect(cache.inMemory.size).toBe(0);
      const result = await cache.get('key');
      expect(result).toBeNull();
    });

    it('returns value if it is in', async () => {
      await cache.set('key', 'value', 10);
      const result = await cache.get('key');
      expect(result).toBe('value');
    });

    it('returns null if value is expired', async () => {
      await cache.set('key', 'value', 10);
      await new Promise(resolve => setTimeout(resolve, 11));
      const result = await cache.get('key');
      expect(result).toBeNull();
    });
  });

  describe(cache.set.name, () => {
    it('sets value', async () => {
      expect(cache.inMemory.size).toBe(0);
      await cache.set('key', 'value', 10);
      expect(cache.inMemory.size).toBe(1);
      expect(await cache.get('key')).toBe('value');
      await new Promise(resolve => setTimeout(resolve, 11));
      expect(await cache.get('key')).toBeNull();
    });

    it('overwrites value', async () => {
      expect(cache.inMemory.size).toBe(0);
      await cache.set('key', 'value', 10);
      expect(cache.inMemory.size).toBe(1);
      expect(await cache.get('key')).toBe('value');
      await cache.set('key', 'value2', 10);
      expect(cache.inMemory.size).toBe(1);
      expect(await cache.get('key')).toBe('value2');
      await new Promise(resolve => setTimeout(resolve, 11));
      expect(await cache.get('key')).toBeNull();
    });
  });

  describe(cache.delete.name, () => {
    it('deletes value', async () => {
      expect(cache.inMemory.size).toBe(0);
      await cache.set('key', 'value', 10);
      expect(cache.inMemory.size).toBe(1);
      expect(await cache.get('key')).toBe('value');
      await cache.delete('key');
      expect(cache.inMemory.size).toBe(0);
      expect(await cache.get('key')).toBeNull();
    });
  });

  describe(cache.wrap.name, () => {
    it('returns value from cache if it is not expired', async () => {
      expect(cache.inMemory.size).toBe(0);
      await cache.set('key', 'value', 10);
      expect(cache.inMemory.size).toBe(1);
      expect(await cache.get('key')).toBe('value');
      const result = await cache.wrap('key', () => Promise.resolve('value2'), 1);
      expect(result).toBe('value');
      expect(cache.inMemory.size).toBe(1);
      expect(await cache.get('key')).toBe('value');
    });

    it('returns value from fn if it is expired', async () => {
      expect(cache.inMemory.size).toBe(0);
      await cache.set('key', 'value', 10);
      expect(cache.inMemory.size).toBe(1);
      expect(await cache.get('key')).toBe('value');
      await new Promise(resolve => setTimeout(resolve, 11));
      const result = await cache.wrap('key', () => Promise.resolve('value2'), 10);
      expect(result).toBe('value2');
      expect(cache.inMemory.size).toBe(1);
      expect(await cache.get('key')).toBe('value2');
    });
  });
});
