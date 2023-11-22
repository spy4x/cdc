import {cacheMock} from './cache.service.mock.spec';

jest.mock('./cache.service', () => ({
  cache: cacheMock,
}));

import {publicAPICache} from './publicApiCache.service';

describe(publicAPICache.constructor.name, () => {

  describe(publicAPICache.userIdByJWT.name, () => {
    it('calls cache.wrap', async () => {
      await publicAPICache.userIdByJWT.wrap('jwt', () => 'value', 10);
      expect(cacheMock.wrap).toBeCalledTimes(1);
    });
  });

  describe(publicAPICache.isJWTExpired.name, () => {
    it('calls cache.wrap', async () => {
      await publicAPICache.isJWTExpired.wrap('jwt', () => 'value', 10);
      expect(cacheMock.wrap).toBeCalledTimes(1);
    });
  });

  describe(publicAPICache.user.name, () => {
    it('calls cache.wrap', async () => {
      await publicAPICache.user.wrap('id', () => 'value', 10);
      expect(cacheMock.wrap).toBeCalledTimes(1);
    });
  });

  describe(publicAPICache.usersOnlineNum.name, () => {
    it('calls cache.wrap', async () => {
      await publicAPICache.usersOnlineNum.wrap('id', () => 'value', 10);
      expect(cacheMock.wrap).toBeCalledTimes(1);
    });
  });

  describe(publicAPICache.adminStats.name, () => {
    it('calls cache.wrap', async () => {
      await publicAPICache.adminStats.wrap('id', () => 'value', 10);
      expect(cacheMock.wrap).toBeCalledTimes(1);
    });
  });

  describe(publicAPICache.tasks.name, () => {
    it('calls cache.wrap', async () => {
      await publicAPICache
        .tasks
        .wrap('id', () => 'value', 10);
      expect(cacheMock.wrap).toBeCalledTimes(1);
    }
    );
  }
  );

  describe(publicAPICache.chatEroticLevels.name, () => {
    it('calls cache.wrap', async () => {
      await publicAPICache
        .chatEroticLevels
        .wrap('id', () => 'value', 10);
      expect(cacheMock.wrap).toBeCalledTimes(1);
    }
    );
  }
  );
