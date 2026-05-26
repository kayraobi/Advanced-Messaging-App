import { interpretWeatherCode } from '../utils/weatherUtils';

describe('interpretWeatherCode', () => {
  // ── Positive test cases ──────────────────────────────────────────────────

  test('code 0 → clear sky (sunny icon)', () => {
    const result = interpretWeatherCode(0);
    expect(result.icon).toBe('weather-sunny');
    expect(result.description).toBe('Clear sky');
  });

  test('code 2 → partly cloudy', () => {
    const result = interpretWeatherCode(2);
    expect(result.icon).toBe('weather-partly-cloudy');
    expect(result.description).toBe('Partly cloudy');
  });

  test('code 3 → overcast', () => {
    const result = interpretWeatherCode(3);
    expect(result.icon).toBe('weather-cloudy');
    expect(result.description).toBe('Overcast');
  });

  test('code 45 → foggy', () => {
    const result = interpretWeatherCode(45);
    expect(result.icon).toBe('weather-fog');
    expect(result.description).toBe('Foggy');
  });

  test('code 48 → foggy (icing fog)', () => {
    const result = interpretWeatherCode(48);
    expect(result.icon).toBe('weather-fog');
  });

  test('code 61 → rain', () => {
    const result = interpretWeatherCode(61);
    expect(result.icon).toBe('weather-rainy');
    expect(result.description).toBe('Rain');
  });

  test('code 65 → heavy rain (boundary)', () => {
    const result = interpretWeatherCode(65);
    expect(result.icon).toBe('weather-rainy');
  });

  test('code 71 → snow', () => {
    const result = interpretWeatherCode(71);
    expect(result.icon).toBe('weather-snowy');
    expect(result.description).toBe('Snow');
  });

  test('code 95 → thunderstorm', () => {
    const result = interpretWeatherCode(95);
    expect(result.icon).toBe('weather-lightning-rainy');
    expect(result.description).toBe('Thunderstorm');
  });

  test('code 99 → thunderstorm with hail', () => {
    const result = interpretWeatherCode(99);
    expect(result.icon).toBe('weather-hail');
  });

  // ── Negative / edge test cases ───────────────────────────────────────────

  test('unknown code returns fallback cloudy icon', () => {
    const result = interpretWeatherCode(999);
    expect(result.icon).toBe('weather-cloudy');
    expect(result.description).toBe('Unknown');
  });

  test('negative code returns fallback', () => {
    const result = interpretWeatherCode(-1);
    expect(result.icon).toBe('weather-cloudy');
  });

  test('result always has icon and description fields', () => {
    [0, 1, 2, 3, 45, 53, 63, 73, 80, 85, 96].forEach((code) => {
      const result = interpretWeatherCode(code);
      expect(result).toHaveProperty('icon');
      expect(result).toHaveProperty('description');
      expect(typeof result.icon).toBe('string');
      expect(typeof result.description).toBe('string');
    });
  });
});
