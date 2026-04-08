/**
 * crop.ts
 * Rule-based crop recommendation engine.
 * Uses environmental parameters and derived NDVI to recommend the best crop.
 *
 * Logic is fully explainable — each rule has a documented reason and confidence score.
 */

export interface CropRecommendation {
  crop: string;
  reasons: string[];
  confidenceScore: number; // 0–100
  alternativeCrops: {
    primary?: string;
    secondary?: string;
    alternative?: string;
  };
  irrigationNeeded: boolean;
  soilAmendmentNeeded: boolean;
}

/**
 * recommendCrop
 * Applies ordered rule-based matching to find the most suitable crop.
 *
 * Rules prioritized by agronomic specificity (most specific → most general).
 */
export function recommendCrop(params: {
  temperature: number;
  rainfall: number;
  humidity: number;
  soilPH: number;
  soilMoisture: number;
  ndvi: number;
}): CropRecommendation {
  const { temperature, rainfall, humidity, soilPH, soilMoisture, ndvi } = params;

  // ── Rule 1: Rice ──────────────────────────────────────────────
  if (soilPH >= 6.0 && soilPH <= 7.0 && rainfall > 100 && temperature > 25) {
    return {
      crop: 'Rice (Paddy)',
      reasons: [
        `Optimal pH (${soilPH.toFixed(1)}) detected`,
        `High rainfall (${rainfall.toFixed(1)}mm) supports water-intensive growth`,
        `Warm temperature (${temperature.toFixed(1)}°C) is ideal for rice`,
      ],
      confidenceScore: 92,
      alternativeCrops: {
        primary: 'Jute',
        secondary: 'Taro',
        alternative: 'Water Spinach',
      },
      irrigationNeeded: false,
      soilAmendmentNeeded: false,
    };
  }

  // ── Rule 2: Sugarcane ─────────────────────────────────────────
  if (soilMoisture > 40 && temperature > 25 && temperature <= 35 && humidity > 70) {
    return {
      crop: 'Sugarcane',
      reasons: [
        `High soil moisture (${soilMoisture.toFixed(1)}%) identified`,
        `Warm tropical climate (${temperature.toFixed(1)}°C)`,
        `High relative humidity (${humidity}%) favors sugarcane`,
      ],
      confidenceScore: 85,
      alternativeCrops: {
        primary: 'Banana',
        secondary: 'Cassava',
        alternative: 'Sweet Potato',
      },
      irrigationNeeded: false,
      soilAmendmentNeeded: soilPH < 6.0 || soilPH > 7.5,
    };
  }

  // ── Rule 3: Wheat ─────────────────────────────────────────────
  if (ndvi > 0.5 && temperature >= 20 && temperature <= 30) {
    return {
      crop: 'Wheat',
      reasons: [
        `Strong NDVI signals (${ndvi.toFixed(2)}) indicate good biomass`,
        `Temperature (${temperature.toFixed(1)}°C) is within optimal winter-crop range`,
      ],
      confidenceScore: 80,
      alternativeCrops: {
        primary: 'Barley',
        secondary: 'Oats',
        alternative: 'Mustard',
      },
      irrigationNeeded: soilMoisture < 30,
      soilAmendmentNeeded: soilPH < 6.0 || soilPH > 7.5,
    };
  }

  // ── Rule 4: Millet ───────────────────────────────────────────
  if (rainfall < 80) {
    return {
      crop: 'Millet / Sorghum',
      reasons: [
        `Low rainfall detected (${rainfall.toFixed(1)}mm)`,
        `Arid condition suitability`,
        `Low soil moisture requirements`,
      ],
      confidenceScore: 75,
      alternativeCrops: {
        primary: 'Sorghum',
        secondary: 'Groundnut',
        alternative: 'Chickpea',
      },
      irrigationNeeded: true,
      soilAmendmentNeeded: soilPH < 5.5 || soilPH > 8.0,
    };
  }

  // ── Rule 5: Maize ────────────────────────────────────────────
  if (temperature >= 22 && temperature <= 35 && soilMoisture >= 25) {
    return {
      crop: 'Maize (Corn)',
      reasons: [
        `Temperature (${temperature.toFixed(1)}°C) supports maize maturation`,
        `Moderate soil moisture (${soilMoisture.toFixed(1)}%) is adequate`,
      ],
      confidenceScore: 72,
      alternativeCrops: {
        primary: 'Soybean',
        secondary: 'Sunflower',
        alternative: 'Cotton',
      },
      irrigationNeeded: soilMoisture < 35,
      soilAmendmentNeeded: soilPH < 5.8 || soilPH > 7.0,
    };
  }

  // ── Rule 6: Mixed Crops (Default) ────────────────────────────
  return {
    crop: 'Mixed Vegetables',
    reasons: [
      `Varied conditions observed`,
      `Climate supports diverse vegetable production`,
      `Temperature (${temperature.toFixed(1)}°C) is moderately versatile`,
    ],
    confidenceScore: 55,
    alternativeCrops: {
      primary: 'Tomato',
      secondary: 'Chili',
      alternative: 'Beans',
    },
    irrigationNeeded: soilMoisture < 30,
    soilAmendmentNeeded: soilPH < 5.5 || soilPH > 7.5,
  };
}
