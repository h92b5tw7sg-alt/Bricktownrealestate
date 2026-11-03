import { headers } from "next/headers";
import { db } from "./db";

export async function clientIp() {
  const h = await headers();
  return (h.get("x-real-ip") || h.get("x-forwarded-for")?.split(",")[0] || "unknown").trim();
}

/** True if allowed. Fails open if the limiter itself errors, so a hiccup never blocks sales. */
export async function allow(key: string, max: number, windowSeconds: number) {
  const { data, error } = await db().rpc("rate_limit", { p_key: key, p_max: max, p_window_seconds: windowSeconds });
  if (error) { console.error("rate_limit", error.message); return true; }
  return data !== false;
}
