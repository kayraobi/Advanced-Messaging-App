jest.mock('../services/api', () => ({ __esModule: true, default: { get: jest.fn(), post: jest.fn(), put: jest.fn(), patch: jest.fn(), delete: jest.fn() }, handleError: jest.fn((e: unknown) => { throw e; }), USE_MOCK: false }));
jest.mock('@react-native-async-storage/async-storage', () => ({ __esModule: true, default: { getItem: jest.fn().mockResolvedValue(null), setItem: jest.fn().mockResolvedValue(undefined) } }));
import api from '../services/api';
const mockApi = api as jest.Mocked<typeof api>;
beforeEach(() => jest.clearAllMocks());
import { placeTypesService } from '../services/placeTypesService';
const mockPT = { _id:'pt1', name:'Restaurant' };
describe('placeTypesService.getAll', () => {
  test('returns all', async () => { mockApi.get.mockResolvedValueOnce({ data: [mockPT] }); expect(Array.isArray(await placeTypesService.getAll())).toBe(true); });
  test('throws on error', async () => { mockApi.get.mockRejectedValueOnce(new Error('fail')); await expect(placeTypesService.getAll()).rejects.toThrow(); });
});
describe('placeTypesService.getById', () => {
  test('returns by ID', async () => { mockApi.get.mockResolvedValueOnce({ data: mockPT }); expect((await placeTypesService.getById('pt1'))._id).toBe('pt1'); });
});
describe('placeTypesService.create', () => {
  test('creates', async () => { mockApi.post.mockResolvedValueOnce({ data: mockPT }); await expect(placeTypesService.create({} as never)).resolves.not.toThrow(); });
});
describe('placeTypesService.update', () => {
  test('updates', async () => { mockApi.put.mockResolvedValueOnce({ data: mockPT }); await expect(placeTypesService.update('pt1', {} as never)).resolves.not.toThrow(); });
});
describe('placeTypesService.delete', () => {
  test('deletes', async () => { mockApi.delete.mockResolvedValueOnce({ data: {} }); await expect(placeTypesService.delete('pt1')).resolves.not.toThrow(); });
});
