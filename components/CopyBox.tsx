"use client";
import { useState } from "react";

export default function CopyBox({ label, text, rows = 4 }: { label: string; text: string; rows?: number }) {
  const [done, setDone] = useState(false);
  return (
    <div className="field">
      <div className="row between"><label style={{ margin: 0 }}>{label}</label>
        <button type="button" className="btn sm ghost" onClick={async () => { try { await navigator.clipboard.writeText(text); setDone(true); setTimeout(() => setDone(false), 1500); } catch {} }}>{done ? "Copied ✓" : "Copy"}</button>
      </div>
      <textarea readOnly rows={rows} value={text} style={{ fontSize: ".86rem", marginTop: 4 }} onFocus={(e) => e.currentTarget.select()} />
    </div>
  );
}
