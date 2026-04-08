/**
 * health.ts
 * Composite Land Health Score calculation.
 * Combines NDVI, rainfall, soil, temperature, and moisture scores
 * using weighted average formula.
 */

export interface HealthResult {
  healthScore: number;
  healthLabel: string;
  healthColor: string;
  breakdown: {
    ndviContribution: number;
    rainfallContribution: number;
    soilContribution: number;
    tempContribution: number;
    moistureContribution: number;
  };
}

/**
 * computeHealthScore
 *
 * Formula (weighted contributions summing to 100%):
 *   NDVI        → 30% weight  (NDVI * 100 mapped 0–100)
 *   Rainfall    → 25% weight
 *   Soil        → 20% weight
 *   Temperature → 15% weight
 *   Moisture    → 10% weight
 *
 * All sub-scores are on a 0–100 scale.
 * Final score is clamped to 0–100.
 */
export function computeHealthScore(params: {
  ndvi: number;
  rainfallScore: number;
  soilScore: number;
  tempScore: number;
  moistureScore: number;
}): HealthResult {
  const { ndvi, rainfallScore, soilScore, tempScore, moistureScore } = params;

  const ndviNormalized = ndvi * 100; // Convert 0–1 → 0–100

  const ndviContribution     = ndviNormalized  * 0.30;
  const rainfallContribution = rainfallScore   * 0.25;
  const soilContribution     = soilScore       * 0.20;
  const tempContribution     = tempScore       * 0.15;
  const moistureContribution = moistureScore   * 0.10;

  const rawScore =
    ndviContribution +
    rainfallContribution +
    soilContribution +
    tempContribution +
    moistureContribution;

  const healthScore = Math.min(100, Math.max(0, Math.round(rawScore)));

  let healthLabel: string;
  let healthColor: string;

  if (healthScore > 90) {
    healthLabel = 'Excellent';
    healthColor = '#16a34a';
  } else if (healthScore >= 70) {
    healthLabel = 'Good';
    healthColor = '#22c55e';
  } else if (healthScore >= 40) {
    healthLabel = 'Moderate';
    healthColor = '#f59e0b';
  } else {
    healthLabel = 'Poor';
    healthColor = '#ef4444';
  }

  return {
    healthScore,
    healthLabel,
    healthColor,
    breakdown: {
      ndviContribution:     Math.round(ndviContribution),
      rainfallContribution: Math.round(rainfallContribution),
      soilContribution:     Math.round(soilContribution),
      tempContribution:     Math.round(tempContribution),
      moistureContribution: Math.round(moistureContribution),
    },
  };
}
