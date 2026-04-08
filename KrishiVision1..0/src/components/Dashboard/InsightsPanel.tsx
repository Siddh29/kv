import React from 'react';
import { type DashboardData } from '../../services/dataService';
import { 
  AlertTriangle, 
  ThermometerSun, 
  CloudOff, 
  TrendingDown, 
  DropletOff, 
  CheckCircle2, 
  Info,
  Zap
} from 'lucide-react';

interface Insight {
  id: string;
  title: string;
  explanation: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  icon: React.ReactNode;
}

interface InsightsPanelProps {
  data: DashboardData | null;
  loading: boolean;
}

export function InsightsPanel({ data, loading }: InsightsPanelProps) {
  if (loading || !data) {
    return (
      <div className="insights-panel-loading">
        <div className="skeleton-insight" />
        <div className="skeleton-insight" />
        <div className="skeleton-insight" />
      </div>
    );
  }

  const generateInsights = (d: DashboardData): Insight[] => {
    const insights: Insight[] = [];
    const { temperature, rainfall, soilMoisture, ndvi } = d;

    // Rule 1: Rainfall / Drought
    if (rainfall < 20) {
      insights.push({
        id: 'drought-risk',
        title: 'High Drought Risk Detected',
        explanation: `Precipitation is currently ${rainfall.toFixed(1)}mm. Prolonged low rainfall may lead to severe water stress for crops.`,
        severity: 'critical',
        icon: <CloudOff size={20} />
      });
    } else if (rainfall > 150) {
      insights.push({
        id: 'flood-risk',
        title: 'Waterlogging Warning',
        explanation: `High rainfall (${rainfall.toFixed(1)}mm) detected. Monitor drainage systems to prevent root rot.`,
        severity: 'high',
        icon: <AlertTriangle size={20} />
      });
    }

    // Rule 2: Temperature / Heat Stress
    if (temperature > 30) {
      insights.push({
        id: 'heat-stress',
        title: 'Heat Stress Warning',
        explanation: `Temperature of ${temperature.toFixed(1)}°C exceeds optimal growth thresholds. Increased evapotranspiration likely.`,
        severity: 'high',
        icon: <ThermometerSun size={20} />
      });
    } else if (temperature < 15) {
      insights.push({
        id: 'cold-stress',
        title: 'Low Temperature Alert',
        explanation: `${temperature.toFixed(1)}°C is below ideal range. Germination and growth rates may be significantly slowed.`,
        severity: 'medium',
        icon: <Info size={20} />
      });
    }

    // Rule 3: NDVI / Vegetation Health
    if (ndvi < 0.4) {
      insights.push({
        id: 'poor-veg',
        title: 'Vegetation Health is Poor',
        explanation: `NDVI index of ${ndvi.toFixed(2)} indicates sparse or degraded vegetation. Immediate soil inspection recommended.`,
        severity: 'high',
        icon: <TrendingDown size={20} />
      });
    } else if (ndvi > 0.7) {
      insights.push({
        id: 'excellent-veg',
        title: 'Vibrant Vegetation detected',
        explanation: `Strong NDVI signals (${ndvi.toFixed(2)}) suggest healthy, dense biomass across the monitored area.`,
        severity: 'low',
        icon: <CheckCircle2 size={20} />
      });
    }

    // Rule 4: Soil Moisture
    const moistureValue = soilMoisture ?? 0;
    if (moistureValue < 30) {
      insights.push({
        id: 'dry-soil',
        title: 'Critical Soil Dryness',
        explanation: `Soil moisture at ${moistureValue}% is below optimal thresholds. Supplemental irrigation is strongly advised.`,
        severity: 'critical',
        icon: <DropletOff size={20} />
      });
    } else if (moistureValue > 50) {
      insights.push({
        id: 'good-moisture',
        title: 'Optimal Soil Moisture',
        explanation: `Current moisture levels (${moistureValue}%) are ideal for nutrient uptake and root development.`,
        severity: 'low',
        icon: <Zap size={20} />
      });
    }

    // Sort by severity: critical -> high -> medium -> low
    const severityMap = { critical: 0, high: 1, medium: 2, low: 3 };
    return insights.sort((a, b) => severityMap[a.severity] - severityMap[b.severity]).slice(0, 5);
  };

  const currentInsights = generateInsights(data);

  return (
    <div className="insights-section">
      <div className="section-header">
        <Zap size={18} style={{ color: '#16a34a' }} />
        <h3 style={{ color: '#15803d' }}>AI-Powered Insights</h3>
      </div>
      <div className="insights-grid">
        {currentInsights.map((insight) => (
          <div key={insight.id} className={`insight-card severity-${insight.severity}`}>
            <div className="insight-header">
              <div className="insight-icon-wrapper">
                {insight.icon}
              </div>
              <div className="insight-title-group">
                <span className="insight-severity-tag">{insight.severity.toUpperCase()}</span>
                <h4 className="insight-title">{insight.title}</h4>
              </div>
            </div>
            <p className="insight-explanation">{insight.explanation}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
