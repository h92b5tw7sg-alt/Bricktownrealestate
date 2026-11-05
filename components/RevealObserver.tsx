"use client";
import { useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";

/** Fades/slides in any element marked data-reveal as it scrolls into view. Skipped for reduced-motion users. */
export default function RevealObserver() {
  const path = usePathname();
  const search = useSearchParams();
  useEffect(() => {
    const els = Array.from(document.querySelectorAll<HTMLElement>("[data-reveal]:not(.is-in)"));
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches || !("IntersectionObserver" in window)) {
      els.forEach((e) => e.classList.add("is-in"));
      return;
    }
    document.documentElement.classList.add("reveal-on");
    const io = new IntersectionObserver((entries) => {
      for (const en of entries) if (en.isIntersecting) { en.target.classList.add("is-in"); io.unobserve(en.target); }
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.08 });
    els.forEach((e, i) => { if (!e.style.getPropertyValue("--d")) e.style.setProperty("--d", `${(i % 3) * 90}ms`); io.observe(e); });
    return () => io.disconnect();
  }, [path, search]);
  return null;
}
