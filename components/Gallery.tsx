"use client";
import { useState } from "react";

type Img = { url: string; caption: string | null; kind: string };

export default function Gallery({ images, fallback }: { images: Img[]; fallback: string }) {
  const [i, setI] = useState(0);
  if (!images.length) return <div className="gallery-main"><div className="placeholder">{fallback}</div></div>;
  const cur = images[Math.min(i, images.length - 1)];
  return (
    <div>
      <div className="gallery-main">
        <a href={cur.url} target="_blank" rel="noopener"><img src={cur.url} alt={cur.caption || fallback} /></a>
      </div>
      {cur.caption && <div className="small muted" style={{ marginTop: 6 }}>{cur.kind === "rendering" ? "Rendering · " : ""}{cur.caption}</div>}
      {images.length > 1 && (
        <div className="thumbs">
          {images.map((m, n) => (
            <button key={m.url} type="button" aria-pressed={n === i} aria-label={`Show image ${n + 1}`} onClick={() => setI(n)}>
              <img src={m.url} alt="" loading="lazy" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
