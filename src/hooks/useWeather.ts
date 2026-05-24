import { useState, useEffect } from 'react';
import { interpretWeatherCode } from '../utils/weatherUtils';

export interface WeatherData {
  temp: number;
  feelsLike: number;
  humidity: number;
  windSpeed: number;
  weatherCode: number;
  icon: string;
  headerIcon: string;
  description: string;
  hourly: { time: string; temp: number; icon: string }[];
}

// Sarajevo coordinates
const LAT = 43.8564;
const LON = 18.4131;

const REFRESH_INTERVAL_MS = 30 * 60 * 1000; // 30 minutes

export function useWeather() {
  const [data, setData] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const fetchWeather = async () => {
      try {
        setLoading(true);
        setError(null);

        const url =
          `https://api.open-meteo.com/v1/forecast` +
          `?latitude=${LAT}&longitude=${LON}` +
          `&current=temperature_2m,apparent_temperature,relative_humidity_2m,wind_speed_10m,weather_code` +
          `&hourly=temperature_2m,weather_code` +
          `&timezone=Europe%2FSarajevo` +
          `&forecast_days=1`;

        const res = await fetch(url);
        if (!res.ok) throw new Error('Weather fetch failed');
        const json = await res.json();

        if (cancelled) return;

        const current = json.current;
        const { icon, description } = interpretWeatherCode(current.weather_code);

        // Build next 6 hours
        const nowHour = new Date().getHours();
        const hourly: WeatherData['hourly'] = [];
        const times: string[] = json.hourly?.time ?? [];
        const temps: number[] = json.hourly?.temperature_2m ?? [];
        const codes: number[] = json.hourly?.weather_code ?? [];

        for (let i = 0; i < times.length && hourly.length < 6; i++) {
          const hour = new Date(times[i]).getHours();
          if (hour >= nowHour) {
            hourly.push({
              time: hour === nowHour ? 'Now' : `${hour}:00`,
              temp: Math.round(temps[i]),
              icon: interpretWeatherCode(codes[i]).icon,
            });
          }
        }

        setData({
          temp: Math.round(current.temperature_2m),
          feelsLike: Math.round(current.apparent_temperature),
          humidity: Math.round(current.relative_humidity_2m),
          windSpeed: Math.round(current.wind_speed_10m),
          weatherCode: current.weather_code,
          icon,
          headerIcon: icon,
          description,
          hourly,
        });
      } catch (e: any) {
        if (!cancelled) setError(e.message ?? 'Error');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchWeather();
    const interval = setInterval(fetchWeather, REFRESH_INTERVAL_MS);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, []);

  return { data, loading, error };
}
