import { jest } from '@jest/globals';
export const requestMediaLibraryPermissionsAsync = jest.fn().mockResolvedValue({ granted: true });
export const launchImageLibraryAsync = jest.fn().mockResolvedValue({ canceled: true, assets: [] });
export const MediaTypeOptions = { Images: 'Images' };
