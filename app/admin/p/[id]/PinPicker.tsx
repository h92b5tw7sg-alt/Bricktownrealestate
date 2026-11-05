"use client";
import { useState } from "react";
import DistrictMap from "@/components/DistrictMap";

export default function PinPicker({ lat, lng }: { lat: number | null; lng: number | null }) {
  const [pos, setPos] = useState<{ lat: number; lng: number } | null>(lat && lng ? { lat, lng } : null);
  return (
    <div>
      <input type="hidden" name="lat" value={pos?.lat ?? ""} />
      <input type="hidden" name="lng" value={pos?.lng ?? ""} />
      <DistrictMap
        pins={pos ? [{ id: "pick", lat: pos.lat, lng: pos.lng, title: "" }] : []}
        height={320}
        scrollZoom
        onPick={(a, b) => setPos({ lat: Number(a.toFixed(6)), lng: Number(b.toFixed(6)) })}
      />
      <div className="row between small muted" style={{ marginTop: 6 }}>
        <span>Click the map or drag the pin onto the building, then Save.</span>
        <span>{pos ? `${pos.lat}, ${pos.lng}` : "No pin yet"}{pos && <> · <button type="button" className="btn sm ghost" onClick={() => setPos(null)}>Remove pin</button></>}</span>
      </div>
    </div>
  );
}
