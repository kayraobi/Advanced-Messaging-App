jest.mock('../services/api', () => ({ __esModule: true, default: { get: jest.fn(), post: jest.fn(), put: jest.fn(), patch: jest.fn(), delete: jest.fn() }, handleError: jest.fn((e: unknown) => { throw e; }), USE_MOCK: false }));
jest.mock('@react-native-async-storage/async-storage', () => ({ __esModule: true, default: { getItem: jest.fn().mockResolvedValue(null), setItem: jest.fn().mockResolvedValue(undefined) } }));
import api from '../services/api';
const mockApi = api as jest.Mocked<typeof api>;
beforeEach(() => jest.clearAllMocks());
import { qaasService } from '../services/qaasService';
const mockQa = { _id:'q1', question:'What?', answer:'This.' };
describe('qaasService.getAll', () => {
  test('returns all Q&As', async () => { mockApi.get.mockResolvedValueOnce({ data: [mockQa] }); expect(Array.isArray(await qaasService.getAll())).toBe(true); });
  test('returns empty for null', async () => { mockApi.get.mockResolvedValueOnce({ data: null }); expect(await qaasService.getAll()).toEqual([]); });
  test('throws on error', async () => { mockApi.get.mockRejectedValueOnce(new Error('fail')); await expect(qaasService.getAll()).rejects.toThrow(); });
});
describe('qaasService.getById', () => {
  test('returns Q&A by ID', async () => { mockApi.get.mockResolvedValueOnce({ data: mockQa }); expect((await qaasService.getById('q1'))._id).toBe('q1'); });
});
describe('qaasService.create', () => {
  test('creates Q&A', async () => { mockApi.post.mockResolvedValueOnce({ data: mockQa }); await expect(qaasService.create({} as never)).resolves.not.toThrow(); });
});
describe('qaasService.update', () => {
  test('updates Q&A', async () => { mockApi.put.mockResolvedValueOnce({ data: mockQa }); await expect(qaasService.update('q1', {} as never)).resolves.not.toThrow(); });
});
describe('qaasService.delete', () => {
  test('deletes Q&A', async () => { mockApi.delete.mockResolvedValueOnce({ data: {} }); await expect(qaasService.delete('q1')).resolves.not.toThrow(); });
});
