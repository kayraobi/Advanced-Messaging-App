jest.mock('../services/api', () => ({ __esModule: true, default: { get: jest.fn(), post: jest.fn() }, handleError: jest.fn((e: unknown) => { throw e; }), USE_MOCK: false }));
jest.mock('@react-native-async-storage/async-storage', () => ({ __esModule: true, default: { getItem: jest.fn().mockResolvedValue(null), setItem: jest.fn().mockResolvedValue(undefined) } }));
jest.mock('@tanstack/react-query', () => ({ __esModule: true, useQuery: jest.fn().mockReturnValue({ data: undefined, isLoading: false }) }));
import { useQuery } from '@tanstack/react-query';
import { useEvents } from '../hooks/useEvents';
import { useLatestNews } from '../hooks/useLatestNews';
import { useMyEvents } from '../hooks/useMyEvents';
import { useSponsors } from '../hooks/useSponsors';
import { useNewsSlides } from '../hooks/useNewsSlides';
import { useFeaturedEvents } from '../hooks/useFeaturedEvents';
import { useChatRooms, useGlobalRoom } from '../hooks/useChatRooms';
beforeEach(() => jest.clearAllMocks());
describe('useEvents', () => {
  test('calls useQuery', () => { useEvents(); expect(useQuery).toHaveBeenCalledWith(expect.objectContaining({ queryKey: ['events', 'all'] })); });
  test('returns useQuery result', () => { (useQuery as jest.Mock).mockReturnValueOnce({ data: [], isLoading: false }); expect(useEvents().data).toEqual([]); });
});
describe('useLatestNews', () => { test('calls useQuery', () => { useLatestNews(); expect(useQuery).toHaveBeenCalled(); }); });
describe('useFeaturedEvents', () => { test('calls useQuery', () => { useFeaturedEvents(); expect(useQuery).toHaveBeenCalled(); }); });
describe('useMyEvents', () => { test('calls useQuery', () => { useMyEvents(); expect(useQuery).toHaveBeenCalled(); }); });
describe('useSponsors', () => { test('calls useQuery', () => { useSponsors(); expect(useQuery).toHaveBeenCalled(); }); });
describe('useNewsSlides', () => { test('calls useQuery', () => { useNewsSlides(); expect(useQuery).toHaveBeenCalled(); }); });
describe('useChatRooms', () => { test('calls useQuery', () => { useChatRooms(); expect(useQuery).toHaveBeenCalled(); }); });
describe('useGlobalRoom', () => {
  test('returns null when no rooms', () => { (useQuery as jest.Mock).mockReturnValueOnce({ data: [] }); expect(useGlobalRoom().globalRoom).toBeNull(); });
  test('finds global room', () => {
    const room = { _id:'r1', name:'Global', type:'global', isActive:true, createdAt:'', updatedAt:'' };
    (useQuery as jest.Mock).mockReturnValueOnce({ data: [room] });
    expect(useGlobalRoom().globalRoom).not.toBeNull();
  });
});
