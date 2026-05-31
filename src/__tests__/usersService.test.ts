const mockAxiosGet = jest.fn();
const mockAxiosDelete = jest.fn();
jest.mock('axios', () => ({ __esModule: true, default: { get: mockAxiosGet, delete: mockAxiosDelete }, isAxiosError: jest.fn().mockReturnValue(false) }));
jest.mock('../services/api', () => ({ __esModule: true, default: { get: jest.fn(), post: jest.fn(), put: jest.fn(), patch: jest.fn(), delete: jest.fn() }, handleError: jest.fn((e: unknown) => { throw e; }), USE_MOCK: false }));
jest.mock('@react-native-async-storage/async-storage', () => ({ __esModule: true, default: { getItem: jest.fn().mockResolvedValue(null) } }));
import api from '../services/api';
import { usersService } from '../services/usersService';
const mockApi = api as jest.Mocked<typeof api>;
beforeEach(() => jest.clearAllMocks());
const mockUser = { _id: 'u1', username: 'test', email: 'test@test.com', type: 'Member' };

describe('usersService.getAll', () => {
  test('returns all users', async () => { mockAxiosGet.mockResolvedValueOnce({ data: [mockUser] }); expect(Array.isArray(await usersService.getAll())).toBe(true); });
  test('returns from data envelope', async () => { mockAxiosGet.mockResolvedValueOnce({ data: { data: [mockUser] } }); expect(Array.isArray(await usersService.getAll())).toBe(true); });
  test('throws on error', async () => { mockAxiosGet.mockRejectedValueOnce(new Error('fail')); await expect(usersService.getAll()).rejects.toThrow(); });
});
describe('usersService.getById', () => {
  test('returns user by ID', async () => { mockAxiosGet.mockResolvedValueOnce({ data: mockUser }); expect((await usersService.getById('u1'))._id).toBe('u1'); });
  test('throws on empty response', async () => { mockAxiosGet.mockResolvedValueOnce({ data: null }); await expect(usersService.getById('u1')).rejects.toThrow(); });
});
describe('usersService.update', () => {
  test('updates user via api.put', async () => { mockApi.put.mockResolvedValueOnce({ data: mockUser }); await expect(usersService.update('u1', { name: 'New' })).resolves.not.toThrow(); });
  test('throws on invalid response', async () => { mockApi.put.mockResolvedValueOnce({ data: null }); await expect(usersService.update('u1', {})).rejects.toThrow(); });
});
describe('usersService.delete', () => {
  test('deletes user', async () => { mockAxiosDelete.mockResolvedValueOnce({ data: { success: true } }); await expect(usersService.delete('u1')).resolves.not.toThrow(); });
});
