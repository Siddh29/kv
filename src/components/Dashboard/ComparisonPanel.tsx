import { type DashboardData } from '../../services/dataService';
import { Layers, ArrowRight, TrendingUp, Thermometer, Droplet, Trophy } from 'lucide-react';

interface ComparisonPanelProps {
  locations: DashboardData[];
}

export function ComparisonPanel({ locations }: ComparisonPanelProps) {
  if (locations.length < 2) return null;

  const [loc1, loc2] = locations;

  // Decision Logic: Which is better?
  // Primary factor: healthScore. Secondary: NDVI.
  const score1 = loc1.analysis.healthScore;
  const score2 = loc2.analysis.healthScore;

  const winner = score1 >= score2 ? loc1 : loc2;
  const isDraw = score1 === score2;

  return (
    <div className="comparison-section">
      <div className="section-header">
        <Layers size={18} style={{ color: '#16a34a' }} />
        <h3 style={{ color: '#15803d' }}>Location Comparison</h3>
      </div>

      <div className="comparison-grid">
        {/* Metric Column: Labels */}
        <div className="comparison-labels">
          <div className="label-spacer" />
          <div className="metric-label"><TrendingUp size={14} /> NDVI</div>
          <div className="metric-label"><Thermometer size={14} /> Temp</div>
          <div className="metric-label"><Droplet size={14} /> Moisture</div>
          <div className="metric-label"><Trophy size={14} /> Health</div>
        </div>

        {/* Location 1 */}
        <div className={`comparison-col ${winner === loc1 && !isDraw ? 'is-winner' : ''}`}>
          <div className="col-header">
            <span className="col-name">Previous Area</span>
            <span className="col-coords">{loc1.lat.toFixed(3)}, {loc1.lng.toFixed(3)}</span>
            {winner === loc1 && !isDraw && <span className="winner-badge">BETTER CHOICE</span>}
          </div>
          <div className="metric-value">{loc1.analysis.ndvi.toFixed(2)}</div>
          <div className="metric-value">{loc1.temperature.toFixed(1)}°C</div>
          <div className="metric-value">{loc1.soilMoisture}%</div>
          <div className="metric-value score-highlight">{loc1.analysis.healthScore}/100</div>
        </div>

        {/* VS Divider */}
        <div className="comparison-vs">
          <div className="vs-line" />
          <div className="vs-circle">VS</div>
          <div className="vs-line" />
        </div>

        {/* Location 2 (Current) */}
        <div className={`comparison-col ${winner === loc2 && !isDraw ? 'is-winner' : ''}`}>
          <div className="col-header">
            <span className="col-name">Current Area</span>
            <span className="col-coords">{loc2.lat.toFixed(3)}, {loc2.lng.toFixed(3)}</span>
            {winner === loc2 && !isDraw && <span className="winner-badge">BETTER CHOICE</span>}
          </div>
          <div className="metric-value">{loc2.analysis.ndvi.toFixed(2)}</div>
          <div className="metric-value">{loc2.temperature.toFixed(1)}°C</div>
          <div className="metric-value">{loc2.soilMoisture}%</div>
          <div className="metric-value score-highlight">{loc2.analysis.healthScore}/100</div>
        </div>
      </div>

      <div className="comparison-verdict">
        <ArrowRight size={16} className="verdict-icon" />
        <span>
          {isDraw 
            ? "Both locations show equal agricultural suitability." 
            : `Analysis suggests the area at ${winner.lat.toFixed(3)}, ${winner.lng.toFixed(3)} is currently more suitable for cultivation.`}
        </span>
      </div>
    </div>
  );
}
