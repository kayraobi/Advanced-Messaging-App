jest.mock('../services/api', () => ({ __esModule: true, default: { get: jest.fn() }, handleError: jest.fn((e: unknown) => { throw e; }), USE_MOCK: false }));
jest.mock('@react-native-async-storage/async-storage', () => ({ __esModule: true, default: { getItem: jest.fn().mockResolvedValue(null) } }));

import { fallbackLatLng, buildPinFromItem } from '../utils/mapPins';

describe('fallbackLatLng', () => {
  test('returns latitude and longitude numbers', () => {
    const r = fallbackLatLng(0);
    expect(typeof r.latitude).toBe('number');
    expect(typeof r.longitude).toBe('number');
  });
  test('different indices produce different positions', () => {
    const a = fallbackLatLng(0);
    const b = fallbackLatLng(5);
    expect(a.latitude).not.toBe(b.latitude);
  });
});

describe('buildPinFromItem', () => {
  test('builds pin with approximate=true when no coords', () => {
    const item = { _id: 'p1', name: 'Test Place', address: 'Sarajevo' };
    const pin = buildPinFromItem(item as never, 0, 'places');
    expect(pin.title).toBe('Test Place');
    expect(pin.approximate).toBe(true);
    expect(typeof pin.lat).toBe('number');
    expect(typeof pin.lng).toBe('number');
  });
  test('builds pin with approximate=false when coords present', () => {
    const item = { _id: 'p2', name: 'Exact Place', latitude: 43.85, longitude: 18.41 };
    const pin = buildPinFromItem(item as never, 0, 'places');
    expect(pin.approximate).toBe(false);
    expect(pin.lat).toBe(43.85);
  });
  test('builds realEstate pin', () => {
    const item = { _id: 'r1', title: 'Apartment', latitude: 43.86, longitude: 18.42 };
    const pin = buildPinFromItem(item as never, 0, 'realEstate');
    expect(pin.title).toBe('Apartment');
  });
});
