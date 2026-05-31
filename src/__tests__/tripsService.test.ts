jest.mock('../services/api', () => ({ __esModule: true, default: { get: jest.fn(), post: jest.fn(), put: jest.fn(), patch: jest.fn(), delete: jest.fn() }, handleError: jest.fn((e: unknown) => { throw e; }), USE_MOCK: false }));
jest.mock('@react-native-async-storage/async-storage', () => ({ __esModule: true, default: { getItem: jest.fn().mockResolvedValue(null), setItem: jest.fn().mockResolvedValue(undefined) } }));
import api from '../services/api';
const mockApi = api as jest.Mocked<typeof api>;
beforeEach(() => jest.clearAllMocks());
import { tripsService } from '../services/tripsService';
const mockTrip = { _id:'t1', title:'Trip', description:'Desc' };
describe('tripsService.getAll', () => {
  test('returns all trips', async () => { mockApi.get.mockResolvedValueOnce({ data: [mockTrip] }); expect(Array.isArray(await tripsService.getAll())).toBe(true); });
  test('returns empty for null', async () => { mockApi.get.mockResolvedValueOnce({ data: null }); expect(await tripsService.getAll()).toEqual([]); });
  test('throws on error', async () => { mockApi.get.mockRejectedValueOnce(new Error('fail')); await expect(tripsService.getAll()).rejects.toThrow(); });
});
describe('tripsService.getById', () => {
  test('returns trip by ID', async () => { mockApi.get.mockResolvedValueOnce({ data: mockTrip }); expect((await tripsService.getById('t1'))._id).toBe('t1'); });
});
describe('tripsService.create', () => {
  test('creates trip', async () => { mockApi.post.mockResolvedValueOnce({ data: mockTrip }); await expect(tripsService.create({} as never)).resolves.not.toThrow(); });
});
describe('tripsService.update', () => {
  test('updates trip', async () => { mockApi.put.mockResolvedValueOnce({ data: mockTrip }); await expect(tripsService.update('t1', {} as never)).resolves.not.toThrow(); });
});
describe('tripsService.delete', () => {
  test('deletes trip', async () => { mockApi.delete.mockResolvedValueOnce({ data: {} }); await expect(tripsService.delete('t1')).resolves.not.toThrow(); });
});

describe('tripsService.getWithApplications', () => {
  test('returns trips with applications', async () => { mockApi.get.mockResolvedValueOnce({ data: [mockTrip] }); expect(Array.isArray(await tripsService.getWithApplications())).toBe(true); });
});
describe('tripsService.getApplications', () => {
  test('returns applications', async () => { mockApi.get.mockResolvedValueOnce({ data: [] }); expect(Array.isArray(await tripsService.getApplications('t1'))).toBe(true); });
});
describe('tripsService.apply', () => {
  test('applies to trip', async () => { mockApi.post.mockResolvedValueOnce({ data: {} }); await expect(tripsService.apply('t1')).resolves.not.toThrow(); });
  test('throws on error', async () => { mockApi.post.mockRejectedValueOnce(new Error('fail')); await expect(tripsService.apply('t1')).rejects.toThrow(); });
});
