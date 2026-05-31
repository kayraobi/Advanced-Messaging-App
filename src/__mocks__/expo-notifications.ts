import { jest } from '@jest/globals';
export const requestPermissionsAsync = jest.fn().mockResolvedValue({ status: 'granted' });
export const getExpoPushTokenAsync = jest.fn().mockResolvedValue({ data: 'ExpoToken[mock]' });
export const scheduleNotificationAsync = jest.fn().mockResolvedValue('notif-id');
export const cancelAllScheduledNotificationsAsync = jest.fn().mockResolvedValue(undefined);
export const setNotificationHandler = jest.fn();
export const addNotificationReceivedListener = jest.fn().mockReturnValue({ remove: jest.fn() });
export const addNotificationResponseReceivedListener = jest.fn().mockReturnValue({ remove: jest.fn() });
export const AndroidImportance = { MAX: 5 };
