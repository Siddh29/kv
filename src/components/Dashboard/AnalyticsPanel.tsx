import React from 'react';
import { type DashboardData } from '../../services/dataService';
import {
  Thermometer, Droplets, CloudRain, Wind,
  Leaf, Sprout, MapPin, FlaskConical, Activity,
  ShieldCheck, Droplet, AlertCircle, CheckCircle2
} from 'lucide-react';

// ─── Stat Card ────────────────────────────────────────────────
interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  unit?: string;
  color: string;
  subvalue?: string;
}

function StatCard({ icon, label, value, unit, color, subvalue }: StatCardProps) {
  return (
    <div className="stat-card" style={{ '--accent': color } as React.CSSProperties}>
      <div className="stat-card-icon" style={{ color }}>{icon}</div>
      <div className="stat-card-content">
        <div className="stat-card-label">{label}</div>
        <div className="stat-card-value">
          {value}
          {unit && <span className="stat-card-unit"> {unit}</span>}
        </div>
        {subvalue && <div className="stat-card-sub">{subvalue}</div>}
      </div>
    </div>
  );
}

// ─── Health Bar ───────────────────────────────────────────────
function HealthBar({ score, label }: { score: number; label: string; color: string }) {
  return (
    <div className="health-bar-wrapper">
      <div className="health-bar-header">
        <span className="health-bar-title">Land Health Score</span>
        <span className="health-score-value" style={{ color: '#16a34a' }}>
          {score}/100 · {label}
        </span>
      </div>
      <div className="health-bar-track">
        <div 
          className="health-bar-fill" 
          style={{ 
            width: `${score}%`, 
            background: 'linear-gradient(90deg, #ef4444 0%, #facc15 50%, #22c55e 100%)' 
          }} 
        />
      </div>
    </div>
  );
}

// ─── Score Breakdown Bar ──────────────────────────────────────
function ScoreRow({ label, score }: { label: string; score: number; color: string }) {
  return (
    <div className="score-row">
      <span className="score-row-label">{label}</span>
      <div className="score-row-track">
        <div className="score-row-fill" style={{ width: `${score}%`, background: '#22c55e' }} />
      </div>
      <span className="score-row-value" style={{ color: '#16a34a' }}>{score}</span>
    </div>
  );
}

// ─── Main Panel ───────────────────────────────────────────────
interface AnalyticsPanelProps {
  data: DashboardData | null;
  loading: boolean;
}

