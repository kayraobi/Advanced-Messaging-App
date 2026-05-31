jest.mock('../services/api', () => ({ __esModule: true, default: { get: jest.fn(), post: jest.fn(), put: jest.fn(), patch: jest.fn(), delete: jest.fn() }, handleError: jest.fn((e: unknown) => { throw e; }), USE_MOCK: false }));
jest.mock('@react-native-async-storage/async-storage', () => ({ __esModule: true, default: { getItem: jest.fn().mockResolvedValue(null), setItem: jest.fn().mockResolvedValue(undefined) } }));
import api from '../services/api';
const mockApi = api as jest.Mocked<typeof api>;
beforeEach(() => jest.clearAllMocks());
import { sponsorsService } from '../services/sponsorsService';
const mockSponsor = { _id:'sp1', name:'Sponsor', logo:'https://x.com/logo.png' };
describe('sponsorsService.getAll', () => {
  test('returns all sponsors', async () => { mockApi.get.mockResolvedValueOnce({ data: [mockSponsor] }); expect(Array.isArray(await sponsorsService.getAll())).toBe(true); });
  test('returns empty for null', async () => { mockApi.get.mockResolvedValueOnce({ data: null }); expect(await sponsorsService.getAll()).toEqual([]); });
  test('throws on error', async () => { mockApi.get.mockRejectedValueOnce(new Error('fail')); await expect(sponsorsService.getAll()).rejects.toThrow(); });
});
describe('sponsorsService.getById', () => {
  test('returns sponsor by ID', async () => { mockApi.get.mockResolvedValueOnce({ data: mockSponsor }); expect((await sponsorsService.getById('sp1'))._id).toBe('sp1'); });
});
describe('sponsorsService.create', () => {
  test('creates sponsor', async () => { mockApi.post.mockResolvedValueOnce({ data: mockSponsor }); await expect(sponsorsService.create({} as never)).resolves.not.toThrow(); });
});
describe('sponsorsService.update', () => {
  test('updates sponsor', async () => { mockApi.put.mockResolvedValueOnce({ data: mockSponsor }); await expect(sponsorsService.update('sp1', {} as never)).resolves.not.toThrow(); });
});
describe('sponsorsService.delete', () => {
  test('deletes sponsor', async () => { mockApi.delete.mockResolvedValueOnce({ data: {} }); await expect(sponsorsService.delete('sp1')).resolves.not.toThrow(); });
});
