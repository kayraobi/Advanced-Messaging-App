jest.mock('../services/api', () => ({ __esModule: true, default: { get: jest.fn(), post: jest.fn() }, handleError: jest.fn((e: unknown) => { throw e; }), USE_MOCK: false }));
jest.mock('@react-native-async-storage/async-storage', () => ({ __esModule: true, default: { getItem: jest.fn().mockResolvedValue(null), setItem: jest.fn().mockResolvedValue(undefined) } }));
global.fetch = jest.fn();
import { sendGeminiMessage } from '../services/groqService';
beforeEach(() => jest.clearAllMocks());
describe('sendGeminiMessage', () => {
  test('returns string on success', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({ ok: true, json: async () => ({ choices: [{ message: { content: 'Hello!' } }] }) });
    expect(typeof await sendGeminiMessage([], 'Hi')).toBe('string');
  });
  test('throws on non-ok response', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({ ok: false, status: 401, text: async () => 'Unauthorized' });
    await expect(sendGeminiMessage([], 'Hi')).rejects.toThrow();
  });
  test('returns fallback when choices empty', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({ ok: true, json: async () => ({ choices: [] }) });
    expect(typeof await sendGeminiMessage([], 'Hi')).toBe('string');
  });
});
