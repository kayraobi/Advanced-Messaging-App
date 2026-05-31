jest.mock('../services/api', () => ({ __esModule: true, default: { get: jest.fn(), post: jest.fn(), put: jest.fn(), patch: jest.fn(), delete: jest.fn() }, handleError: jest.fn((e: unknown) => { throw e; }), USE_MOCK: false }));
jest.mock('@react-native-async-storage/async-storage', () => ({ __esModule: true, default: { getItem: jest.fn().mockResolvedValue(null), setItem: jest.fn().mockResolvedValue(undefined), removeItem: jest.fn().mockResolvedValue(undefined), multiRemove: jest.fn().mockResolvedValue(undefined) } }));
import api from '../services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
const mockApi = api as jest.Mocked<typeof api>;
const mockStorage = AsyncStorage as jest.Mocked<typeof AsyncStorage>;
beforeEach(() => jest.clearAllMocks());
import { getCachedProfilePhoto, setCachedProfilePhoto, enrichUserWithProfilePhoto } from '../services/profilePhotoCache';
describe('getCachedProfilePhoto', () => {
  test('returns undefined for empty userId', async () => { expect(await getCachedProfilePhoto('')).toBeUndefined(); });
  test('returns cached URL', async () => { mockStorage.getItem.mockResolvedValueOnce('https://x.com/p.jpg'); expect(await getCachedProfilePhoto('u1')).toBe('https://x.com/p.jpg'); });
});
describe('setCachedProfilePhoto', () => {
  test('stores photo URL', async () => { await setCachedProfilePhoto('u1', 'https://x.com/p.jpg'); expect(mockStorage.setItem).toHaveBeenCalled(); });
  test('skips empty userId', async () => { await setCachedProfilePhoto('', 'https://x.com/p.jpg'); expect(mockStorage.setItem).not.toHaveBeenCalled(); });
});
describe('enrichUserWithProfilePhoto', () => {
  test('returns user as-is when displayUrl set', async () => {
    const user = { _id:'u1', username:'test', email:'', type:'Member', displayUrl:'https://x.com/p.jpg' } as never;
    expect((await enrichUserWithProfilePhoto(user)).displayUrl).toBe('https://x.com/p.jpg');
  });
});
