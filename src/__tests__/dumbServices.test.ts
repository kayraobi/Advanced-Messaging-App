jest.mock('../services/api', () => ({ __esModule: true, default: { get: jest.fn(), post: jest.fn(), put: jest.fn(), patch: jest.fn(), delete: jest.fn() }, handleError: jest.fn((e: unknown) => { throw e; }), USE_MOCK: false }));
jest.mock('@react-native-async-storage/async-storage', () => ({ __esModule: true, default: { getItem: jest.fn().mockResolvedValue(null), setItem: jest.fn().mockResolvedValue(undefined), removeItem: jest.fn().mockResolvedValue(undefined), multiRemove: jest.fn().mockResolvedValue(undefined) } }));
jest.mock('socket.io-client', () => ({ __esModule: true, default: jest.fn().mockReturnValue({ on: jest.fn(), off: jest.fn(), emit: jest.fn(), disconnect: jest.fn() }), io: jest.fn() }));
test('all services import without crash', () => {
  expect(() => { require('../services/sponsorsService'); }).not.toThrow();
  expect(() => { require('../services/tripsService'); }).not.toThrow();
  expect(() => { require('../services/qaasService'); }).not.toThrow();
  expect(() => { require('../services/rolesService'); }).not.toThrow();
  expect(() => { require('../services/servicesService'); }).not.toThrow();
  expect(() => { require('../services/placeTypesService'); }).not.toThrow();
  expect(() => { require('../services/serviceTypesService'); }).not.toThrow();
  expect(() => { require('../services/usersService'); }).not.toThrow();
  expect(() => { require('../services/chatAvatarService'); }).not.toThrow();
});
