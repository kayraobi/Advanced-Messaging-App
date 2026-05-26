import {
  extractCoordinatesFromText,
  parseEventCoordinates,
} from '../utils/mapCoordinates';

describe('parseEventCoordinates', () => {
  // ── Positive test cases ──────────────────────────────────────────────────

  test('parses numeric latitude and longitude directly', () => {
    const result = parseEventCoordinates({ latitude: 43.8563, longitude: 18.4131 });
    expect(result).toEqual({ latitude: 43.8563, longitude: 18.4131 });
  });

  test('parses shorthand lat/lng fields', () => {
    const result = parseEventCoordinates({ lat: 43.8563, lng: 18.4131 });
    expect(result).toEqual({ latitude: 43.8563, longitude: 18.4131 });
  });

  test('parses coordinates nested inside location object', () => {
    const result = parseEventCoordinates({
      location: { lat: 43.8563, lng: 18.4131 },
    });
    expect(result).toEqual({ latitude: 43.8563, longitude: 18.4131 });
  });

  test('parses string coordinates', () => {
    const result = parseEventCoordinates({ latitude: '43.8563', longitude: '18.4131' });
    expect(result).not.toBeNull();
    expect(result!.latitude).toBeCloseTo(43.8563);
    expect(result!.longitude).toBeCloseTo(18.4131);
  });

  test('accepts coordinate boundary values (0, 0)', () => {
    const result = parseEventCoordinates({ latitude: 0, longitude: 0 });
    expect(result).toEqual({ latitude: 0, longitude: 0 });
  });

  test('accepts extreme valid coordinates', () => {
    // North Pole / Date Line
    const result = parseEventCoordinates({ latitude: 90, longitude: 180 });
    expect(result).toEqual({ latitude: 90, longitude: 180 });
  });

  // ── Negative / edge test cases ───────────────────────────────────────────

  test('returns null when latitude is missing', () => {
    const result = parseEventCoordinates({ longitude: 18.4131 });
    expect(result).toBeNull();
  });

  test('returns null when longitude is missing', () => {
    const result = parseEventCoordinates({ latitude: 43.8563 });
    expect(result).toBeNull();
  });

  test('returns null for empty object', () => {
    const result = parseEventCoordinates({});
    expect(result).toBeNull();
  });

  test('returns null for out-of-range latitude (>90)', () => {
    const result = parseEventCoordinates({ latitude: 91, longitude: 18 });
    expect(result).toBeNull();
  });

  test('returns null for out-of-range longitude (>180)', () => {
    const result = parseEventCoordinates({ latitude: 43, longitude: 181 });
    expect(result).toBeNull();
  });

  test('returns null for non-numeric string coordinates', () => {
    const result = parseEventCoordinates({ latitude: 'abc', longitude: 'xyz' });
    expect(result).toBeNull();
  });

  test('extracts coordinates from Google Maps link in content HTML', () => {
    const html =
      '<a href="https://www.google.com/maps/place/@43.8592699,18.4218194,17z">Mula Mustafe</a>';
    const result = parseEventCoordinates({ content: html });
    expect(result).not.toBeNull();
    expect(result!.latitude).toBeCloseTo(43.8592699, 4);
    expect(result!.longitude).toBeCloseTo(18.4218194, 4);
  });

  test('extracts 3d/4d Google Maps coordinates', () => {
    const url =
      'https://maps.google.com/?q=place&3d43.8592699!4d18.4243943';
    expect(extractCoordinatesFromText(url)).toEqual({
      latitude: 43.8592699,
      longitude: 18.4243943,
    });
  });

  test('swaps lat/lng when values look reversed for Bosnia', () => {
    const result = parseEventCoordinates({ latitude: 18.4131, longitude: 43.8563 });
    expect(result).toEqual({ latitude: 43.8563, longitude: 18.4131 });
  });
});
