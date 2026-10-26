"use client";

import { useEffect, useRef } from "react";
import type { Map as LeafletMap } from "leaflet";

interface MapProps {
  center?: [number, number];
  zoom?: number;
  markers?: Array<{
    id: string;
    position: [number, number];
    type: "community" | "event";
    name: string;
    onClick?: () => void;
  }>;
}

export function Map({ center = [-7.7956, 110.3695], zoom = 11, markers = [] }: MapProps) {
  const mapRef = useRef<LeafletMap | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Dynamic import Leaflet (client-side only)
    if (typeof window === "undefined") return;

    import("leaflet").then((L) => {
      // Fix default marker icon paths
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
        iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
        shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
      });

      if (!containerRef.current || mapRef.current) return;

      // Create map
      const map = L.map(containerRef.current).setView(center, zoom);

      // Add OpenStreetMap tiles
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19,
      }).addTo(map);

      mapRef.current = map;

      // Add markers
      markers.forEach((marker) => {
        const icon = L.divIcon({
          html: marker.type === "community" 
            ? '<div style="background:#7960D7;width:24px;height:24px;border-radius:50%;border:3px solid white;box-shadow:0 2px 4px rgba(0,0,0,0.3)"></div>'
            : '<div style="background:#1F2937;width:24px;height:24px;border-radius:4px;border:3px solid white;box-shadow:0 2px 4px rgba(0,0,0,0.3)"></div>',
          className: "",
          iconSize: [24, 24],
          iconAnchor: [12, 12],
        });

        const leafletMarker = L.marker(marker.position, { icon })
          .addTo(map)
          .bindPopup(`<strong>${marker.name}</strong><br>${marker.type === "community" ? "Komunitas" : "Event"}`);

        if (marker.onClick) {
          leafletMarker.on("click", marker.onClick);
        }
      });
    });

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [center, zoom, markers]);

  return (
    <>
      <link
        rel="stylesheet"
        href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
        integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY="
        crossOrigin=""
      />
      <div ref={containerRef} className="w-full h-full rounded-[--radius-panel]" />
    </>
  );
}
