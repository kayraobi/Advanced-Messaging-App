jest.mock('../services/api', () => ({ __esModule: true, default: { get: jest.fn(), post: jest.fn(), put: jest.fn(), patch: jest.fn(), delete: jest.fn() }, handleError: jest.fn((e: unknown) => { throw e; }), USE_MOCK: false }));
jest.mock('@react-native-async-storage/async-storage', () => ({ __esModule: true, default: { getItem: jest.fn().mockResolvedValue(null), setItem: jest.fn().mockResolvedValue(undefined) } }));
import api from '../services/api';
const mockApi = api as jest.Mocked<typeof api>;
beforeEach(() => jest.clearAllMocks());
import { rolesService } from '../services/rolesService';
const mockRole = { _id:'role1', name:'Admin' };
describe('rolesService.getAll', () => {
  test('returns all roles', async () => { mockApi.get.mockResolvedValueOnce({ data: [mockRole] }); expect(Array.isArray(await rolesService.getAll())).toBe(true); });
  test('returns empty for null', async () => { mockApi.get.mockResolvedValueOnce({ data: null }); expect(await rolesService.getAll()).toEqual([]); });
});
describe('rolesService.getById', () => {
  test('returns role by ID', async () => { mockApi.get.mockResolvedValueOnce({ data: mockRole }); expect((await rolesService.getById('role1'))._id).toBe('role1'); });
});
describe('rolesService.create', () => {
  test('creates role', async () => { mockApi.post.mockResolvedValueOnce({ data: mockRole }); await expect(rolesService.create({} as never)).resolves.not.toThrow(); });
});
describe('rolesService.update', () => {
  test('updates role', async () => { mockApi.put.mockResolvedValueOnce({ data: mockRole }); await expect(rolesService.update('role1', {} as never)).resolves.not.toThrow(); });
});
describe('rolesService.delete', () => {
  test('deletes role', async () => { mockApi.delete.mockResolvedValueOnce({ data: {} }); await expect(rolesService.delete('role1')).resolves.not.toThrow(); });
});
