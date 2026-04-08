/**
 * risk.ts
 * Logic for detecting environmental risks based on thresholds.
 */

export interface RiskIndicator {
  label: string;
  level: 'High' | 'Medium' | 'Safe';
  color: string; // CSS variable or hex
  description: string;
}

export interface EnvironmentalRisks {
  drought: RiskIndicator;
  heat: RiskIndicator;
  vegetation: RiskIndicator;
}

export function detectRisks(params: {
  rainfall: number;
  temperature: number;
  soilMoisture: number;
  ndvi: number;
}): EnvironmentalRisks {
  const { rainfall, temperature, soilMoisture, ndvi } = params;

  // 1. Drought Risk
  let droughtLevel: 'High' | 'Medium' | 'Safe' = 'Safe';
  let droughtDesc = 'Water levels are sufficient';
  if (rainfall < 30 && soilMoisture < 30) {
    droughtLevel = 'High';
    droughtDesc = 'Critical water deficit detected';
  } else if (rainfall < 50 || soilMoisture < 40) {
    droughtLevel = 'Medium';
    droughtDesc = 'Low moisture, monitor irrigation';
  }

  // 2. Heat Risk
  let heatLevel: 'High' | 'Medium' | 'Safe' = 'Safe';
  let heatDesc = 'Temperature within optimal range';
  if (temperature > 32) {
    heatLevel = 'High';
    heatDesc = 'Extreme heat, high evapotranspiration';
  } else if (temperature > 28) {
    heatLevel = 'Medium';
    heatDesc = 'Elevated temperature observed';
  }

  // 3. Vegetation (NDVI) Risk
  let vegLevel: 'High' | 'Medium' | 'Safe' = 'Safe';
  let vegDesc = 'Health vegetation coverage';
  if (ndvi < 0.4) {
    vegLevel = 'High';
    vegDesc = 'Critical vegetation degradation';
  } else if (ndvi < 0.5) {
    vegLevel = 'Medium';
    vegDesc = 'Sparse vegetation detected';
  }

  const levelToColor = (level: 'High' | 'Medium' | 'Safe') => {
    switch (level) {
      case 'High': return '#ef4444'; // Red
      case 'Medium': return '#f59e0b'; // Yellow/Amber
      case 'Safe': return '#22c55e'; // Green
    }
  };

  return {
    drought: { 
      label: 'Drought Risk', 
      level: droughtLevel, 
      color: levelToColor(droughtLevel),
      description: droughtDesc 
    },
    heat: { 
      label: 'Heat Risk', 
      level: heatLevel, 
      color: levelToColor(heatLevel),
      description: heatDesc 
    },
    vegetation: { 
      label: 'Vegetation Risk', 
      level: vegLevel, 
      color: levelToColor(vegLevel),
      description: vegDesc 
    },
  };
}
