"use client";
import { useEffect } from "react";

const REFERRERS: [RegExp, string][] = [
  [/crexi\./, "crexi"], [/loopnet\./, "loopnet"], [/commercialcafe\.|commercialsearch\.|propertyshark\./, "commercialcafe"],
  [/cimls\./, "cimls"], [/google\./, "google"], [/facebook\.|fb\.|instagram\./, "facebook"], [/linkedin\./, "linkedin"],
];

export default function TrackView({ id }: { id: string }) {
  useEffect(() => {
    const sp = new URLSearchParams(location.search);
    let source = sp.get("utm_source") || (sp.get("src") === "qr" ? "qr" : "");
    if (!source && document.referrer) {
      const host = (() => { try { return new URL(document.referrer).hostname; } catch { return ""; } })();
      if (host && host !== location.hostname) source = REFERRERS.find(([r]) => r.test(host))?.[1] ?? "referral";
    }
    try { sessionStorage.setItem("bre_src", source || sessionStorage.getItem("bre_src") || "direct"); } catch {}
    const s = (() => { try { return sessionStorage.getItem("bre_src"); } catch { return source; } })() || "direct";
    navigator.sendBeacon?.("/api/view", new Blob([JSON.stringify({ id, source: s })], { type: "application/json" }));
    const f = document.querySelector<HTMLInputElement>('input[name="utm_source"]');
    if (f) f.value = s;
  }, [id]);
  return null;
}
