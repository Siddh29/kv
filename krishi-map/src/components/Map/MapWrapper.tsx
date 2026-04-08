"use client";

import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer, GeoJSON, useMap } from "react-leaflet";
import L from "leaflet";
import * as turf from "@turf/turf";
import "leaflet/dist/leaflet.css";

function FitBounds({ boundary }: { boundary: any }) {
  const map = useMap();
  useEffect(() => {
    if (boundary) {
      try {
        const layer = L.geoJSON(boundary);
        const bounds = layer.getBounds();
        if (bounds.isValid()) {
          map.fitBounds(bounds, { padding: [20, 20] });
        }
      } catch (e) {
        console.error("Error fitting bounds:", e);
      }
    }
  }, [map, boundary]);
  return null;
}

export default function MapWrapper() {
  const [boundary, setBoundary] = useState<any>(null);
  const [showDEM, setShowDEM] = useState(true);
  const [showOrtho, setShowOrtho] = useState(true);

  useEffect(() => {
    fetch("/Boundary.geojson")
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((data) => setBoundary(data))
      .catch((err) => console.error("Error loading boundary:", err));
  }, []);

  return (
    <div style={{ position: "relative", height: "100vh", width: "100%" }}>
      <MapContainer
  center={[10.4297, 77.2949]}
  zoom={16}
  style={{ height: "100%", width: "100%" }}
>
  <TileLayer
    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
    attribution="OpenStreetMap"
  />

  {showOrtho && (
    <TileLayer
      url="/ortho_tiles/{z}/{x}/{y}.png"
      minZoom={14}
      maxZoom={18}
      opacity={1}
    />
  )}
</MapContainer>

      {/* Controls */}
      <div style={{
        position: "absolute",
        top: 20,
        right: 20,
        zIndex: 1000,
        display: "flex",
        flexDirection: "column",
        gap: "10px",
      }}>
        <button
          onClick={() => setShowOrtho(!showOrtho)}
          style={{
            padding: "10px 16px",
            background: showOrtho ? "green" : "#555",
            color: "white",
            borderRadius: "8px",
            cursor: "pointer",
            border: "none",
            fontWeight: "bold",
          }}
        >
          {showOrtho ? "Hide Ortho" : "Show Ortho"}
        </button>

        <button
          onClick={() => setShowDEM(!showDEM)}
          style={{
            padding: "10px 16px",
            background: showDEM ? "#1a1a2e" : "#555",
            color: "white",
            borderRadius: "8px",
            cursor: "pointer",
            border: "none",
            fontWeight: "bold",
          }}
        >
          {showDEM ? "Hide DEM" : "Show DEM"}
        </button>
      </div>
    </div>
  );
}