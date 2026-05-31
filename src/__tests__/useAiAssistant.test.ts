jest.mock('../services/api', () => ({ __esModule: true, default: { get: jest.fn(), post: jest.fn() }, handleError: jest.fn((e: unknown) => { throw e; }), USE_MOCK: false }));
jest.mock('@react-native-async-storage/async-storage', () => ({ __esModule: true, default: { getItem: jest.fn().mockResolvedValue(null), setItem: jest.fn().mockResolvedValue(undefined) } }));
jest.mock('react-native', () => ({ __esModule: true, useState: jest.fn(), useCallback: jest.fn(), useRef: jest.fn(), FlatList: 'FlatList' }));
global.fetch = jest.fn();
import { useAiAssistant } from '../hooks/useAiAssistant';
describe('useAiAssistant', () => {
  test('hook function exists', () => { expect(typeof useAiAssistant).toBe('function'); });
});
