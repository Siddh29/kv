/**
 * analysisService.ts
 * ──────────────────────────────────────────────────────────────
 * Land Intelligence AI/Logic Engine — Main Pipeline
 *
 * This is the single entry point for all derived agricultural insights.
 * It accepts raw environmental sensor data and returns a structured
 * analysis JSON with NDVI, scores, health, and crop recommendation.
 *
 * NO API CALLS. NO UI LOGIC. Pure deterministic computation.
 * ──────────────────────────────────────────────────────────────
 */

import { analyzeNDVI, type NDVIResult } from './ndvi';
import { scoreSoil, type SoilResult } from './soil';
import { scoreTemperature, type TemperatureResult } from './temperature';
import { scoreRainfall, type RainfallResult } from './rainfall';
import { scoreMoisture, type MoistureResult } from './moisture';
import { computeHealthScore, type HealthResult } from './health';
import { recommendCrop, type CropRecommendation } from './crop';
import { detectRisks, type EnvironmentalRisks } from './risk';

// ─── Input Schema ─────────────────────────────────────────────

export interface LandInput {
  temperature: number;    // °C
  rainfall: number;       // mm (precipitation)
  humidity: number;       // % relative humidity
  soilPH: number;         // pH scale 0–14
  soilMoisture: number;   // % volumetric water content
}

// ─── Output Schema ────────────────────────────────────────────

export interface LandAnalysis {
  // Raw inputs (echoed back for traceability)
  input: LandInput;

  // NDVI
  ndvi: number;
  zone: string;
  zoneColor: string;
  zoneDescription: string;

  // Sub-scores (0–100)
  soilScore: number;
  soilLabel: string;
  soilReason: string;

  tempScore: number;
  tempLabel: string;
  tempReason: string;

  rainfallScore: number;
  rainfallLabel: string;
  rainfallReason: string;

  moistureScore: number;
  moistureLabel: string;
  moistureReason: string;

  // Composite health
  healthScore: number;
  healthLabel: string;
  healthColor: string;
  healthBreakdown: HealthResult['breakdown'];

  // AI Engine Output
  cropRecommendation: CropRecommendation;
  environmentalRisks: EnvironmentalRisks;

  // Metadata
  analyzedAt: string; // ISO timestamp
}

// ─── Main Pipeline ────────────────────────────────────────────

/**
 * analyzeLand
 *
 * Runs all analysis modules in sequence and returns a fully structured
 * LandAnalysis JSON object. No side effects.
 *
 * @param data - Raw environmental data from APIs
 * @returns LandAnalysis - Complete analysis result
 */
export function analyzeLand(data: LandInput): LandAnalysis {
  // Guard: Replace null/undefined gracefully with neutral defaults
  const safe: LandInput = {
    temperature: data.temperature ?? 25,
    rainfall:    data.rainfall    ?? 0,
    humidity:    data.humidity    ?? 50,
    soilPH:      data.soilPH      ?? 6.5,
    soilMoisture: data.soilMoisture ?? 20,
  };

  // 1. NDVI
  const ndviResult: NDVIResult = analyzeNDVI(safe.soilMoisture, safe.rainfall, safe.humidity);

  // 2. Sub-scores
  const soilResult: SoilResult = scoreSoil(safe.soilPH);
  const tempResult: TemperatureResult = scoreTemperature(safe.temperature);
  const rainfallResult: RainfallResult = scoreRainfall(safe.rainfall);
  const moistureResult: MoistureResult = scoreMoisture(safe.soilMoisture);

  // 3. Composite health score
  const healthResult: HealthResult = computeHealthScore({
    ndvi:           ndviResult.ndvi,
    rainfallScore:  rainfallResult.rainfallScore,
    soilScore:      soilResult.soilScore,
    tempScore:      tempResult.tempScore,
    moistureScore:  moistureResult.moistureScore,
  });

  // 4. Crop recommendation
  const cropRecommendation: CropRecommendation = recommendCrop({
    temperature:  safe.temperature,
    rainfall:     safe.rainfall,
    humidity:     safe.humidity,
    soilPH:       safe.soilPH,
    soilMoisture: safe.soilMoisture,
    ndvi:         ndviResult.ndvi,
  });

  // 5. Environmental Risks
  const environmentalRisks: EnvironmentalRisks = detectRisks({
    rainfall: safe.rainfall,
    temperature: safe.temperature,
    soilMoisture: safe.soilMoisture,
    ndvi: ndviResult.ndvi
  });

  // 5. Assemble final output
  return {
    input: safe,

    ndvi:             ndviResult.ndvi,
    zone:             ndviResult.zone,
    zoneColor:        ndviResult.color,
    zoneDescription:  ndviResult.description,

    soilScore:   soilResult.soilScore,
    soilLabel:   soilResult.soilLabel,
    soilReason:  soilResult.soilReason,

    tempScore:   tempResult.tempScore,
    tempLabel:   tempResult.tempLabel,
    tempReason:  tempResult.tempReason,

    rainfallScore:   rainfallResult.rainfallScore,
    rainfallLabel:   rainfallResult.rainfallLabel,
    rainfallReason:  rainfallResult.rainfallReason,

    moistureScore:   moistureResult.moistureScore,
    moistureLabel:   moistureResult.moistureLabel,
    moistureReason:  moistureResult.moistureReason,

    healthScore:     healthResult.healthScore,
    healthLabel:     healthResult.healthLabel,
    healthColor:     healthResult.healthColor,
    healthBreakdown: healthResult.breakdown,

    cropRecommendation,
    environmentalRisks,

    analyzedAt: new Date().toISOString(),
  };
}

// ─── Re-exports for granular use ─────────────────────────────
export type { NDVIResult, SoilResult, TemperatureResult, RainfallResult, MoistureResult, HealthResult, CropRecommendation };
export { analyzeNDVI, scoreSoil, scoreTemperature, scoreRainfall, scoreMoisture, computeHealthScore, recommendCrop };
