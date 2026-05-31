import { jest } from '@jest/globals';

export const requestPermissionsAsync = jest.fn().mockResolvedValue({ status: 'granted' } as unknown);
export const getExpoPushTokenAsync = jest.fn().mockResolvedValue({ data: 'ExpoToken[mock]' } as unknown);
export const scheduleNotificationAsync = jest.fn().mockResolvedValue('notif-id' as unknown);
export const cancelAllScheduledNotificationsAsync = jest.fn().mockResolvedValue(undefined as unknown);
export const setNotificationHandler = jest.fn();
export const addNotificationReceivedListener = jest.fn().mockReturnValue({ remove: jest.fn() });
export const addNotificationResponseReceivedListener = jest.fn().mockReturnValue({ remove: jest.fn() });
export const AndroidImportance = { MAX: 5 };
