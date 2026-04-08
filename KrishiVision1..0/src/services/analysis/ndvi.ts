/**
 * ndvi.ts
 * NDVI estimation and zone classification from environmental inputs.
 * No API calls. No UI. Pure logic.
 */

export interface NDVIResult {
  ndvi: number;
  zone: string;
  color: string;
  description: string;
}

/**
 * estimateNDVI
 * Approximates Normalized Difference Vegetation Index using
 * soil moisture, rainfall, and humidity as proxies for vegetation health.
 *
 * Rule: 
 * ndvi = baseNDVI + (humidity / 1000) - (random small noise)
 */
export function estimateNDVI(soilMoisture: number, rainfall: number, humidity: number): number {
  let baseNDVI = 0.3;
  if (soilMoisture > 40 && rainfall > 100) baseNDVI = 0.7;
  else if (soilMoisture > 25) baseNDVI = 0.5;

  // Add variation: (humidity / 1000) + random noise (-0.02 to 0.02)
  const variation = (humidity / 1000) + (Math.random() * 0.04 - 0.02);
  const ndvi = baseNDVI + variation;

  // Clamp between 0 and 1
  return Math.min(1, Math.max(0, parseFloat(ndvi.toFixed(3))));
}

/**
 * classifyNDVI
 * Maps NDVI value to a human-readable vegetation zone with color coding.
 */
export function classifyNDVI(ndvi: number): { zone: string; color: string; description: string } {
  if (ndvi > 0.8)
    return { zone: 'Excellent', color: '#16a34a', description: 'Dense healthy vegetation' };
  if (ndvi >= 0.6)
    return { zone: 'Good', color: '#22c55e', description: 'Moderate-to-dense vegetation' };
  if (ndvi >= 0.4)
    return { zone: 'Moderate', color: '#f59e0b', description: 'Sparse to moderate vegetation' };
  if (ndvi >= 0.2)
    return { zone: 'Weak', color: '#f97316', description: 'Sparse vegetation or degraded land' };
  return { zone: 'Poor', color: '#ef4444', description: 'Bare soil or very sparse vegetation' };
}

/**
 * analyzeNDVI
 * Combined function returning full NDVI result.
 */
export function analyzeNDVI(soilMoisture: number, rainfall: number, humidity: number): NDVIResult {
  const ndvi = estimateNDVI(soilMoisture, rainfall, humidity);
  const classification = classifyNDVI(ndvi);
  return { ndvi, ...classification };
}
