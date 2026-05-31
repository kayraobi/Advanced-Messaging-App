jest.mock('../services/api', () => ({ __esModule: true, default: { get: jest.fn(), post: jest.fn(), put: jest.fn(), patch: jest.fn(), delete: jest.fn() }, handleError: jest.fn((e: unknown) => { throw e; }), USE_MOCK: false }));
jest.mock('@react-native-async-storage/async-storage', () => ({ __esModule: true, default: { getItem: jest.fn().mockResolvedValue(null), setItem: jest.fn().mockResolvedValue(undefined), removeItem: jest.fn().mockResolvedValue(undefined), multiRemove: jest.fn().mockResolvedValue(undefined) } }));
import api from '../services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
const mockApi = api as jest.Mocked<typeof api>;
const mockStorage = AsyncStorage as jest.Mocked<typeof AsyncStorage>;
beforeEach(() => jest.clearAllMocks());
import { placesService } from '../services/placesService';
const mockPlace = { _id:'p1', name:'Baščaršija', address:'Sarajevo' };
describe('placesService.getAll', () => {
  test('returns all places', async () => { mockApi.get.mockResolvedValueOnce({ data: [mockPlace] }); expect(Array.isArray(await placesService.getAll())).toBe(true); });
  test('returns empty for null', async () => { mockApi.get.mockResolvedValueOnce({ data: null }); expect(await placesService.getAll()).toEqual([]); });
  test('throws on error', async () => { mockApi.get.mockRejectedValueOnce(new Error('fail')); await expect(placesService.getAll()).rejects.toThrow(); });
});
describe('placesService.getById', () => {
  test('returns place by ID', async () => { mockApi.get.mockResolvedValueOnce({ data: mockPlace }); expect((await placesService.getById('p1'))._id).toBe('p1'); });
});

describe('placesService.getFeatured', () => {
  test('returns featured places', async () => { mockApi.get.mockResolvedValueOnce({ data: [mockPlace] }); expect(Array.isArray(await placesService.getFeatured())).toBe(true); });
});
describe('placesService.create', () => {
  test('creates place', async () => { mockApi.post.mockResolvedValueOnce({ data: mockPlace }); await expect(placesService.create({} as never)).resolves.not.toThrow(); });
});
describe('placesService.update', () => {
  test('updates place', async () => { mockApi.put.mockResolvedValueOnce({ data: mockPlace }); await expect(placesService.update('p1', {} as never)).resolves.not.toThrow(); });
});
describe('placesService.delete', () => {
  test('deletes place', async () => { mockApi.delete.mockResolvedValueOnce({ data: {} }); await expect(placesService.delete('p1')).resolves.not.toThrow(); });
});
describe('placesService.submitGuest', () => {
  test('submits guest suggestion', async () => { mockApi.post.mockResolvedValueOnce({ data: { _id:'p2', name:'New Place' } }); await expect(placesService.submitGuest({} as never)).resolves.not.toThrow(); });
});

describe('placesService.deleteImage', () => {
  test('deletes image', async () => { mockApi.delete.mockResolvedValueOnce({ data: {} }); await expect(placesService.deleteImage('p1','img1')).resolves.not.toThrow(); });
});
describe('placesService.reorderImages', () => {
  test('reorders images', async () => { mockApi.put.mockResolvedValueOnce({ data: {} }); await expect(placesService.reorderImages('p1',{ images: ['img1'] })).resolves.not.toThrow(); });
});
describe('placesService.approve', () => {
  test('approves place', async () => { mockApi.put.mockResolvedValueOnce({ data: {} }); await expect(placesService.approve('p1')).resolves.not.toThrow(); });
});
describe('placesService.addTag', () => {
  test('adds tag', async () => { mockApi.post.mockResolvedValueOnce({ data: {} }); await expect(placesService.addTag('p1',{ tag: 'tag1' })).resolves.not.toThrow(); });
});
describe('placesService.removeTag', () => {
  test('removes tag', async () => { mockApi.delete.mockResolvedValueOnce({ data: {} }); await expect(placesService.removeTag('p1',{ tag: 'tag1' })).resolves.not.toThrow(); });
});
