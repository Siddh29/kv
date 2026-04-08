/**
 * rainfall.ts
 * Rainfall adequacy scoring for agricultural suitability.
 * Thresholds based on monthly average crop-water requirements (FAO Irrigation Paper 56).
 */

export interface RainfallResult {
  rainfallScore: number;
  rainfallLabel: string;
  rainfallReason: string;
}

/**
 * scoreRainfall
 * Rates rainfall suitability 0–100.
 *
 * Note: Input is treated as precipitation (mm) over the observation period.
 *
 * Scoring logic:
 *   80–150 mm → Adequate for most rain-fed crops        → 100
 *   50–80 mm or 150–200 mm → Borderline / excess risk   → 70
 *   <50 mm or >200 mm → Drought / waterlogging risk     → 40
 */
export function scoreRainfall(rainfall: number): RainfallResult {
  if (rainfall >= 80 && rainfall <= 150) {
    return {
      rainfallScore: 100,
      rainfallLabel: 'Adequate',
      rainfallReason: `${rainfall.toFixed(1)} mm is in the optimal range (80–150 mm) for most crops.`,
    };
  }
  if ((rainfall >= 50 && rainfall < 80) || (rainfall > 150 && rainfall <= 200)) {
    return {
      rainfallScore: 70,
      rainfallLabel: 'Marginal',
      rainfallReason:
        rainfall < 80
          ? `${rainfall.toFixed(1)} mm is low. Supplemental irrigation may be required.`
          : `${rainfall.toFixed(1)} mm is above ideal. Monitor for waterlogging.`,
    };
  }
  return {
    rainfallScore: 40,
    rainfallLabel: rainfall < 50 ? 'Drought Risk' : 'Flood Risk',
    rainfallReason:
      rainfall < 50
        ? `${rainfall.toFixed(1)} mm is critically low. Irrigation is essential.`
        : `${rainfall.toFixed(1)} mm exceeds safe thresholds. Drainage needed to prevent damage.`,
  };
}
