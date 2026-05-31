import { jest } from '@jest/globals';

const AsyncStorage = {
  getItem: jest.fn().mockResolvedValue(null as unknown),
  setItem: jest.fn().mockResolvedValue(undefined as unknown),
  removeItem: jest.fn().mockResolvedValue(undefined as unknown),
  multiRemove: jest.fn().mockResolvedValue(undefined as unknown),
  multiGet: jest.fn().mockResolvedValue([] as unknown),
  clear: jest.fn().mockResolvedValue(undefined as unknown),
  getAllKeys: jest.fn().mockResolvedValue([] as unknown),
};

export default AsyncStorage;
