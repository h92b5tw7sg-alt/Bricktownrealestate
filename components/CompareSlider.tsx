"use client";
import { useRef, useState } from "react";

/** Drag to compare the building today with the rendering. Keyboard: arrow keys on the slider. */
export default function CompareSlider({ before, after, beforeLabel = "Today", afterLabel = "Rendering" }: {
  before: string; after: string; beforeLabel?: string; afterLabel?: string;
}) {
  const [pos, setPos] = useState(50);
  const box = useRef<HTMLDivElement>(null);
  const drag = useRef(false);

  const move = (clientX: number) => {
    const r = box.current?.getBoundingClientRect();
    if (!r) return;
    setPos(Math.max(0, Math.min(100, ((clientX - r.left) / r.width) * 100)));
  };

  return (
    <div
      ref={box}
      className="compare"
      onPointerDown={(e) => { drag.current = true; (e.target as HTMLElement).setPointerCapture?.(e.pointerId); move(e.clientX); }}
      onPointerMove={(e) => drag.current && move(e.clientX)}
      onPointerUp={() => { drag.current = false; }}
      onPointerCancel={() => { drag.current = false; }}
    >
      <img src={after} alt={afterLabel} className="compare-img" draggable={false} />
      <div className="compare-top" style={{ clipPath: `inset(0 ${100 - pos}% 0 0)` }}>
        <img src={before} alt={beforeLabel} className="compare-img" draggable={false} />
      </div>
      <span className="compare-tag l">{beforeLabel}</span>
      <span className="compare-tag r">{afterLabel}</span>
      <div className="compare-handle" style={{ left: `${pos}%` }} aria-hidden="true"><span>⟷</span></div>
      <input
        type="range" min={0} max={100} step={1} value={Math.round(pos)}
        onChange={(e) => setPos(Number(e.target.value))}
        className="compare-range" aria-label={`Compare ${beforeLabel} and ${afterLabel}`}
      />
    </div>
  );
}
