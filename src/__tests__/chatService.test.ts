jest.mock('../services/api', () => ({ __esModule: true, default: { get: jest.fn(), post: jest.fn(), put: jest.fn(), patch: jest.fn(), delete: jest.fn() }, handleError: jest.fn((e: unknown) => { throw e; }), USE_MOCK: false }));
jest.mock('@react-native-async-storage/async-storage', () => ({ __esModule: true, default: { getItem: jest.fn().mockResolvedValue(null), setItem: jest.fn().mockResolvedValue(undefined), removeItem: jest.fn().mockResolvedValue(undefined), multiRemove: jest.fn().mockResolvedValue(undefined) } }));
import api from '../services/api';
import { chatService, getDmPeerName } from '../services/chatService';
import type { Room } from '../services/chatService';
const mockApi = api as jest.Mocked<typeof api>;
beforeEach(() => jest.clearAllMocks());

describe('getDmPeerName', () => {
  test('returns peer name', () => {
    const room = { _id:'r1', name:'DM', type:'dm', participants:['u1','u2'], participantNames:{u2:'Bob'}, isActive:true, createdAt:'', updatedAt:'' } as Room;
    expect(getDmPeerName(room, 'u1')).toBe('Bob');
  });
  test('returns room name when no participantNames', () => {
    const room = { _id:'r1', name:'Global', type:'global', isActive:true, createdAt:'', updatedAt:'' } as Room;
    expect(getDmPeerName(room, 'u1')).toBe('Global');
  });
  test('returns room name when no participants array', () => {
    const room = { _id:'r1', name:'Chat', type:'dm', participantNames:{}, isActive:true, createdAt:'', updatedAt:'' } as Room;
    expect(getDmPeerName(room, 'u1')).toBe('Chat');
  });
});
describe('chatService.getRooms', () => {
  test('returns rooms array', async () => { mockApi.get.mockResolvedValueOnce({ data: [{ _id:'r1', name:'Global', type:'global', isActive:true, createdAt:'', updatedAt:'' }] }); expect(Array.isArray(await chatService.getRooms())).toBe(true); });
  test('throws on error', async () => { mockApi.get.mockRejectedValueOnce(new Error('fail')); await expect(chatService.getRooms()).rejects.toThrow(); });
});
describe('chatService.getRoomMessages', () => {
  test('fetches messages', async () => { mockApi.get.mockResolvedValueOnce({ data: [] }); expect(Array.isArray(await chatService.getRoomMessages('r1'))).toBe(true); });
});
