import { jest } from '@jest/globals';

export const requestMediaLibraryPermissionsAsync = jest.fn().mockResolvedValue({ granted: true } as unknown);
export const launchImageLibraryAsync = jest.fn().mockResolvedValue({ canceled: true, assets: [] } as unknown);
export const MediaTypeOptions = { Images: 'Images' };
