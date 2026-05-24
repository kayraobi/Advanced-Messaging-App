export interface WeatherInterpretation {
  icon: string; // MaterialCommunityIcons name
  description: string;
}

// WMO Weather interpretation codes → MaterialCommunityIcons names
export function interpretWeatherCode(code: number): WeatherInterpretation {
  if (code === 0)  return { icon: 'weather-sunny',           description: 'Clear sky' };
  if (code === 1)  return { icon: 'weather-sunny',           description: 'Mainly clear' };
  if (code === 2)  return { icon: 'weather-partly-cloudy',   description: 'Partly cloudy' };
  if (code === 3)  return { icon: 'weather-cloudy',          description: 'Overcast' };
  if (code === 45 || code === 48) return { icon: 'weather-fog',          description: 'Foggy' };
  if (code >= 51 && code <= 55)   return { icon: 'weather-partly-rainy', description: 'Drizzle' };
  if (code >= 61 && code <= 65)   return { icon: 'weather-rainy',        description: 'Rain' };
  if (code >= 71 && code <= 75)   return { icon: 'weather-snowy',        description: 'Snow' };
  if (code === 77)                return { icon: 'weather-snowy',        description: 'Snow grains' };
  if (code >= 80 && code <= 82)   return { icon: 'weather-pouring',      description: 'Rain showers' };
  if (code >= 85 && code <= 86)   return { icon: 'weather-snowy-heavy',  description: 'Snow showers' };
  if (code === 95)                return { icon: 'weather-lightning-rainy', description: 'Thunderstorm' };
  if (code >= 96 && code <= 99)   return { icon: 'weather-hail',         description: 'Thunderstorm w/ hail' };
  return { icon: 'weather-cloudy', description: 'Unknown' };
}
