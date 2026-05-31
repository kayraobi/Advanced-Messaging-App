import { jest } from '@jest/globals';
export const uploadAsync = jest.fn().mockResolvedValue({ status: 200, body: '{}' });
export const documentDirectory = '/mock/documents/';
