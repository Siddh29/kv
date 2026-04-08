/**
 * dataService.ts
 * Fetches real environmental data from Open-Meteo + SoilGrids APIs.
 * Passes raw data into the AI/Logic Engine (analysisService) for processing.
 */

import { analyzeLand, type LandAnalysis } from './analysis/analysisService';

export interface WeatherData {
  temperature: number;
  humidity: number;
  rainfall: number;
  windSpeed: number;
  description: string;
  feelsLike: number;
}

export interface DashboardData {
  lat: number;
  lng: number;
  // Raw sensor readings
  temperature: number;
  humidity: number;
  rainfall: number;
  windSpeed: number;
  description: string;
  feelsLike: number;
  soilPH: number | null;
  soilMoisture: number | null;
  // Full AI analysis output
  analysis: LandAnalysis;
  // Convenience shortcuts (derived from analysis)
  ndvi: number;
  healthScore: number;
  healthLabel: string;
  healthColor: string;
  cropRecommendation: string;
  timestamp: number;
  isSimulated?: boolean;
}

// ─── WMO weather code → description ───────────────────────────
const WMO_CODES: Record<number, string> = {
  0: 'Clear Sky', 1: 'Mainly Clear', 2: 'Partly Cloudy', 3: 'Overcast',
  45: 'Fog', 48: 'Icy Fog',
  51: 'Light Drizzle', 53: 'Moderate Drizzle', 55: 'Dense Drizzle',
  61: 'Slight Rain', 63: 'Moderate Rain', 65: 'Heavy Rain',
  71: 'Slight Snowfall', 73: 'Moderate Snowfall', 75: 'Heavy Snowfall',
  80: 'Slight Showers', 81: 'Moderate Showers', 82: 'Violent Showers',
  95: 'Thunderstorm', 96: 'Thunderstorm w/ Hail', 99: 'Thunderstorm w/ Heavy Hail',
};

// ─── Open-Meteo Weather ────────────────────────────────────────
export async function getWeather(lat: number, lng: number): Promise<WeatherData> {
  const url =
    `https://api.open-meteo.com/v1/forecast` +
    `?latitude=${lat}&longitude=${lng}` +
    `&current=temperature_2m,relative_humidity_2m,precipitation,wind_speed_10m,apparent_temperature,weather_code` +
    `&wind_speed_unit=ms`;

  const res = await fetch(url);
  if (!res.ok) throw new Error(`Weather API error: ${res.status}`);
  const data = await res.json();
  const c = data.current;

  return {
    temperature: c.temperature_2m ?? 0,
    humidity: c.relative_humidity_2m ?? 0,
    rainfall: c.precipitation ?? 0,
    windSpeed: c.wind_speed_10m ?? 0,
    feelsLike: c.apparent_temperature ?? 0,
    description: WMO_CODES[c.weather_code] ?? 'Unknown',
  };
}

// ─── Open-Meteo Soil Moisture ──────────────────────────────────
export async function getSoilMoisture(lat: number, lng: number): Promise<number | null> {
  const url =
    `https://api.open-meteo.com/v1/forecast` +
    `?latitude=${lat}&longitude=${lng}` +
    `&hourly=soil_moisture_0_to_1cm` +
    `&forecast_days=1`;

  const res = await fetch(url);
  if (!res.ok) return null;
  const data = await res.json();

  const readings: number[] = data?.hourly?.soil_moisture_0_to_1cm ?? [];
  const valid = readings.filter((v) => v != null);
  if (valid.length === 0) return null;

  // Open-Meteo returns m³/m³ (0–0.8), convert to 0–100 percentage
  const latest = valid[valid.length - 1];
  return Math.round(latest * 100);
}

// ─── SoilGrids pH (best-effort, graceful fallback) ────────────
export async function getSoilPH(lat: number, lng: number): Promise<number | null> {
  try {
    const url =
      `https://rest.isric.org/soilgrids/v2.0/properties/query` +
      `?lat=${lat}&lon=${lng}&property=phh2o&depth=0-5cm&value=mean`;

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 8000);
    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(timer);

    if (!res.ok) return null;
    const data = await res.json();
    const layers: unknown[] = data?.properties?.layers ?? [];
    for (const layer of layers as Array<{ name: string; depths?: Array<{ values?: { mean?: number } }> }>) {
      if (layer.name === 'phh2o') {
        const mean = layer?.depths?.[0]?.values?.mean;
        if (mean != null) return mean / 10;
      }
    }
  } catch {
    // Timed-out or network error — use fallback
  }
  return null;
}

// ─── Mock Data Fallback ─────────────────────────────────────────
function createMockWeatherData(): WeatherData {
  const t = 24 + Math.random() * 8; // 24-32°C
  return {
    temperature: t,
    humidity: 40 + Math.random() * 40, // 40-80%
    rainfall: Math.random() > 0.7 ? Math.random() * 10 : 0, // 30% chance of rain
    windSpeed: 1 + Math.random() * 5,
    feelsLike: t + 2,
    description: 'Simulated Weather',
  };
}

// ─── Main Orchestrator ─────────────────────────────────────────
export async function getDashboardData(lat: number, lng: number): Promise<DashboardData> {
  let weather: WeatherData;
  let soilMoisture: number | null = null;
  let soilPH: number | null = null;
  let isSimulated = false;

  try {
    const [weatherResult, soilMoistureResult, soilPHResult] = await Promise.allSettled([
      getWeather(lat, lng),
      getSoilMoisture(lat, lng),
      getSoilPH(lat, lng),
    ]);

    if (weatherResult.status === 'fulfilled') {
      weather = weatherResult.value;
      soilMoisture = soilMoistureResult.status === 'fulfilled' ? soilMoistureResult.value : null;
      soilPH = soilPHResult.status === 'fulfilled' ? soilPHResult.value : null;
    } else {
      // If primary weather fails, trigger fallback
      console.warn('Weather API failed, falling back to simulated data');
      weather = createMockWeatherData();
      soilMoisture = 35;
      soilPH = 6.2;
      isSimulated = true;
    }
  } catch (err) {
    console.error('Data service orchestrator error:', err);
    weather = createMockWeatherData();
    isSimulated = true;
  }

  // ── Run AI/Logic Engine ────────────────────────────────────
  const analysis = analyzeLand({
    temperature:  weather.temperature,
    rainfall:     weather.rainfall,
    humidity:     weather.humidity,
    soilPH:       soilPH ?? 6.5,
    soilMoisture: soilMoisture ?? 20,
  });

  return {
    lat,
    lng,
    ...weather,
    soilMoisture,
    soilPH,
    analysis,
    isSimulated,
    // Convenience shortcuts
    ndvi:             analysis.ndvi,
    healthScore:      analysis.healthScore,
    healthLabel:      analysis.healthLabel,
    healthColor:      analysis.healthColor,
    cropRecommendation: analysis.cropRecommendation.crop,
    timestamp:        Date.now(),
  };
}

export type { LandAnalysis };
