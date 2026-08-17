"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import {
  MapPin,
  Crosshair,
  ExternalLink,
  Search,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Layers,
  Sparkles,
} from "lucide-react";
import {
  COVERAGE_ZONES,
  KINSHASA_CENTER,
  findZoneAt,
  type CoverageZone,
} from "@/lib/coverage";

interface GoogleCoverageMapProps {
  position: { lat: number; lng: number };
  onPositionChange: (pos: { lat: number; lng: number }) => void;
  onZoneChange?: (zone: CoverageZone | null) => void;
  onAddressDetected?: (addr: {
    street: string;
    houseNo: string;
    commune: string;
    formattedAddress: string;
    googleMapsUrl: string;
  }) => void;
}

export default function GoogleCoverageMap({
  position,
  onPositionChange,
  onZoneChange,
  onAddressDetected,
}: GoogleCoverageMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [mapType, setMapType] = useState<"roadmap" | "satellite">("roadmap");
  const [locating, setLocating] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<{ label: string; lat: number; lng: number }[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [currentZone, setCurrentZone] = useState<CoverageZone | null>(() =>
    findZoneAt(position.lat, position.lng)
  );

  const googleApiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "";

  // Reverse geocode when position changes
  const resolveAddress = useCallback(
    async (lat: number, lng: number) => {
      try {
        const res = await fetch(`/api/geocode/reverse?lat=${lat}&lng=${lng}`);
        if (res.ok) {
          const data = await res.json();
          if (data.ok && onAddressDetected) {
            onAddressDetected({
              street: data.street,
              houseNo: data.houseNo,
              commune: data.commune,
              formattedAddress: data.formattedAddress,
              googleMapsUrl: data.googleMapsUrl,
            });
          }
        }
      } catch (err) {
        console.warn("Reverse geocode error:", err);
      }
    },
    [onAddressDetected]
  );

  // Handle GPS location click
  const handleLocateMe = () => {
    if (!navigator.geolocation) {
      alert("La géolocalisation n'est pas supportée par votre navigateur.");
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const newPos = {
          lat: Number(pos.coords.latitude.toFixed(6)),
          lng: Number(pos.coords.longitude.toFixed(6)),
        };
        onPositionChange(newPos);
        const zone = findZoneAt(newPos.lat, newPos.lng);
        setCurrentZone(zone);
        if (onZoneChange) onZoneChange(zone);
        await resolveAddress(newPos.lat, newPos.lng);
        setLocating(false);
      },
      (err) => {
        console.error("GPS error:", err);
        setLocating(false);
        alert("Impossible d'obtenir votre position GPS. Veuillez vérifier les permissions de votre navigateur.");
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  // Search submit
  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim().length < 3) return;
    setSearchLoading(true);
    setSearchOpen(true);
    try {
      const res = await fetch(`/api/geocode?q=${encodeURIComponent(`${searchQuery}, Kinshasa`)}`);
      const data = await res.json();
      setSearchResults(data.results || []);
    } catch {
      setSearchResults([]);
    } finally {
      setSearchLoading(false);
    }
  };

  const handleSelectSearch = async (item: { lat: number; lng: number; label: string }) => {
    const newPos = { lat: item.lat, lng: item.lng };
    onPositionChange(newPos);
    const zone = findZoneAt(newPos.lat, newPos.lng);
    setCurrentZone(zone);
    if (onZoneChange) onZoneChange(zone);
    setSearchOpen(false);
    await resolveAddress(newPos.lat, newPos.lng);
  };

  // Google Maps URL with precise pin
  const googleMapsUrl = `https://www.google.com/maps?q=${position.lat},${position.lng}`;

  // Interactive map click simulation (offset from center)
  const handleMapClick = async (e: React.MouseEvent<HTMLDivElement>) => {
    if (!mapRef.current) return;
    const rect = mapRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Relative offset from center in pixels
    const dx = x - rect.width / 2;
    const dy = y - rect.height / 2;

    // Approximate lat/lng delta at zoom level 15
    const latDelta = -(dy / rect.height) * 0.015;
    const lngDelta = (dx / rect.width) * 0.015;

    const newLat = Number((position.lat + latDelta).toFixed(6));
    const newLng = Number((position.lng + lngDelta).toFixed(6));

    const newPos = { lat: newLat, lng: newLng };
    onPositionChange(newPos);
    const zone = findZoneAt(newLat, newLng);
    setCurrentZone(zone);
    if (onZoneChange) onZoneChange(zone);
    await resolveAddress(newLat, newLng);
  };

  return (
    <div className="relative aspect-square w-full rounded-2xl overflow-hidden border-2 border-gray-200 shadow-md bg-gray-900 group select-none">
      {/* Google Maps Viewport Container */}
      <div
        ref={mapRef}
        onClick={handleMapClick}
        className="w-full h-full relative cursor-crosshair overflow-hidden"
      >
        {/* Google Maps Static / Interactive Satellite or Roadmap Tile Layer */}
        <iframe
          title="Google Maps Location"
          src={`https://maps.google.com/maps?q=${position.lat},${position.lng}&z=15&t=${mapType === "satellite" ? "k" : "m"}&output=embed`}
          className="w-full h-full pointer-events-none border-0 grayscale-[15%] contrast-[1.05]"
          loading="lazy"
        />

        {/* Liquid Home Coverage Zones Overlay (Visual Pinpoint) */}
        <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
          {/* Pulsing Target Ring */}
          <div className="relative flex items-center justify-center">
            <span className="animate-ping absolute inline-flex h-20 w-20 rounded-full bg-brand-orange/40 opacity-75"></span>
            <span className="absolute inline-flex h-12 w-12 rounded-full bg-brand-orange/20 border border-brand-orange"></span>

            {/* Google Pin Icon */}
            <div className="relative -translate-y-6 flex flex-col items-center filter drop-shadow-xl animate-bounce">
              <div className="h-10 w-10 rounded-full bg-brand-orange border-2 border-white flex items-center justify-center text-white shadow-lg shadow-brand-orange/50">
                <MapPin className="h-6 w-6 fill-white" />
              </div>
              <div className="w-1.5 h-3 bg-brand-orange" />
              <div className="w-3 h-1 bg-black/40 rounded-full blur-[1px]" />
            </div>
          </div>
        </div>

        {/* Map Click Hint Overlay */}
        <div className="absolute bottom-14 left-1/2 -translate-x-1/2 px-3 py-1 bg-brand-navy/90 backdrop-blur text-white text-[11px] font-semibold rounded-full shadow-lg border border-white/20 pointer-events-none opacity-80 group-hover:opacity-100 transition-opacity">
          👆 Cliquez sur la carte Google pour déplacer le repère
        </div>
      </div>

      {/* Top Controls Bar */}
      <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-2 z-20 pointer-events-auto">
        {/* Address Search Box */}
        <div className="relative flex-1 max-w-xs">
          <form onSubmit={handleSearch} className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Rechercher une avenue / quartier..."
              className="w-full pl-8 pr-7 py-2 bg-white/95 backdrop-blur text-xs font-medium text-brand-navy rounded-xl shadow-md border border-gray-200 focus:outline-none focus:ring-2 focus:ring-brand-orange"
            />
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
            {searchLoading && (
              <Loader2 className="absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 animate-spin text-brand-orange" />
            )}
          </form>

          {/* Search Results Dropdown */}
          {searchOpen && searchResults.length > 0 && (
            <div className="absolute left-0 right-0 top-full mt-1.5 bg-white rounded-xl shadow-xl border border-gray-200 overflow-hidden max-h-48 overflow-y-auto z-30 divide-y divide-gray-100">
              {searchResults.map((r, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => handleSelectSearch(r)}
                  className="w-full text-left px-3 py-2 text-xs text-brand-navy hover:bg-brand-soft transition-colors flex items-start gap-1.5"
                >
                  <MapPin className="h-3.5 w-3.5 text-brand-orange flex-shrink-0 mt-0.5" />
                  <span className="line-clamp-2">{r.label}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Actions (GPS & Layers) */}
        <div className="flex items-center gap-1.5">
          {/* Layer switcher */}
          <button
            type="button"
            onClick={() => setMapType(mapType === "roadmap" ? "satellite" : "roadmap")}
            className="h-9 px-2.5 rounded-xl bg-white/95 backdrop-blur border border-gray-200 text-brand-navy text-xs font-semibold shadow-md hover:bg-white flex items-center gap-1 transition-colors"
            title="Basculer vue satellite / plan"
          >
            <Layers className="h-3.5 w-3.5 text-brand-orange" />
            <span className="hidden sm:inline">{mapType === "roadmap" ? "Satellite" : "Plan"}</span>
          </button>

          {/* Locate Me Button */}
          <button
            type="button"
            onClick={handleLocateMe}
            disabled={locating}
            className="h-9 px-3 rounded-xl bg-brand-orange text-white text-xs font-bold shadow-lg shadow-brand-orange/40 hover:bg-brand-orange-hover flex items-center gap-1.5 transition-transform hover:scale-105 disabled:opacity-50"
            title="Activer ma position GPS haute précision"
          >
            {locating ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Crosshair className="h-3.5 w-3.5" />
            )}
            <span>Ma Position</span>
          </button>
        </div>
      </div>

      {/* Bottom Information Footer */}
      <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between gap-2 z-20 pointer-events-auto">
        {/* Coverage Badge */}
        <div className="flex items-center gap-1.5 bg-white/95 backdrop-blur px-3 py-1.5 rounded-xl shadow-md border border-gray-200 text-xs">
          {currentZone?.status === "available" ? (
            <>
              <CheckCircle2 className="h-4 w-4 text-green-600 flex-shrink-0" />
              <span className="font-bold text-green-800">
                Fibre Active : {currentZone.name}
              </span>
            </>
          ) : (
            <>
              <AlertCircle className="h-4 w-4 text-amber-600 flex-shrink-0" />
              <span className="font-bold text-amber-800">
                {currentZone ? `${currentZone.name} (Extension prévue)` : "Zone d'extension fibre"}
              </span>
            </>
          )}
        </div>

        {/* Google Maps External Link */}
        <a
          href={googleMapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 bg-brand-navy/90 hover:bg-brand-navy backdrop-blur text-white px-2.5 py-1.5 rounded-xl shadow-md text-[11px] font-semibold border border-white/20 transition-colors"
          title="Ouvrir ces coordonnées précises dans Google Maps"
        >
          <span>Google Maps</span>
          <ExternalLink className="h-3 w-3" />
        </a>
      </div>
    </div>
  );
}