export function AnalyticsPanel({ data, loading }: AnalyticsPanelProps) {
  if (loading || !data) {
    return (
      <div className="analytics-panel">
        <div className="panel-header">
          <Activity size={18} />
          <h2>Analytics</h2>
        </div>
        <div className="panel-skeleton">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="skeleton-card" style={{ animationDelay: `${i * 0.1}s` }} />
          ))}
        </div>
      </div>
    );
  }

  const { analysis } = data;

  return (
    <div className="analytics-panel">
      <div className="panel-header">
        <Activity size={18} style={{ color: '#15803d' }} />
        <h2 style={{ color: '#15803d' }}>Analytics</h2>
      </div>

      {/* Location */}
      <div className="location-badge">
        <MapPin size={14} style={{ color: '#16a34a' }} />
        <span>{data.lat.toFixed(4)}°N, {data.lng.toFixed(4)}°E</span>
      </div>

      {/* Health Score */}
      <HealthBar
        score={analysis.healthScore}
        label={analysis.healthLabel}
        color="#16a34a"
      />

      {/* Sensor Readings */}
      <div className="stats-grid">
        <StatCard icon={<Thermometer size={20} />} label="Temperature"
          value={data.temperature.toFixed(1)} unit="°C" color="#16a34a"
          subvalue={`Feels like ${data.feelsLike.toFixed(1)}°C · ${analysis.tempLabel}`} />
        <StatCard icon={<Droplets size={20} />} label="Humidity"
          value={data.humidity} unit="%" color="#16a34a" />
        <StatCard icon={<CloudRain size={20} />} label="Rainfall"
          value={data.rainfall > 0 ? data.rainfall.toFixed(2) : 'No recent rainfall'} 
          unit={data.rainfall > 0 ? 'mm' : ''}
          color="#16a34a" subvalue={analysis.rainfallLabel} />
        <StatCard icon={<Wind size={20} />} label="Wind Speed"
          value={data.windSpeed.toFixed(1)} unit="m/s" color="#16a34a" />
        <StatCard icon={<FlaskConical size={20} />} label="Soil pH"
          value={data.soilPH != null ? data.soilPH.toFixed(1) : 'N/A'} color="#16a34a"
          subvalue={analysis.soilLabel} />
        <StatCard icon={<Droplet size={20} />} label="Soil Moisture"
          value={data.soilMoisture != null ? data.soilMoisture.toFixed(1) : 'N/A'}
          unit={data.soilMoisture != null ? '%' : ''} color="#16a34a"
          subvalue={analysis.moistureLabel} />
      </div>

      {/* NDVI */}
      <div className="ndvi-card" style={{ background: '#f0fdf4' }}>
        <div className="ndvi-header">
          <Leaf size={16} style={{ color: '#16a34a' }} />
          <span className="ndvi-title" style={{ color: '#15803d' }}>NDVI Index</span>
          <span className="ndvi-zone-badge" style={{ background: '#16a34a' + '22', color: '#16a34a' }}>
            {analysis.zone}
          </span>
        </div>
        <div className="ndvi-body">
          <span className="ndvi-score" style={{ color: '#16a34a' }}>{analysis.ndvi.toFixed(2)}</span>
          <span className="ndvi-label">{analysis.zoneDescription}</span>
        </div>
        <div className="ndvi-bar-track">
          <div className="ndvi-bar-fill" style={{ width: `${analysis.ndvi * 100}%`, background: '#16a34a' }} />
        </div>
      </div>

      {/* Environmental Risks */}
      <div className="risk-section">
        <div className="section-header">
          <AlertCircle size={14} />
          <span>Risk Indicators</span>
        </div>
        <div className="risk-grid">
          {Object.entries(analysis.environmentalRisks).map(([key, risk]) => (
            <div key={key} className="risk-badge-item" style={{ '--risk-color': risk.color } as React.CSSProperties}>
              <div className="risk-dot" />
              <div className="risk-info">
                <div className="risk-label">{risk.label}</div>
                <div className="risk-level">{risk.level}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Score Breakdown */}
      <div className="breakdown-card">
        <div className="breakdown-header">
          <ShieldCheck size={14} />
          <span>Score Breakdown</span>
        </div>
        <div className="breakdown-rows">
          <ScoreRow label="NDVI" score={Math.round(analysis.ndvi * 100)} color="#22c55e" />
          <ScoreRow label="Rainfall" score={analysis.rainfallScore} color="#818cf8" />
          <ScoreRow label="Soil pH" score={analysis.soilScore} color="#a78bfa" />
          <ScoreRow label="Temperature" score={analysis.tempScore} color="#f97316" />
          <ScoreRow label="Moisture" score={analysis.moistureScore} color="#34d399" />
        </div>
      </div>

      {/* Crop Recommendation */}
      <div className="crop-card">
        <div className="crop-header">
          <Sprout size={18} />
          <div className="crop-main">
            <div className="crop-label">Recommended Crop</div>
            <div className="crop-value">{analysis.cropRecommendation.crop}</div>
          </div>
          <div className="confidence-badge">
            {analysis.cropRecommendation.confidenceScore}%
          </div>
        </div>

        {/* Confidence Bar */}
        <div className="crop-confidence-wrapper">
          <div className="confidence-label">Confidence Score</div>
          <div className="confidence-track">
            <div 
              className="confidence-fill" 
              style={{ 
                width: `${analysis.cropRecommendation.confidenceScore}%`,
                background: analysis.cropRecommendation.confidenceScore > 80 ? '#34d399' : '#f59e0b'
              }} 
            />
          </div>
        </div>

        {/* Reasons List */}
        <div className="crop-reasons">
          {analysis.cropRecommendation.reasons.map((reason, idx) => (
            <div key={idx} className="reason-item">
              <CheckCircle2 size={12} className="text-accent-teal" />
              <span>{reason}</span>
            </div>
          ))}
        </div>

        {/* Alternative Crops */}
        <div className="alt-crops-v2">
          <div className="alt-crops-header">Alternatives</div>
          <div className="alt-crops-grid">
            {analysis.cropRecommendation.alternativeCrops.primary && (
              <div className="alt-item">
                <span className="alt-label">Primary</span>
                <span className="alt-value">{analysis.cropRecommendation.alternativeCrops.primary}</span>
              </div>
            )}
            {analysis.cropRecommendation.alternativeCrops.secondary && (
              <div className="alt-item">
                <span className="alt-label">Secondary</span>
                <span className="alt-value">{analysis.cropRecommendation.alternativeCrops.secondary}</span>
              </div>
            )}
            {analysis.cropRecommendation.alternativeCrops.alternative && (
              <div className="alt-item">
                <span className="alt-label">Alternative</span>
                <span className="alt-value">{analysis.cropRecommendation.alternativeCrops.alternative}</span>
              </div>
            )}
          </div>
        </div>

        {(analysis.cropRecommendation.irrigationNeeded || analysis.cropRecommendation.soilAmendmentNeeded) && (
          <div className="crop-alerts">
            {analysis.cropRecommendation.irrigationNeeded && (
              <div className="crop-alert">
                <AlertCircle size={12} />
                Irrigation recommended
              </div>
            )}
            {analysis.cropRecommendation.soilAmendmentNeeded && (
              <div className="crop-alert">
                <AlertCircle size={12} />
                Soil amendment needed
              </div>
            )}
          </div>
        )}
      </div>

      <div className="last-updated">
        Analyzed at {new Date(data.timestamp).toLocaleTimeString()}
      </div>
    </div>
  );
}
