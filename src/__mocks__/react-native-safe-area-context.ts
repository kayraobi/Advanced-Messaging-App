import { jest } from '@jest/globals';
export const useSafeAreaInsets = jest.fn().mockReturnValue({ top: 44, bottom: 34, left: 0, right: 0 });
export const SafeAreaView = 'SafeAreaView';
export const SafeAreaProvider = ({ children }: { children: unknown }) => children;
