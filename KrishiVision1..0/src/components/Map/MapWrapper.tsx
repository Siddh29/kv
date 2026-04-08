
import { useEffect, useState } from "react";
import { MapContainer, TileLayer, GeoJSON, useMap, useMapEvents } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix for default marker icons in Leaflet with React
// @ts-ignore
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

function FitBounds({ boundary }: { boundary: any }) {
  const map = useMap();
  useEffect(() => {
    if (boundary) {
      try {
        const layer = L.geoJSON(boundary);
        const bounds = layer.getBounds();
        if (bounds.isValid()) {
          map.fitBounds(bounds, { padding: [50, 50] });
        }
      } catch (e) {
        console.error("Error fitting bounds:", e);
      }
    }
  }, [map, boundary]);
  return null;
}

function MapEvents({ onLocationSelect }: { onLocationSelect: (lat: number, lng: number) => void }) {
  const map = useMap();
  useMapEvents({
    click(e) {
      const { lat, lng } = e.latlng;
      onLocationSelect(lat, lng);
      L.popup()
        .setLatLng(e.latlng)
        .setContent(`Plot Selected: ${lat.toFixed(4)}, ${lng.toFixed(4)}`)
        .openOn(map);
    },
  });
  return null;
}

export default function MapWrapper() {
  const [boundary, setBoundary] = useState<any>(null);
  const [showDEM, setShowDEM] = useState(true);
  const [showOrtho, setShowOrtho] = useState(true);

  useEffect(() => {
    fetch("/boundary.geojson")
      .then((res) => {
        if (!res.ok) throw new Error("Boundary file not found");
        return res.json();
      })
      .then((data) => setBoundary(data))
      .catch((err) => console.error("Error loading boundary:", err));
  }, []);

  const handleLocationSelect = (lat: number, lng: number) => {
    if ((window as any).updateDashboardLocation) {
      (window as any).updateDashboardLocation(lat, lng);
    }
  };

  return (
    <div className="map-container-wrapper" style={{ 
      position: "relative", 
      height: "450px", 
      width: "100%", 
      borderRadius: "16px", 
      overflow: "hidden",
      border: "1px solid rgba(0,0,0,0.1)",
      boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)"
    }}>
      <MapContainer
        center={[13.0827, 80.2707]}
        zoom={13}
        scrollWheelZoom={true}
        style={{ height: "100%", width: "100%", cursor: "crosshair" }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution="&copy; OpenStreetMap"
        />

        {showOrtho && (
          <TileLayer
            url="/ortho_tiles/{z}/{x}/{y}.png"
            minZoom={10}
            maxZoom={20}
            opacity={1}
            zIndex={10}
          />
        )}

        {showDEM && (
          <TileLayer
            url="/tiles/{z}/{x}/{y}.png"
            minZoom={10}
            maxZoom={20}
            opacity={0.6}
            zIndex={5}
          />
        )}

        {boundary && <GeoJSON data={boundary} style={{ color: "#22c55e", weight: 2, fillOpacity: 0.1 }} />}
        
        <FitBounds boundary={boundary} />
        <MapEvents onLocationSelect={handleLocationSelect} />
      </MapContainer>

      {/* Manual Layer Controls */}
      <div style={{
        position: "absolute",
        top: "16px",
        right: "16px",
        zIndex: 1000,
        display: "flex",
        flexDirection: "column",
        gap: "10px",
      }}>
        <button
          onClick={(e) => { e.stopPropagation(); setShowOrtho(!showOrtho); }}
          style={{
            padding: "8px 16px",
            background: showOrtho ? "#15803d" : "#4b5563",
            color: "white",
            border: "none",
            borderRadius: "12px",
            cursor: "pointer",
            fontWeight: "600",
            fontSize: "12px",
            boxShadow: "0 4px 6px rgba(0,0,0,0.2)",
            transition: "all 0.2s",
            backdropFilter: "blur(4px)"
          }}
        >
          {showOrtho ? "Ortho Active" : "Show Ortho"}
        </button>

        <button
          onClick={(e) => { e.stopPropagation(); setShowDEM(!showDEM); }}
          style={{
            padding: "8px 16px",
            background: showDEM ? "#1d4ed8" : "#4b5563",
            color: "white",
            border: "none",
            borderRadius: "12px",
            cursor: "pointer",
            fontWeight: "600",
            fontSize: "12px",
            boxShadow: "0 4px 6px rgba(0,0,0,0.2)",
            transition: "all 0.2s",
            backdropFilter: "blur(4px)"
          }}
        >
          {showDEM ? "DEM Active" : "Show DEM"}
        </button>
      </div>

      <div style={{
        position: "absolute",
        bottom: "12px",
        left: "12px",
        zIndex: 1000,
        background: "rgba(255, 255, 255, 0.95)",
        padding: "6px 12px",
        borderRadius: "8px",
        fontSize: "12px",
        color: "#1e293b",
        border: "1px solid #e2e8f0",
        fontWeight: "600",
        boxShadow: "0 2px 4px rgba(0,0,0,0.05)"
      }}>
        📍 Click plot to update dashboard
      </div>
    </div>
  );
}