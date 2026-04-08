/**
 * soil.ts
 * Soil quality scoring based on pH value.
 * Optimal range derived from USDA soil classification guidelines.
 */

export interface SoilResult {
  soilScore: number;
  soilLabel: string;
  soilReason: string;
}

/**
 * scoreSoil
 * Rates soil quality 0–100 based on pH.
 *
 * Scoring logic:
 *   6.0–7.0 → Ideal for most crops           → 100
 *   5.0–6.0 or 7.0–8.0 → Suboptimal range   → 70
 *   <5.0 or >8.0 → Too acidic / too alkaline → 40
 */
export function scoreSoil(soilPH: number): SoilResult {
  if (soilPH >= 6.0 && soilPH <= 7.0) {
    return {
      soilScore: 100,
      soilLabel: 'Ideal',
      soilReason: `pH ${soilPH.toFixed(1)} is in the ideal range (6.0–7.0) for most crops.`,
    };
  }
  if ((soilPH >= 5.0 && soilPH < 6.0) || (soilPH > 7.0 && soilPH <= 8.0)) {
    return {
      soilScore: 70,
      soilLabel: 'Moderate',
      soilReason:
        soilPH < 6.0
          ? `pH ${soilPH.toFixed(1)} is mildly acidic. Consider liming to raise pH.`
          : `pH ${soilPH.toFixed(1)} is mildly alkaline. Consider sulfur amendments.`,
    };
  }
  return {
    soilScore: 40,
    soilLabel: 'Poor',
    soilReason:
      soilPH < 5.0
        ? `pH ${soilPH.toFixed(1)} is highly acidic. Significant soil amendment needed.`
        : `pH ${soilPH.toFixed(1)} is highly alkaline. Micronutrient deficiency likely.`,
  };
}
