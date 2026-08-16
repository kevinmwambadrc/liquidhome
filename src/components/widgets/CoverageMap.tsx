"use client";

import { useRef, useState } from "react";
import {
  MapContainer,
  TileLayer,
  Polygon,
  Marker,
  Popup,
  ZoomControl,
  useMap,
  useMapEvents,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import {
  Layers,
  Plus,
  Minus,
  Crosshair,
  CheckCircle2,
  Clock,
} from "lucide-react";
import {
  COVERAGE_ZONES,
  KINSHASA_CENTER,
  findZoneAt,
  type CoverageZone,
} from "@/lib/coverage";

// Fix default marker icon issue with Leaflet in bundlers
const orangeIcon = L.divIcon({
  html: `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="40" viewBox="0 0 24 24" fill="#F89E3C" stroke="#fff" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" style="filter: drop-shadow(0 4px 6px rgba(0,0,0,0.3));">
    <path d="M20 10c0 7-8 12-8 12s-8-5-8-12a8 8 0 0 1 16 0Z"/>
    <circle cx="12" cy="10" r="3" fill="#fff"/>
  </svg>`,
  className: "",
  iconSize: [32, 40],
  iconAnchor: [16, 40],
  popupAnchor: [0, -38],
});

interface CoverageMapProps {
  position: { lat: number; lng: number };
  onPositionChange: (pos: { lat: number; lng: number }) => void;
  onZoneChange?: (zone: CoverageZone | null) => void;
}

function MapClickHandler({
  onPositionChange,
  onZoneChange,
}: {
  onPositionChange: (pos: { lat: number; lng: number }) => void;
  onZoneChange?: (zone: CoverageZone | null) => void;
}) {
  useMapEvents({
    click(e) {
      const { lat, lng } = e.latlng;
      onPositionChange({ lat, lng });
      if (onZoneChange) onZoneChange(findZoneAt(lat, lng));
    },
  });
  return null;
}

function DraggableMarker({
  position,
  onPositionChange,
  onZoneChange,
}: {
  position: { lat: number; lng: number };
  onPositionChange: (pos: { lat: number; lng: number }) => void;
  onZoneChange?: (zone: CoverageZone | null) => void;
}) {
  return (
    <Marker
      position={[position.lat, position.lng]}
      icon={orangeIcon}
      draggable
      eventHandlers={{
        dragend(e) {
          const m = e.target as L.Marker;
          const ll = m.getLatLng();
          onPositionChange({ lat: ll.lat, lng: ll.lng });
          if (onZoneChange) onZoneChange(findZoneAt(ll.lat, ll.lng));
        },
      }}
    >
      <Popup>
        <div className="text-sm">
          <p className="font-bold text-brand-navy">Votre emplacement</p>
          <p className="text-xs text-gray-600">
            {position.lat.toFixed(5)}, {position.lng.toFixed(5)}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            Glissez l&apos;épingle pour ajuster
          </p>
        </div>
      </Popup>
    </Marker>
  );
}

/**
 * All map controls that need useMap() must be rendered as children of MapContainer.
 * This component renders custom HTML controls positioned absolutely on top of the map.
 */
function MapControls({
  tileLayer,
  onToggleTile,
  onPositionChange,
  onZoneChange,
}: {
  tileLayer: "street" | "satellite";
  onToggleTile: () => void;
  onPositionChange: (pos: { lat: number; lng: number }) => void;
  onZoneChange?: (zone: CoverageZone | null) => void;
}) {
  const map = useMap();

  return (
    <>
      {/* Top-right controls */}
      <div className="leaflet-top leaflet-right">
        <div className="leaflet-control flex flex-col gap-2 p-2">
          <button
            onClick={onToggleTile}
            className="bg-white hover:bg-gray-50 border border-gray-300 rounded-md shadow-md px-3 py-2 flex items-center gap-1.5 text-xs font-semibold text-brand-navy transition-colors"
            title="Basculer carte/satellite"
          >
            <Layers className="h-3.5 w-3.5" />
            {tileLayer === "street" ? "Satellite" : "Plan"}
          </button>
          <button
            onClick={() => map.zoomIn()}
            className="bg-white hover:bg-gray-50 border border-gray-300 rounded-md shadow-md w-9 h-9 flex items-center justify-center text-brand-navy transition-colors"
            title="Zoom +"
          >
            <Plus className="h-4 w-4" />
          </button>
          <button
            onClick={() => map.zoomOut()}
            className="bg-white hover:bg-gray-50 border border-gray-300 rounded-md shadow-md w-9 h-9 flex items-center justify-center text-brand-navy transition-colors"
            title="Zoom -"
          >
            <Minus className="h-4 w-4" />
          </button>
          <button
            onClick={() => map.setView(KINSHASA_CENTER, 13)}
            className="bg-white hover:bg-gray-50 border border-gray-300 rounded-md shadow-md w-9 h-9 flex items-center justify-center text-brand-navy transition-colors"
            title="Recentrer sur Kinshasa"
          >
            <Crosshair className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Top-center: geolocate button */}
      <div className="leaflet-top leaflet-center" style={{ left: "50%", transform: "translateX(-50%)" }}>
        <div className="leaflet-control p-2">
          <button
            onClick={() => {
              if (typeof window === "undefined" || !navigator.geolocation) return;
              navigator.geolocation.getCurrentPosition(
                (pos) => {
                  const { latitude, longitude } = pos.coords;
                  onPositionChange({ lat: latitude, lng: longitude });
                  if (onZoneChange) onZoneChange(findZoneAt(latitude, longitude));
                  map.setView([latitude, longitude], 15);
                },
                () => {
                  // Fall back to Kinshasa center with small random offset
                  const lat = KINSHASA_CENTER[0] + (Math.random() - 0.5) * 0.02;
                  const lng = KINSHASA_CENTER[1] + (Math.random() - 0.5) * 0.02;
                  onPositionChange({ lat, lng });
                  if (onZoneChange) onZoneChange(findZoneAt(lat, lng));
                  map.setView([lat, lng], 14);
                }
              );
            }}
            className="bg-brand-navy hover:bg-brand-navy-light text-white rounded-md shadow-md px-3 py-2 flex items-center gap-1.5 text-xs font-semibold transition-colors"
            title="Utiliser ma position"
          >
            <Crosshair className="h-3.5 w-3.5" />
            Ma position
          </button>
        </div>
      </div>
    </>
  );
}

