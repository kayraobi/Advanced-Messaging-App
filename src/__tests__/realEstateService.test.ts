jest.mock('../services/api', () => ({ __esModule: true, default: { get: jest.fn(), post: jest.fn(), put: jest.fn(), patch: jest.fn(), delete: jest.fn() }, handleError: jest.fn((e: unknown) => { throw e; }), USE_MOCK: false }));
jest.mock('@react-native-async-storage/async-storage', () => ({ __esModule: true, default: { getItem: jest.fn().mockResolvedValue(null), setItem: jest.fn().mockResolvedValue(undefined), removeItem: jest.fn().mockResolvedValue(undefined), multiRemove: jest.fn().mockResolvedValue(undefined) } }));
import api from '../services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
const mockApi = api as jest.Mocked<typeof api>;
const mockStorage = AsyncStorage as jest.Mocked<typeof AsyncStorage>;
beforeEach(() => jest.clearAllMocks());
import { realEstateService } from '../services/realEstateService';
const mockListing = { _id:'r1', title:'Apartment', price:500 };
describe('realEstateService.getAll', () => {
  test('returns all listings', async () => { mockApi.get.mockResolvedValueOnce({ data: [mockListing] }); expect(Array.isArray(await realEstateService.getAll())).toBe(true); });
  test('returns empty for null', async () => { mockApi.get.mockResolvedValueOnce({ data: null }); expect(await realEstateService.getAll()).toEqual([]); });
  test('throws on error', async () => { mockApi.get.mockRejectedValueOnce(new Error('fail')); await expect(realEstateService.getAll()).rejects.toThrow(); });
});
describe('realEstateService.getFeatured', () => {
  test('returns featured', async () => { mockApi.get.mockResolvedValueOnce({ data: [mockListing] }); expect(Array.isArray(await realEstateService.getFeatured())).toBe(true); });
});

describe('realEstateService.getById', () => {
  test('returns listing by ID', async () => { mockApi.get.mockResolvedValueOnce({ data: mockListing }); expect((await realEstateService.getById('r1'))._id).toBe('r1'); });
  test('throws on not found', async () => { mockApi.get.mockResolvedValueOnce({ data: null }); await expect(realEstateService.getById('r1')).rejects.toThrow(); });
});
describe('realEstateService.submit', () => {
  test('creates listing', async () => { mockApi.post.mockResolvedValueOnce({ data: mockListing }); await expect(realEstateService.submit({} as never)).resolves.not.toThrow(); });
});
describe('realEstateService.update', () => {
  test('updates listing', async () => { mockApi.put.mockResolvedValueOnce({ data: mockListing }); await expect(realEstateService.update('r1', {} as never)).resolves.not.toThrow(); });
});
describe('realEstateService.delete', () => {
  test('deletes listing', async () => { mockApi.delete.mockResolvedValueOnce({ data: {} }); await expect(realEstateService.delete('r1')).resolves.not.toThrow(); });
});
describe('realEstateService.getByUserId', () => {
  test('returns listings for user', async () => { mockApi.get.mockResolvedValueOnce({ data: [mockListing] }); expect(Array.isArray(await realEstateService.getByUserId('u1'))).toBe(true); });
});

describe('realEstateService.deleteImage', () => {
  test('deletes image', async () => { mockApi.delete.mockResolvedValueOnce({ data: {} }); await expect(realEstateService.deleteImage('r1','img1')).resolves.not.toThrow(); });
});
describe('realEstateService.reorderImages', () => {
  test('reorders images', async () => { mockApi.put.mockResolvedValueOnce({ data: {} }); await expect(realEstateService.reorderImages('r1',{ images: ['img1'] })).resolves.not.toThrow(); });
});
describe('realEstateService.approve', () => {
  test('approves listing', async () => { mockApi.put.mockResolvedValueOnce({ data: {} }); await expect(realEstateService.approve('r1')).resolves.not.toThrow(); });
});
describe('realEstateService.unapprove', () => {
  test('unapproves listing', async () => { mockApi.put.mockResolvedValueOnce({ data: {} }); await expect(realEstateService.unapprove('r1')).resolves.not.toThrow(); });
});
