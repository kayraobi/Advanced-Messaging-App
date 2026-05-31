jest.mock('../services/api', () => ({ __esModule: true, default: { get: jest.fn(), post: jest.fn(), put: jest.fn(), patch: jest.fn(), delete: jest.fn() }, handleError: jest.fn((e: unknown) => { throw e; }), USE_MOCK: false }));
jest.mock('@react-native-async-storage/async-storage', () => ({ __esModule: true, default: { getItem: jest.fn().mockResolvedValue(null), setItem: jest.fn().mockResolvedValue(undefined) } }));
import api from '../services/api';
const mockApi = api as jest.Mocked<typeof api>;
beforeEach(() => jest.clearAllMocks());
import { servicesService } from '../services/servicesService';
const mockSvc = { _id:'s1', name:'Test Service', description:'Desc' };
describe('servicesService.getAll', () => {
  test('returns all services', async () => { mockApi.get.mockResolvedValueOnce({ data: [mockSvc] }); expect(Array.isArray(await servicesService.getAll())).toBe(true); });
  test('returns empty for null', async () => { mockApi.get.mockResolvedValueOnce({ data: null }); expect(await servicesService.getAll()).toEqual([]); });
  test('throws on error', async () => { mockApi.get.mockRejectedValueOnce(new Error('fail')); await expect(servicesService.getAll()).rejects.toThrow(); });
});
describe('servicesService.getById', () => {
  test('returns service by ID', async () => { mockApi.get.mockResolvedValueOnce({ data: mockSvc }); expect((await servicesService.getById('s1'))._id).toBe('s1'); });
});
describe('servicesService.create', () => {
  test('creates service', async () => { mockApi.post.mockResolvedValueOnce({ data: mockSvc }); await expect(servicesService.create({} as never)).resolves.not.toThrow(); });
});
describe('servicesService.update', () => {
  test('updates service', async () => { mockApi.put.mockResolvedValueOnce({ data: mockSvc }); await expect(servicesService.update('s1', {} as never)).resolves.not.toThrow(); });
});
describe('servicesService.delete', () => {
  test('deletes service', async () => { mockApi.delete.mockResolvedValueOnce({ data: {} }); await expect(servicesService.delete('s1')).resolves.not.toThrow(); });
});
