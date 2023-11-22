/** Mock for public API cache */
export const publicAPICacheMock = {
  userIdByJWT: {
    get: jest.fn(),
    set: jest.fn(),
    delete: jest.fn(),
    wrap: jest.fn(),
  },
  isJWTExpired: {
    get: jest.fn(),
    set: jest.fn(),
    delete: jest.fn(),
    wrap: jest.fn(),
  },
  user: {
    get: jest.fn(),
    set: jest.fn(),
    delete: jest.fn(),
    wrap: jest.fn(),
  },
  usersOnlineNum: {
    get: jest.fn(),
    set: jest.fn(),
    delete: jest.fn(),
    wrap: jest.fn(),
  },
  adminStats: {
    get: jest.fn(),
    set: jest.fn(),
    delete: jest.fn(),
    wrap: jest.fn(),
  },
  tasks: {
    get: jest.fn(),
    set: jest.fn(),
    delete: jest.fn(),
    wrap: jest.fn(),
  },
  chatEroticLevels: {
    get: jest.fn(),
    set: jest.fn(),
    delete: jest.fn(),
    wrap: jest.fn(),
  },
};
