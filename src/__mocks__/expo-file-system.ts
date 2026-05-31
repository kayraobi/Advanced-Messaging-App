import { jest } from '@jest/globals';

export const uploadAsync = jest.fn().mockResolvedValue({ status: 200, body: '{}' } as unknown);
export const documentDirectory = '/mock/documents/';
