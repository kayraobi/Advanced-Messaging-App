jest.mock('../services/api', () => ({ __esModule: true, default: { get: jest.fn() }, handleError: jest.fn((e: unknown) => { throw e; }), USE_MOCK: false }));
jest.mock('@react-native-async-storage/async-storage', () => ({ __esModule: true, default: { getItem: jest.fn().mockResolvedValue(null), setItem: jest.fn().mockResolvedValue(undefined) } }));
global.fetch = jest.fn();
import AsyncStorage from '@react-native-async-storage/async-storage';
import { geocodeAddressCached } from '../services/geocodeService';
const mockStorage = AsyncStorage as jest.Mocked<typeof AsyncStorage>;
beforeEach(() => jest.clearAllMocks());

describe('geocodeAddressCached', () => {
  test('returns null for empty address', async () => {
    expect(await geocodeAddressCached('')).toBeNull();
  });
  test('returns cached result if available', async () => {
    mockStorage.getItem.mockResolvedValueOnce(JSON.stringify({ lat: 43.85, lng: 18.41 }));
    const r = await geocodeAddressCached('Baščaršija');
    expect(r).toEqual({ latitude: 43.85, longitude: 18.41 });
  });
  test('fetches from Nominatim and caches result', async () => {
    mockStorage.getItem.mockResolvedValueOnce(null);
    (global.fetch as jest.Mock).mockResolvedValueOnce({ json: async () => [{ lat: '43.8564', lon: '18.4131' }] });
    const r = await geocodeAddressCached('Sarajevo center');
    expect(r).toEqual({ latitude: 43.8564, longitude: 18.4131 });
    expect(mockStorage.setItem).toHaveBeenCalled();
  });
  test('returns null when Nominatim returns empty array', async () => {
    mockStorage.getItem.mockResolvedValueOnce(null);
    (global.fetch as jest.Mock).mockResolvedValueOnce({ json: async () => [] });
    expect(await geocodeAddressCached('Unknown place')).toBeNull();
  });
  test('returns null on fetch error', async () => {
    mockStorage.getItem.mockResolvedValueOnce(null);
    (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('network'));
    expect(await geocodeAddressCached('somewhere')).toBeNull();
  });
});
