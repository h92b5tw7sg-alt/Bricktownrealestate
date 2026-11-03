import QRCode from "qrcode";
import { siteUrl } from "./site";

/** What every sign encodes. Short, and routed through /q so scans are counted. */
export const signUrl = (slug: string) => `${siteUrl()}/q/${slug}`;

// Error correction H survives weather, dirt and a logo sticker over ~25% of the code.
export const qrSvg = (slug: string, color = "#1d1714") =>
  QRCode.toString(signUrl(slug), { type: "svg", errorCorrectionLevel: "H", margin: 1, color: { dark: color, light: "#ffffff" } });

export const qrPng = (slug: string, width = 3000) =>
  QRCode.toBuffer(signUrl(slug), { type: "png", errorCorrectionLevel: "H", margin: 2, width, color: { dark: "#000000", light: "#ffffff" } });
