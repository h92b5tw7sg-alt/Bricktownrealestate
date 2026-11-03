import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createHmac, timingSafeEqual } from "crypto";

const COOKIE = "bre_admin";
const SESSION_DAYS = 14;

function secret() {
  const s = process.env.ADMIN_SESSION_SECRET || process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!s) throw new Error("Missing ADMIN_SESSION_SECRET");
  return s;
}

export function safeEqual(a: string, b: string) {
  const A = Buffer.from(a), B = Buffer.from(b);
  return A.length === B.length && timingSafeEqual(A, B);
}

export function passwordMatches(pw: string) {
  const p = process.env.ADMIN_PASSWORD;
  return !!p && pw.length > 0 && safeEqual(pw, p);
}

// Tied to ADMIN_PASSWORD, so changing the password logs everyone out.
const sign = (exp: string) => createHmac("sha256", secret()).update(`owner.${exp}.${process.env.ADMIN_PASSWORD ?? ""}`).digest("hex");

export async function startSession() {
  const exp = String(Math.floor(Date.now() / 1000) + SESSION_DAYS * 86400);
  (await cookies()).set(COOKIE, `${exp}.${sign(exp)}`, {
    httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", path: "/",
    maxAge: SESSION_DAYS * 86400,
  });
}

export async function endSession() {
  (await cookies()).delete(COOKIE);
}

export async function isAdmin() {
  const raw = (await cookies()).get(COOKIE)?.value;
  if (!raw || !process.env.ADMIN_PASSWORD) return false;
  const [exp, mac] = raw.split(".");
  if (!exp || !mac || Number(exp) < Date.now() / 1000) return false;
  return safeEqual(mac, sign(exp));
}

export async function requireAdmin() {
  if (!(await isAdmin())) redirect("/admin/login");
}
