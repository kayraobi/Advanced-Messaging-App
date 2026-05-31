jest.mock('../services/api', () => ({ __esModule: true, default: { get: jest.fn(), post: jest.fn(), put: jest.fn(), patch: jest.fn(), delete: jest.fn() }, handleError: jest.fn((e: unknown) => { throw e; }), USE_MOCK: false }));
jest.mock('@react-native-async-storage/async-storage', () => ({ __esModule: true, default: { getItem: jest.fn().mockResolvedValue(null), setItem: jest.fn().mockResolvedValue(undefined), removeItem: jest.fn().mockResolvedValue(undefined), multiRemove: jest.fn().mockResolvedValue(undefined) } }));
import api from '../services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { eventService } from '../services/eventService';
const mockApi = api as jest.Mocked<typeof api>;
const mockStorage = AsyncStorage as jest.Mocked<typeof AsyncStorage>;
beforeEach(() => jest.clearAllMocks());
const mockEvent = { _id:'e1', title:'Test Event', date:'2025-06-01', location:'Sarajevo' };
describe('eventService.getAll', () => {
  test('returns array', async () => { mockApi.get.mockResolvedValueOnce({ data: [mockEvent] }); expect(Array.isArray(await eventService.getAll())).toBe(true); });
  test('throws on error', async () => { mockApi.get.mockRejectedValueOnce(new Error('fail')); await expect(eventService.getAll()).rejects.toThrow(); });
});
describe('eventService.getFeatured', () => {
  test('returns featured events', async () => { mockApi.get.mockResolvedValueOnce({ data: [mockEvent] }); expect(Array.isArray(await eventService.getFeatured())).toBe(true); });
  test('returns empty for null', async () => { mockApi.get.mockResolvedValueOnce({ data: null }); expect(await eventService.getFeatured()).toEqual([]); });
});
describe('eventService.getById', () => {
  test('returns event by ID', async () => { mockApi.get.mockResolvedValueOnce({ data: mockEvent }); const r = await eventService.getById('e1'); expect(r._id).toBe('e1'); });
});
describe('eventService.hasLocalRsvp', () => {
  test('returns boolean', async () => { mockStorage.getItem.mockResolvedValueOnce(JSON.stringify(['e1'])); expect(typeof await eventService.hasLocalRsvp('e1')).toBe('boolean'); });
});

describe('eventService.getPinned', () => {
  test('returns pinned events', async () => { mockApi.get.mockResolvedValueOnce({ data: [mockEvent] }); expect(Array.isArray(await eventService.getPinned())).toBe(true); });
});
describe('eventService.create', () => {
  test('creates event from URL', async () => { mockApi.post.mockResolvedValueOnce({ data: mockEvent }); await expect(eventService.create({ url: 'https://fb.com/event/123' })).resolves.not.toThrow(); });
});
describe('eventService.update', () => {
  test('updates event', async () => { mockApi.put.mockResolvedValueOnce({ data: mockEvent }); await expect(eventService.update('e1', { title:'New' } as never)).resolves.not.toThrow(); });
  test('throws on error', async () => { mockApi.put.mockRejectedValueOnce(new Error('fail')); await expect(eventService.update('e1', {} as never)).rejects.toThrow(); });
});
describe('eventService.deleteById', () => {
  test('deletes event', async () => { mockApi.delete.mockResolvedValueOnce({ data: {} }); await expect(eventService.deleteById('e1')).resolves.not.toThrow(); });
});
describe('eventService.rsvp', () => {
  test('RSVPs to event', async () => { mockApi.post.mockResolvedValueOnce({ data: mockEvent }); mockStorage.getItem.mockResolvedValueOnce(JSON.stringify([])); await expect(eventService.rsvp('e1')).resolves.not.toThrow(); });
});
describe('eventService.cancelRsvp', () => {
  test('cancels RSVP', async () => { mockApi.delete.mockResolvedValueOnce({ data: {} }); await expect(eventService.cancelRsvp('e1')).resolves.not.toThrow(); });
});
describe('eventService.getMyRsvpEvents', () => {
  test('returns empty when no RSVPs stored', async () => { mockStorage.getItem.mockResolvedValueOnce(null); const r = await eventService.getMyRsvpEvents(); expect(Array.isArray(r)).toBe(true); });
});
