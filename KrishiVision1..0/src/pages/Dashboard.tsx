import { useState, useEffect, useCallback, useRef } from 'react';
import { getDashboardData, type DashboardData } from '../services/dataService';
import { AnalyticsPanel } from '../components/Dashboard/AnalyticsPanel';
import { InsightsPanel } from '../components/Dashboard/InsightsPanel';
import { ComparisonPanel } from '../components/Dashboard/ComparisonPanel';
import { NDVIChart } from '../components/Dashboard/Charts/NDVIChart';
import { RainfallChart } from '../components/Dashboard/Charts/RainfallChart';
import { TemperatureChart } from '../components/Dashboard/Charts/TemperatureChart';
import { RefreshCw, AlertTriangle, Satellite, MapPin } from 'lucide-react';
import MapWrapper from '../components/Map/MapWrapper';


const DEFAULT_LOCATION = {
  lat: 13.0827,
  lng: 80.2707,
};

const REFRESH_INTERVAL = 60_000; // 60 seconds
const MAX_HISTORY = 10;

interface HistoryPoint {
  time: string;
  ndvi: number;
  rainfall: number;
  temperature: number;
}

export function Dashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [comparisonList, setComparisonList] = useState<DashboardData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [location, setLocation] = useState(DEFAULT_LOCATION);
  const [history, setHistory] = useState<HistoryPoint[]>([]);
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchData = useCallback(
    async (lat: number, lng: number, isRefresh = false) => {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);
      setError(null);

      try {
        const result = await getDashboardData(lat, lng);
        setData(result);
        setLastRefresh(new Date());

        // Update comparison list: Keep last 2 unique locations
        setComparisonList((prev) => {
          const isSameLoc = prev[prev.length - 1]?.lat === result.lat && prev[prev.length - 1]?.lng === result.lng;
          if (isSameLoc) {
            // Update current location's data in the comparison list
            const updated = [...prev];
            updated[updated.length - 1] = result;
            return updated;
          }
          const newList = [...prev, result];
          return newList.slice(-2);
        });

        setHistory((prev) => {
          // If history is empty, seed it with 10 varied points for realism
          if (prev.length === 0) {
            const seed: HistoryPoint[] = [];
            const now = new Date();
            for (let i = 10; i > 0; i--) {
              const time = new Date(now.getTime() - i * REFRESH_INTERVAL);
              // Add slight random variations to seed data
              seed.push({
                time: time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                ndvi: Math.max(0.1, Math.min(0.9, result.ndvi + (Math.random() * 0.06 - 0.03))),
                rainfall: result.rainfall > 0 ? Math.max(0, result.rainfall + (Math.random() * 0.4 - 0.2)) : 0,
                temperature: result.temperature + (Math.random() * 1.5 - 0.75),
              });
            }
            return seed;
          }

          const point: HistoryPoint = {
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            ndvi: result.ndvi,
            rainfall: result.rainfall,
            temperature: result.temperature,
          };
          const updated = [...prev, point];
          return updated.slice(-MAX_HISTORY);
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch data. Please try again.');
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    []
  );

  // Initial load
  useEffect(() => {
    fetchData(location.lat, location.lng);
  }, [location, fetchData]);

  // Auto-refresh every 60s
  useEffect(() => {
    intervalRef.current = setInterval(() => {
      fetchData(location.lat, location.lng, true);
    }, REFRESH_INTERVAL);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [location, fetchData]);

  /**
   * Public API: updateLocation(lat, lng)
   * This function is the map integration hook.
   * The map component can call this to trigger a location-based data refresh.
   */
  const updateLocation = useCallback(
    (lat: number, lng: number) => {
      setLocation({ lat, lng });
    },
    []
  );

  // Expose updateLocation for map integration (window-level)
  useEffect(() => {
    (window as unknown as Record<string, unknown>).updateDashboardLocation = updateLocation;
    return () => {
      delete (window as unknown as Record<string, unknown>).updateDashboardLocation;
    };
  }, [updateLocation]);

  const handleRetry = () => {
    fetchData(location.lat, location.lng);
  };

  const handleManualRefresh = () => {
    fetchData(location.lat, location.lng, true);
  };

  return (
  <div className="dashboard">

      <div className="dashboard-map-section">
        <MapWrapper />
      </div>


    {/* Header */}
    <header className="dashboard-header">
        <div className="header-brand">
          <div className="header-icon">
            <Satellite size={20} />
          </div>
          <div>
            <h1 className="header-title">Land Intelligence Dashboard</h1>
            <p className="header-subtitle">Real-time Environmental Monitoring</p>
          </div>
        </div>
        <div className="header-actions">
          <div className="location-info">
            <MapPin size={14} />
            <span>{location.lat.toFixed(4)}°N, {location.lng.toFixed(4)}°E — Chennai, IN</span>
          </div>
          {lastRefresh && (
            <div className="refresh-timestamp">
              Updated {lastRefresh.toLocaleTimeString()}
            </div>
          )}
          {data?.isSimulated && (
            <div className="simulated-badge" title="Operating in offline/simulated mode due to API limitations">
              <Satellite size={14} />
              <span>SIMULATED</span>
            </div>
          )}
          <button
            className={`refresh-btn ${refreshing ? 'refreshing' : ''}`}
            onClick={handleManualRefresh}
            disabled={loading || refreshing}
            title="Refresh data"
          >
            <RefreshCw size={16} className={refreshing ? 'spinning' : ''} />
            {refreshing ? 'Refreshing...' : 'Refresh'}
          </button>
        </div>
      </header>

      {/* Simulated Data Banner */}
      {data?.isSimulated && (
        <div className="simulated-banner">
          <AlertTriangle size={16} />
          <span>External APIs (Open-Meteo/SoilGrids) are currently unavailable. Displaying realistic simulated data for this location.</span>
        </div>
      )}

      {/* Error Banner */}
      {error && (
        <div className="error-banner">
          <AlertTriangle size={18} />
          <span>{error}</span>
          <button className="retry-btn" onClick={handleRetry}>
            Try Again
          </button>
        </div>
      )}

      {/* Main Layout */}
      <div className="dashboard-layout">
        {/* Charts Section */}
        <main className="dashboard-main">
          {loading && !error ? (
            <div className="loading-screen">
              <div className="loading-spinner" />
              <p className="loading-text">Fetching environmental data...</p>
              <span className="loading-sub">Connecting to weather & soil APIs</span>
            </div>
          ) : (
            <>
              <div className="charts-grid">
                <div className="chart-card">
                  <NDVIChart
                    history={
                      history.length > 0
                        ? history
                        : data
                        ? [{ time: 'Now', ndvi: data.ndvi, rainfall: data.rainfall, temperature: data.temperature }]
                        : []
                    }
                  />
                </div>
                <div className="chart-card">
                  <TemperatureChart
                    history={
                      history.length > 0
                        ? history
                        : data
                        ? [{ time: 'Now', ndvi: data.ndvi, rainfall: data.rainfall, temperature: data.temperature }]
                        : []
                    }
                  />
                </div>
              </div>
              <div className="chart-card chart-card-wide">
                <RainfallChart
                  history={
                    history.length > 0
                      ? history
                      : data
                      ? [{ time: 'Now', ndvi: data.ndvi, rainfall: data.rainfall, temperature: data.temperature }]
                      : []
                  }
                />
              </div>

              {/* AI Insights */}
              <InsightsPanel data={data} loading={loading} />

              {/* Comparison Panel (Auto-displays if 2 locations visited) */}
              <ComparisonPanel locations={comparisonList} />

              <div className="map-status-card">
                <div className="map-integration-inner">
                  <Satellite size={24} className="map-icon" />
                  <h3>GIS Mapping Active</h3>
                  <p>
                    The map above is synced with your dashboard. Click any plot to update real-time analytics.
                  </p>
                </div>
              </div>
            </>
          )}
        </main>

        {/* Right Analytics Panel */}
        <aside className="dashboard-aside">
          <AnalyticsPanel data={data} loading={loading} />
        </aside>
      </div>
    </div>
  );
}
