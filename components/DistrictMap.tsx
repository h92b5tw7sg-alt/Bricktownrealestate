"use client";
import "leaflet/dist/leaflet.css";
import { useEffect, useRef } from "react";
import type { Map as LMap, Marker } from "leaflet";

export type Pin = { id: string; lat: number; lng: number; title: string; sub?: string; href?: string; image?: string; label?: string };

const BRICKTOWN: [number, number] = [35.4662, -97.5098];

function esc(s: string) {
  return s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]!));
}

/**
 * Bricktown map. Public mode shows numbered pins with a preview card.
 * Picker mode (onPick) lets the owner click or drag one pin to set a property's exact spot.
 */
export default function DistrictMap({ pins, height = 460, zoom = 16, onPick, scrollZoom = false }: {
  pins: Pin[]; height?: number; zoom?: number; onPick?: (lat: number, lng: number) => void; scrollZoom?: boolean;
}) {
  const el = useRef<HTMLDivElement>(null);
  const map = useRef<LMap | null>(null);
  const pickMarker = useRef<Marker | null>(null);

  useEffect(() => {
    let alive = true;
    (async () => {
      const L = (await import("leaflet")).default;
      if (!alive || !el.current || map.current) return;
      const m = L.map(el.current, { scrollWheelZoom: scrollZoom, zoomControl: true, attributionControl: true });
      map.current = m;
      L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 19,
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      }).addTo(m);

      const icon = (label: string) => L.divIcon({ className: "bre-pin", html: `<span><i>${esc(label)}</i></span>`, iconSize: [34, 44], iconAnchor: [17, 42], popupAnchor: [0, -38] });

      if (onPick) {
        const start = pins[0] ? [pins[0].lat, pins[0].lng] as [number, number] : BRICKTOWN;
        const mk = L.marker(start, { icon: icon("●"), draggable: true }).addTo(m);
        pickMarker.current = mk;
        mk.on("dragend", () => { const p = mk.getLatLng(); onPick(p.lat, p.lng); });
        m.on("click", (e) => { mk.setLatLng(e.latlng); onPick(e.latlng.lat, e.latlng.lng); });
        m.setView(start, 18);
        return;
      }

      const pts: [number, number][] = [];
      pins.forEach((p, i) => {
        const mk = L.marker([p.lat, p.lng], { icon: icon(p.label ?? String(i + 1)), title: p.title, riseOnHover: true }).addTo(m);
        pts.push([p.lat, p.lng]);
        const img = p.image ? `<img src="${esc(p.image)}" alt="" />` : "";
        const body = `<div class="bre-pop">${img}<b>${esc(p.title)}</b>${p.sub ? `<span>${esc(p.sub)}</span>` : ""}${p.href ? `<a href="${esc(p.href)}">View property →</a>` : ""}</div>`;
        mk.bindPopup(body, { closeButton: false, maxWidth: 240, minWidth: 200 });
      });
      if (pts.length > 1) m.fitBounds(pts, { padding: [40, 40], maxZoom: 17 });
      else m.setView(pts[0] ?? BRICKTOWN, zoom);
    })();
    return () => { alive = false; map.current?.remove(); map.current = null; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return <div ref={el} className="district-map" style={{ height }} role="region" aria-label="Map of Bricktown properties" />;
}
