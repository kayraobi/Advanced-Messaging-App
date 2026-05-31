import { jest } from '@jest/globals';
export const jwtDecode = jest.fn().mockReturnValue({ exp: Date.now() / 1000 + 3600, _id: 'u1', username: 'testuser' });
