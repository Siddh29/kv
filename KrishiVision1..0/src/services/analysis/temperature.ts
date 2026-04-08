/**
 * temperature.ts
 * Temperature suitability scoring for agricultural use.
 * Based on generalized crop growth temperature thresholds (FAO).
 */

export interface TemperatureResult {
  tempScore: number;
  tempLabel: string;
  tempReason: string;
}

/**
 * scoreTemperature
 * Rates climate temperature suitability 0–100.
 *
 * Scoring logic:
 *   20–30°C → Optimal for most tropical/subtropical crops → 100
 *   15–20°C or 30–35°C → Acceptable but suboptimal        → 70
 *   <15°C or >35°C → Stressful for most crops             → 40
 */
export function scoreTemperature(temperature: number): TemperatureResult {
  if (temperature >= 20 && temperature <= 30) {
    return {
      tempScore: 100,
      tempLabel: 'Optimal',
      tempReason: `${temperature.toFixed(1)}°C is in the ideal growing range (20–30°C).`,
    };
  }
  if ((temperature >= 15 && temperature < 20) || (temperature > 30 && temperature <= 35)) {
    return {
      tempScore: 70,
      tempLabel: 'Acceptable',
      tempReason:
        temperature < 20
          ? `${temperature.toFixed(1)}°C is cool. Growth may slow for warm-season crops.`
          : `${temperature.toFixed(1)}°C is warm. Heat stress possible for sensitive crops.`,
    };
  }
  return {
    tempScore: 40,
    tempLabel: 'Stressful',
    tempReason:
      temperature < 15
        ? `${temperature.toFixed(1)}°C is too cold. Risk of frost damage for most crops.`
        : `${temperature.toFixed(1)}°C is too hot. Severe heat stress and moisture loss expected.`,
  };
}
