import { jest } from '@jest/globals';

const mockSocket = {
  on: jest.fn(),
  off: jest.fn(),
  emit: jest.fn(),
  connect: jest.fn(),
  disconnect: jest.fn(),
  connected: false,
  id: 'mock-socket-id',
};

export const io = jest.fn().mockReturnValue(mockSocket);
export default io;
