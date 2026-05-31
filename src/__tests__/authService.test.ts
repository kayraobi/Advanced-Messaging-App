jest.mock('../services/api', () => ({
  __esModule: true,
  default: { get: jest.fn(), post: jest.fn(), put: jest.fn(), patch: jest.fn(), delete: jest.fn() },
  handleError: jest.fn((e: unknown) => { throw e; }),
  USE_MOCK: false,
}));
jest.mock('@react-native-async-storage/async-storage', () => ({
  __esModule: true,
  default: {
    getItem: jest.fn().mockResolvedValue(null),
    setItem: jest.fn().mockResolvedValue(undefined),
    removeItem: jest.fn().mockResolvedValue(undefined),
    multiRemove: jest.fn().mockResolvedValue(undefined),
  }
}));
jest.mock('jwt-decode', () => ({
  __esModule: true,
  jwtDecode: jest.fn().mockReturnValue({ exp: Date.now() / 1000 + 3600, _id: 'u1', username: 'testuser' }),
}));

import api from '../services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authService } from '../services/authService';

const mockApi = api as jest.Mocked<typeof api>;
const mockStorage = AsyncStorage as jest.Mocked<typeof AsyncStorage>;

beforeEach(() => jest.clearAllMocks());

describe('authService.getStoredUser', () => {
  test('returns null when no stored data', async () => {
    mockStorage.getItem.mockResolvedValue(null);
    expect(await authService.getStoredUser()).toBeNull();
  });
  test('returns null when no token', async () => {
    mockStorage.getItem.mockImplementation((key: string) =>
      key === 'auth_user' ? Promise.resolve(JSON.stringify({ _id: 'u1', username: 'test' })) : Promise.resolve(null)
    );
    expect(await authService.getStoredUser()).toBeNull();
  });
});

describe('authService.logout', () => {
  test('removes auth keys from storage', async () => {
    await authService.logout();
    expect(mockStorage.multiRemove).toHaveBeenCalledWith(['auth_token', 'auth_user']);
  });
});

describe('authService.isAuthenticated', () => {
  test('returns false when nothing stored', async () => {
    expect(await authService.isAuthenticated()).toBe(false);
  });
});

describe('authService.getMe', () => {
  test('returns null on error', async () => {
    mockApi.get.mockRejectedValueOnce(new Error('network'));
    expect(await authService.getMe()).toBeNull();
  });
  test('returns null for empty response', async () => {
    mockApi.get.mockResolvedValueOnce({ data: null });
    expect(await authService.getMe()).toBeNull();
  });
});

describe('authService.updateMyInterests', () => {
  test('posts interests', async () => {
    mockApi.post.mockResolvedValueOnce({ data: { interests: ['Sports'] } });
    await authService.updateMyInterests(['Sports']);
    expect(mockApi.post).toHaveBeenCalled();
  });
  test('throws on error', async () => {
    mockApi.post.mockRejectedValueOnce(new Error('fail'));
    await expect(authService.updateMyInterests(['Sports'])).rejects.toThrow();
  });
});

describe('authService.register', () => {
  test('calls POST /api/users', async () => {
    mockApi.post.mockResolvedValueOnce({ data: { token: 'tok', user: { _id:'u1', username:'test', email:'t@t.com' } } });
    await expect(authService.register({ username:'test', email:'t@t.com', password:'pass' })).resolves.not.toThrow();
  });
  test('throws on error', async () => {
    mockApi.post.mockRejectedValueOnce(new Error('fail'));
    await expect(authService.register({ username:'x', email:'x@x.com', password:'p' })).rejects.toThrow();
  });
});

describe('authService.mergeStoredUser', () => {
  test('returns null when no stored user', async () => { expect(await authService.mergeStoredUser({})).toBeNull(); });
});

describe('authService.buildProfilePhotoPayload', () => {
  test('builds payload with field names', () => {
    const r = authService.buildProfilePhotoPayload('https://x.com/p.jpg');
    expect(typeof r).toBe('object');
    expect(r.displayUrl).toBe('https://x.com/p.jpg');
  });
});
