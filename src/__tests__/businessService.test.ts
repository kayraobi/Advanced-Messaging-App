jest.mock('../services/api', () => ({ __esModule: true, default: { get: jest.fn(), post: jest.fn(), put: jest.fn(), patch: jest.fn(), delete: jest.fn() }, handleError: jest.fn((e: unknown) => { throw e; }), USE_MOCK: false }));
jest.mock('@react-native-async-storage/async-storage', () => ({ __esModule: true, default: { getItem: jest.fn().mockResolvedValue(null), setItem: jest.fn().mockResolvedValue(undefined), removeItem: jest.fn().mockResolvedValue(undefined), multiRemove: jest.fn().mockResolvedValue(undefined) } }));
import api from '../services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
const mockApi = api as jest.Mocked<typeof api>;
const mockStorage = AsyncStorage as jest.Mocked<typeof AsyncStorage>;
beforeEach(() => jest.clearAllMocks());
import { businessService } from '../services/businessService';
describe('businessService.submit', () => {
  test('submits request', async () => { mockApi.post.mockResolvedValueOnce({ data: { success: true } }); await expect(businessService.submit({ name:'T', email:'e@e.com', message:'M' })).resolves.not.toThrow(); });
  test('throws on error', async () => { mockApi.post.mockRejectedValueOnce(new Error('fail')); await expect(businessService.submit({ name:'T', email:'e@e.com', message:'M' })).rejects.toThrow(); });
});
