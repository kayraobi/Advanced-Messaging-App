jest.mock('../services/api', () => ({ __esModule: true, default: { get: jest.fn(), post: jest.fn() }, handleError: jest.fn((e: unknown) => { throw e; }), USE_MOCK: false }));
jest.mock('@react-native-async-storage/async-storage', () => ({ __esModule: true, default: { getItem: jest.fn().mockResolvedValue(null), setItem: jest.fn().mockResolvedValue(undefined) } }));
jest.mock('@tanstack/react-query', () => ({ __esModule: true, useQuery: jest.fn().mockReturnValue({ data: undefined, isLoading: false }) }));
jest.mock('@react-navigation/native', () => ({ __esModule: true, useNavigation: jest.fn().mockReturnValue({ navigate: jest.fn(), goBack: jest.fn() }), useFocusEffect: jest.fn(), useRoute: jest.fn().mockReturnValue({ params: {} }) }));
jest.mock('../contexts/NotificationContext', () => ({ __esModule: true, useNotifications: jest.fn().mockReturnValue({ notifications: [], unreadCount: 0, markAsRead: jest.fn() }) }));

import { useActiveChatRoom } from '../hooks/useActiveChatRoom';
import { useUserProfile } from '../hooks/useUserProfile';

describe('hook imports', () => {
  test('useActiveChatRoom is a function', () => { expect(typeof useActiveChatRoom).toBe('function'); });
  test('useUserProfile is a function', () => { expect(typeof useUserProfile).toBe('function'); });
});
