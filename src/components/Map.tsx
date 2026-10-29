"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { LayerGroup, Map as LeafletMap } from "leaflet";

export const YOGYAKARTA_CENTER: [number, number] = [-7.7956, 110.3695];
export const DEFAULT_ZOOM = 11;
export const MIN_ZOOM = 3;
export const MAX_ZOOM = 19;

export interface MapMarker {
  id: string;
  position: [number, number];
  type: "community" | "event" | "me";
  name: string;
  description?: string;
  category?: string;
  href?: string;
  onClick?: () => void;
}

interface MapProps {
  center?: [number, number];
  zoom?: number;
  markers?: MapMarker[];
  className?: string;
}

const MARKER_LABEL: Record<MapMarker["type"], string> = {
  community: "Komunitas",
  event: "Event",
  me: "Lokasi kamu",
};

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function markerHtml(type: MapMarker["type"]) {
  if (type === "community") {
    return `<span class="tg-pin tg-pin--community">
      <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 12a4 4 0 100-8 4 4 0 000 8zm0 2c-4 0-7 2-7 4.5V20h14v-1.5c0-2.5-3-4.5-7-4.5z"/></svg>
    </span>`;
  }
  if (type === "event") {
    return `<span class="tg-pin tg-pin--event">
      <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 2v3M17 2v3M4 8h16M5 5h14a1 1 0 011 1v13a1 1 0 01-1 1H5a1 1 0 01-1-1V6a1 1 0 011-1z"/></svg>
    </span>`;
  }
  return `<span class="tg-pin tg-pin--me"><span class="tg-pin__pulse"></span></span>`;
}

