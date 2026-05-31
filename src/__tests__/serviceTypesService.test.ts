jest.mock('../services/api', () => ({ __esModule: true, default: { get: jest.fn(), post: jest.fn(), put: jest.fn(), patch: jest.fn(), delete: jest.fn() }, handleError: jest.fn((e: unknown) => { throw e; }), USE_MOCK: false }));
jest.mock('@react-native-async-storage/async-storage', () => ({ __esModule: true, default: { getItem: jest.fn().mockResolvedValue(null), setItem: jest.fn().mockResolvedValue(undefined) } }));
import api from '../services/api';
const mockApi = api as jest.Mocked<typeof api>;
beforeEach(() => jest.clearAllMocks());
import { serviceTypesService } from '../services/serviceTypesService';
const mockST = { _id:'st1', name:'Cleaning' };
describe('serviceTypesService.getAll', () => {
  test('returns all', async () => { mockApi.get.mockResolvedValueOnce({ data: [mockST] }); expect(Array.isArray(await serviceTypesService.getAll())).toBe(true); });
  test('returns empty for null', async () => { mockApi.get.mockResolvedValueOnce({ data: null }); expect(await serviceTypesService.getAll()).toEqual([]); });
  test('throws on error', async () => { mockApi.get.mockRejectedValueOnce(new Error('fail')); await expect(serviceTypesService.getAll()).rejects.toThrow(); });
});
describe('serviceTypesService.getById', () => {
  test('returns by ID', async () => { mockApi.get.mockResolvedValueOnce({ data: mockST }); expect((await serviceTypesService.getById('st1'))._id).toBe('st1'); });
});
describe('serviceTypesService.create', () => {
  test('creates', async () => { mockApi.post.mockResolvedValueOnce({ data: mockST }); await expect(serviceTypesService.create({} as never)).resolves.not.toThrow(); });
});
describe('serviceTypesService.update', () => {
  test('updates', async () => { mockApi.put.mockResolvedValueOnce({ data: mockST }); await expect(serviceTypesService.update('st1', {} as never)).resolves.not.toThrow(); });
});
describe('serviceTypesService.delete', () => {
  test('deletes', async () => { mockApi.delete.mockResolvedValueOnce({ data: {} }); await expect(serviceTypesService.delete('st1')).resolves.not.toThrow(); });
});
