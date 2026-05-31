jest.mock('../services/api', () => ({ __esModule: true, default: { get: jest.fn(), post: jest.fn(), put: jest.fn(), patch: jest.fn(), delete: jest.fn() }, handleError: jest.fn((e: unknown) => { throw e; }), USE_MOCK: false }));
jest.mock('@react-native-async-storage/async-storage', () => ({ __esModule: true, default: { getItem: jest.fn().mockResolvedValue(null), setItem: jest.fn().mockResolvedValue(undefined), removeItem: jest.fn().mockResolvedValue(undefined), multiRemove: jest.fn().mockResolvedValue(undefined) } }));
import api from '../services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
const mockApi = api as jest.Mocked<typeof api>;
const mockStorage = AsyncStorage as jest.Mocked<typeof AsyncStorage>;
beforeEach(() => jest.clearAllMocks());
import { newsService } from '../services/newsService';
const mockNews = { _id:'n1', title:'Test News', content:'Content', createdAt:'2025-01-01' };
describe('newsService.getAll', () => {
  test('returns array', async () => { mockApi.get.mockResolvedValueOnce({ data: [mockNews] }); expect(Array.isArray(await newsService.getAll())).toBe(true); });
  test('returns empty for null', async () => { mockApi.get.mockResolvedValueOnce({ data: null }); expect(await newsService.getAll()).toEqual([]); });
  test('throws on error', async () => { mockApi.get.mockRejectedValueOnce(new Error('fail')); await expect(newsService.getAll()).rejects.toThrow(); });
});
describe('newsService.getLatest', () => {
  test('returns latest news', async () => { mockApi.get.mockResolvedValueOnce({ data: [mockNews] }); expect(Array.isArray(await newsService.getLatest())).toBe(true); });
});
describe('newsService.getById', () => {
  test('returns news item', async () => { mockApi.get.mockResolvedValueOnce({ data: mockNews }); expect((await newsService.getById('n1'))._id).toBe('n1'); });
});

describe('newsService.getSlides', () => {
  test('returns slides array', async () => { mockApi.get.mockResolvedValueOnce({ data: [mockNews] }); expect(Array.isArray(await newsService.getSlides())).toBe(true); });
  test('returns empty for null', async () => { mockApi.get.mockResolvedValueOnce({ data: null }); expect(await newsService.getSlides()).toEqual([]); });
});
describe('newsService.create', () => {
  test('creates news', async () => { mockApi.post.mockResolvedValueOnce({ data: mockNews }); await expect(newsService.create({} as never)).resolves.not.toThrow(); });
});
describe('newsService.update', () => {
  test('updates news', async () => { mockApi.put.mockResolvedValueOnce({ data: mockNews }); await expect(newsService.update('n1', {} as never)).resolves.not.toThrow(); });
});
describe('newsService.delete', () => {
  test('deletes news', async () => { mockApi.delete.mockResolvedValueOnce({ data: {} }); await expect(newsService.delete('n1')).resolves.not.toThrow(); });
});

describe('newsService.deleteImage', () => {
  test('deletes image', async () => { mockApi.delete.mockResolvedValueOnce({ data: {} }); await expect(newsService.deleteImage('n1', 'img1')).resolves.not.toThrow(); });
});
describe('newsService.reorderImages', () => {
  test('reorders images', async () => { mockApi.put.mockResolvedValueOnce({ data: {} }); await expect(newsService.reorderImages('n1', { images: ['img1','img2'] })).resolves.not.toThrow(); });
});
describe('newsService.getPage', () => {
  test('fetches page', async () => { mockApi.get.mockResolvedValueOnce({ data: [mockNews] }); expect(Array.isArray(await newsService.getPage())).toBe(true); });
});
