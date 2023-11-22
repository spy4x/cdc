/** Mock of cache service instance, for future use in tests  */
export const cacheMock = {
  get: jest.fn(),
  set: jest.fn(),
  delete: jest.fn(),
  wrap: jest.fn(),
  reset: jest.fn(),
};
