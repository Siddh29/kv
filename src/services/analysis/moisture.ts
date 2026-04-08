/**
 * moisture.ts
 * Soil moisture suitability scoring for agriculture.
 * Thresholds based on field capacity / wilting point references.
 */

export interface MoistureResult {
  moistureScore: number;
  moistureLabel: string;
  moistureReason: string;
}

/**
 * scoreMoisture
 * Rates soil moisture 0–100.
 *
 * Scoring logic:
 *   >40% → Optimal, seeds germinate well and roots thrive → 100
 *   25–40% → Below field capacity, but adequate           → 70
 *   <25% → Approaching wilting point, drought stress      → 40
 */
export function scoreMoisture(soilMoisture: number): MoistureResult {
  if (soilMoisture > 40) {
    return {
      moistureScore: 100,
      moistureLabel: 'Optimal',
      moistureReason: `${soilMoisture.toFixed(1)}% moisture is above field capacity — excellent for germination.`,
    };
  }
  if (soilMoisture >= 25) {
    return {
      moistureScore: 70,
      moistureLabel: 'Adequate',
      moistureReason: `${soilMoisture.toFixed(1)}% moisture is sufficient but supplemental irrigation may improve yields.`,
    };
  }
  return {
    moistureScore: 40,
    moistureLabel: 'Low',
    moistureReason: `${soilMoisture.toFixed(1)}% moisture is near wilting point. Irrigation strongly recommended.`,
  };
}
