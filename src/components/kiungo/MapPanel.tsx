"use client";

import { useEffect } from "react";
import { MapContainer, Marker, Polyline, Popup, TileLayer, useMap, useMapEvents } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

export type MapPoint = {
  lat: number;
  lng: number;
  label: string;
  status?: string;
};

const forestIcon = L.divIcon({
  className: "",
  html: `<span style="display:block;width:14px;height:14px;border-radius:999px;background:var(--color-forest-900);border:2px solid var(--color-lime-500)"></span>`,
  iconSize: [14, 14],
  iconAnchor: [7, 7],
});

function Pick({ onPick }: { onPick: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(e) {
      onPick(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

function Fit({ points }: { points: MapPoint[] }) {
  const map = useMap();
  useEffect(() => {
    if (points.length === 0) return;
    if (points.length === 1) {
      const only = points[0];
      if (only) map.setView([only.lat, only.lng], 13);
      return;
    }
    map.fitBounds(
      points.map((p) => [p.lat, p.lng] as [number, number]),
      { padding: [24, 24] },
    );
  }, [map, points]);
  return null;
}

export function MapPanel({
  points,
  height = 240,
  connect = false,
  driftLabel,
  onPick,
}: {
  points: MapPoint[];
  height?: number;
  connect?: boolean;
  driftLabel?: string;
  onPick?: (lat: number, lng: number) => void;
}) {
  const center = points[0] ?? { lat: -1.2864, lng: 36.8172, label: "Nairobi" };
  return (
    <div className="overflow-hidden rounded-lg border border-line" style={{ height }}>
      <MapContainer
        center={[center.lat, center.lng]}
        zoom={12}
        style={{ height: "100%", width: "100%" }}
        scrollWheelZoom={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Fit points={points} />
        {onPick ? <Pick onPick={onPick} /> : null}
        {points.map((point) => (
          <Marker key={`${point.lat}-${point.lng}-${point.label}`} position={[point.lat, point.lng]} icon={forestIcon}>
            <Popup>{point.label}</Popup>
          </Marker>
        ))}
        {connect && points.length >= 2 && points[0] && points[1] ? (
          <Polyline
            positions={[
              [points[0].lat, points[0].lng],
              [points[1].lat, points[1].lng],
            ]}
            pathOptions={{ color: "var(--color-lime-500)", dashArray: "6 6", weight: 2 }}
          />
        ) : null}
      </MapContainer>
      {driftLabel ? (
        <p className="border-t border-line bg-forest-50 px-3 py-2 font-mono text-xs text-ink-600">
          {driftLabel}
        </p>
      ) : null}
    </div>
  );
}
