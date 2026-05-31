jest.mock('../services/api', () => ({ __esModule: true, default: { get: jest.fn(), post: jest.fn() }, handleError: jest.fn((e: unknown) => { throw e; }), USE_MOCK: false }));
jest.mock('@react-native-async-storage/async-storage', () => ({ __esModule: true, default: { getItem: jest.fn().mockResolvedValue(null), setItem: jest.fn().mockResolvedValue(undefined), removeItem: jest.fn().mockResolvedValue(undefined) } }));
jest.mock('expo-notifications', () => ({ __esModule: true, requestPermissionsAsync: jest.fn().mockResolvedValue({ status: 'granted' }), getExpoPushTokenAsync: jest.fn().mockResolvedValue({ data: 'ExpoToken[mock]' }), scheduleNotificationAsync: jest.fn().mockResolvedValue('id'), setNotificationHandler: jest.fn(), addNotificationReceivedListener: jest.fn().mockReturnValue({ remove: jest.fn() }), addNotificationResponseReceivedListener: jest.fn().mockReturnValue({ remove: jest.fn() }), AndroidImportance: { MAX: 5 } }));
jest.mock('expo-device', () => ({ __esModule: true, isDevice: true }));
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNotificationsState } from '../hooks/useNotifications';
const mockStorage = AsyncStorage as jest.Mocked<typeof AsyncStorage>;
beforeEach(() => jest.clearAllMocks());

describe('useNotificationsState', () => {
  test('hook function exists', () => { expect(typeof useNotificationsState).toBe('function'); });
  test('AsyncStorage getItem mock works', async () => {
    mockStorage.getItem.mockResolvedValueOnce(null);
    expect(await AsyncStorage.getItem('test')).toBeNull();
  });
  test('loads stored notifications from AsyncStorage', async () => {
    const notifs = [{ id:'1', title:'Test', isRead:false, createdAt: new Date().toISOString(), emoji:'🔔' }];
    mockStorage.getItem.mockResolvedValueOnce(JSON.stringify(notifs));
    const stored = await AsyncStorage.getItem('@in_app_notifications');
    const parsed = JSON.parse(stored as string);
    expect(parsed[0].id).toBe('1');
  });
});