export function Map({
  center = YOGYAKARTA_CENTER,
  zoom = DEFAULT_ZOOM,
  markers = [],
  className = "",
}: MapProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<LeafletMap | null>(null);
  const markersLayerRef = useRef<LayerGroup | null>(null);
  const leafletRef = useRef<typeof import("leaflet") | null>(null);
  const markersRef = useRef<MapMarker[]>(markers);
  const initialViewRef = useRef({ center, zoom });
  const [ready, setReady] = useState(false);

  const markerKey = markers
    .map((m) => `${m.id}:${m.position[0]}:${m.position[1]}:${m.type}:${m.name}:${m.href ?? ""}`)
    .join("|");

  useEffect(() => {
    markersRef.current = markers;
  }, [markers]);

  useEffect(() => {
    let cancelled = false;
    let resizeObserver: ResizeObserver | null = null;
    let onWindowResize: (() => void) | null = null;

    import("leaflet").then((L) => {
      const container = containerRef.current;
      if (cancelled || !container) return;
      if (mapRef.current) return;

      if ((container as unknown as { _leaflet_id?: number })._leaflet_id) {
        delete (container as unknown as { _leaflet_id?: number })._leaflet_id;
      }

      const map = L.map(container, {
        center: initialViewRef.current.center,
        zoom: initialViewRef.current.zoom,
        minZoom: MIN_ZOOM,
        maxZoom: MAX_ZOOM,
        zoomControl: false,
        attributionControl: true,
        dragging: true,
        inertia: true,
        inertiaDeceleration: 3000,
        easeLinearity: 0.2,
        touchZoom: true,
        scrollWheelZoom: true,
        doubleClickZoom: true,
        boxZoom: true,
        keyboard: true,
        worldCopyJump: true,
        zoomSnap: 0.5,
        zoomDelta: 0.5,
        wheelDebounceTime: 40,
        wheelPxPerZoomLevel: 90,
        preferCanvas: false,
      });

      // Be explicit: some environments initialise handlers disabled.
      map.dragging.enable();
      map.touchZoom.enable();
      map.scrollWheelZoom.enable();
      map.doubleClickZoom.enable();
      map.boxZoom.enable();
      map.keyboard.enable();

      map.getContainer().style.touchAction = "none";
      map.getContainer().style.cursor = "grab";

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        minZoom: MIN_ZOOM,
        maxZoom: MAX_ZOOM,
        detectRetina: true,
        crossOrigin: true,
      }).addTo(map);

      L.control.zoom({ position: "bottomright" }).addTo(map);
      L.control.scale({ position: "bottomleft", imperial: false, maxWidth: 110 }).addTo(map);

      markersLayerRef.current = L.layerGroup().addTo(map);
      leafletRef.current = L;
      mapRef.current = map;

      const invalidate = () => map.invalidateSize({ animate: false, pan: false });
      onWindowResize = () => invalidate();

      map.whenReady(() => {
        invalidate();
        window.setTimeout(invalidate, 150);
      });

      if (typeof ResizeObserver !== "undefined") {
        resizeObserver = new ResizeObserver(invalidate);
        resizeObserver.observe(container);
      }
      window.addEventListener("resize", onWindowResize);

      setReady(true);
    });

    return () => {
      cancelled = true;
      if (onWindowResize) window.removeEventListener("resize", onWindowResize);
      resizeObserver?.disconnect();
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
      markersLayerRef.current = null;
      leafletRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (!ready || !mapRef.current) return;
    mapRef.current.setView(center, zoom, { animate: true });
  }, [center, zoom, ready]);

  useEffect(() => {
    const L = leafletRef.current;
    const layer = markersLayerRef.current;
    if (!ready || !L || !layer) return;

    layer.clearLayers();

    for (const marker of markersRef.current) {
      const icon = L.divIcon({
        html: markerHtml(marker.type),
        className: "tg-pin-wrapper",
        iconSize: [34, 34],
        iconAnchor: [17, 32],
        popupAnchor: [0, -30],
      });

      const leafletMarker = L.marker(marker.position, {
        icon,
        keyboard: true,
        title: marker.name,
        riseOnHover: true,
        riseOffset: 500,
      }).addTo(layer);

      const parts = [
        `<div class="tg-popup">`,
        `<div class="tg-popup__kind">${escapeHtml(MARKER_LABEL[marker.type])}</div>`,
        `<div class="tg-popup__title">${escapeHtml(marker.name)}</div>`,
      ];

      if (marker.category) {
        parts.push(`<span class="tg-popup__tag">${escapeHtml(marker.category)}</span>`);
      }
      if (marker.description) {
        parts.push(`<p class="tg-popup__desc">${escapeHtml(marker.description)}</p>`);
      }
      if (marker.href) {
        parts.push(`<a class="tg-popup__link" href="${escapeHtml(marker.href)}">Lihat detail</a>`);
      }
      parts.push(`</div>`);

      leafletMarker.bindPopup(parts.join(""), {
        closeButton: false,
        offset: [0, 4],
        maxWidth: 240,
        className: "tg-popup-shell",
      });

      if (marker.onClick) {
        leafletMarker.on("click", marker.onClick);
      }
    }
  }, [markerKey, ready]);

  const recenter = useCallback(() => {
    mapRef.current?.flyTo(YOGYAKARTA_CENTER, DEFAULT_ZOOM, { duration: 0.8 });
  }, []);

  return (
    <div className={`relative h-full w-full ${className}`}>
      <div ref={containerRef} className="h-full w-full" aria-label="Peta komunitas dan event" />

      {ready && (
        <button
          type="button"
          onClick={recenter}
          title="Kembali ke Yogyakarta"
          aria-label="Kembali ke Yogyakarta"
          className="absolute right-4 top-4 z-[1000] flex items-center gap-2 rounded-full bg-white px-3 py-2 text-xs font-semibold text-[#1F2937] shadow-md ring-1 ring-black/5 transition-colors hover:bg-gray-50"
        >
          <svg className="h-4 w-4 text-[#7960D7]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8a4 4 0 100 8 4 4 0 000-8z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 2v2m0 16v2M2 12h2m16 0h2" />
          </svg>
          Yogyakarta
        </button>
      )}
    </div>
  );
}
