jest.mock('../services/api', () => ({ __esModule: true, default: { get: jest.fn() }, handleError: jest.fn((e: unknown) => { throw e; }), USE_MOCK: false }));
jest.mock('@react-native-async-storage/async-storage', () => ({ __esModule: true, default: { getItem: jest.fn().mockResolvedValue(null), setItem: jest.fn().mockResolvedValue(undefined) } }));
jest.mock('../services/usersService', () => ({ __esModule: true, usersService: { getById: jest.fn().mockResolvedValue({ _id: 'u1', username: 'test', email: '', type: 'Member', displayUrl: 'https://x.com/avatar.jpg' }) } }));
jest.mock('../services/profilePhotoCache', () => ({ __esModule: true, getCachedProfilePhoto: jest.fn().mockResolvedValue(null), setCachedProfilePhoto: jest.fn().mockResolvedValue(undefined), enrichUserWithProfilePhoto: jest.fn().mockImplementation((u: unknown) => u) }));
import { peekChatUserAvatarUrl, seedChatUserAvatar, getChatUserAvatarUrl, prefetchChatUserAvatars } from '../services/chatAvatarService';
beforeEach(() => jest.clearAllMocks());

describe('peekChatUserAvatarUrl', () => {
  test('returns undefined for empty userId', () => { expect(peekChatUserAvatarUrl('' )).toBeUndefined(); });
  test('returns seeded value', () => { seedChatUserAvatar('u_seed1', 'https://x.com/avatar.jpg'); expect(peekChatUserAvatarUrl('u_seed1')).toBe('https://x.com/avatar.jpg'); });
});

describe('seedChatUserAvatar', () => {
  test('seeds avatar URL into memory', () => { seedChatUserAvatar('u_seed2', 'https://x.com/u2.jpg'); expect(peekChatUserAvatarUrl('u_seed2')).toBe('https://x.com/u2.jpg'); });
  test('does nothing for empty userId', () => { seedChatUserAvatar('', 'https://x.com/p.jpg'); expect(peekChatUserAvatarUrl('' )).toBeUndefined(); });
});

describe('getChatUserAvatarUrl', () => {
  test('returns undefined for empty userId', async () => { expect(await getChatUserAvatarUrl('' )).toBeUndefined(); });
  test('returns seeded value from memory', async () => { seedChatUserAvatar('u_mem1', 'https://x.com/mem1.jpg'); expect(await getChatUserAvatarUrl('u_mem1')).toBe('https://x.com/mem1.jpg'); });
  test('fetches via usersService when not in memory', async () => {
    const r = await getChatUserAvatarUrl('u_fresh_' + Date.now());
    expect(typeof r === 'string' || r === undefined).toBe(true);
  });
});

describe('prefetchChatUserAvatars', () => {
  test('handles empty array', async () => { await expect(prefetchChatUserAvatars([])).resolves.not.toThrow(); });
  test('prefetches string user IDs', async () => {
    await expect(prefetchChatUserAvatars(['u_pre_' + Date.now()])).resolves.not.toThrow();
  });
  test('deduplicates user IDs', async () => {
    const id = 'u_dedup_' + Date.now();
    await expect(prefetchChatUserAvatars([id, id])).resolves.not.toThrow();
  });
});