export default function CoverageMap({
  position,
  onPositionChange,
  onZoneChange,
}: CoverageMapProps) {
  const [tileLayer, setTileLayer] = useState<"street" | "satellite">("street");
  const mapRef = useRef<L.Map | null>(null);

  return (
    <div className="relative">
      <MapContainer
        center={KINSHASA_CENTER}
        zoom={13}
        scrollWheelZoom={false}
        zoomControl={false}
        className="aspect-square w-full rounded-lg overflow-hidden border-2 border-gray-200 z-0"
        ref={(m) => {
          if (m) mapRef.current = m;
        }}
      >
        {tileLayer === "street" ? (
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
        ) : (
          <TileLayer
            attribution="Imagery &copy; Esri, Maxar, Earthstar Geographics"
            url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
          />
        )}

        {/* Coverage polygons (KMZ-style overlay) */}
        {COVERAGE_ZONES.map((zone) => (
          <Polygon
            key={zone.id}
            positions={zone.polygon}
            pathOptions={{
              color: zone.color,
              fillColor: zone.color,
              fillOpacity: zone.status === "available" ? 0.25 : 0.1,
              weight: 2,
              dashArray: zone.status === "coming-soon" ? "5,5" : undefined,
            }}
          >
            <Popup>
              <div className="text-sm min-w-[140px]">
                <p className="font-bold text-brand-navy">{zone.name}</p>
                <p className="text-xs text-gray-600">Commune de {zone.commune}</p>
                {zone.status === "available" ? (
                  <p className="text-xs text-green-600 font-semibold flex items-center gap-1 mt-1">
                    <CheckCircle2 className="h-3 w-3" /> Fibre disponible
                  </p>
                ) : (
                  <p className="text-xs text-gray-500 font-semibold flex items-center gap-1 mt-1">
                    <Clock className="h-3 w-3" /> Bientôt disponible
                  </p>
                )}
              </div>
            </Popup>
          </Polygon>
        ))}

        <DraggableMarker
          position={position}
          onPositionChange={onPositionChange}
          onZoneChange={onZoneChange}
        />
        <MapClickHandler
          onPositionChange={onPositionChange}
          onZoneChange={onZoneChange}
        />
        <ZoomControl position="topleft" />

        {/* Custom controls - must be inside MapContainer to use useMap() */}
        <MapControls
          tileLayer={tileLayer}
          onToggleTile={() =>
            setTileLayer((t) => (t === "street" ? "satellite" : "street"))
          }
          onPositionChange={onPositionChange}
          onZoneChange={onZoneChange}
        />
      </MapContainer>

      {/* Legend - outside the map */}
      <div className="mt-3 bg-white rounded-md border border-gray-200 p-3 text-xs">
        <p className="font-semibold text-brand-navy mb-2">
          Légende de couverture fibre
        </p>
        <div className="flex flex-wrap gap-4">
          <div className="flex items-center gap-1.5">
            <span
              className="inline-block w-4 h-4 rounded-sm"
              style={{
                backgroundColor: "#F89E3C",
                opacity: 0.5,
                border: "1px solid #F89E3C",
              }}
            />
            <span className="text-brand-navy">Zone couverte</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span
              className="inline-block w-4 h-4 rounded-sm"
              style={{
                backgroundColor: "#888888",
                opacity: 0.3,
                border: "1px dashed #888888",
              }}
            />
            <span className="text-brand-navy">Bientôt disponible</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span
              className="inline-block w-3 h-3 rounded-full"
              style={{ backgroundColor: "#F89E3C" }}
            />
            <span className="text-brand-navy">Votre emplacement</span>
          </div>
        </div>
      </div>
    </div>
  );
}
