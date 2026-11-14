"use server";
import { db } from "@/lib/db";
import { allow, clientIp } from "@/lib/ratelimit";
import { sendEmail } from "@/lib/email";
import { siteUrl } from "@/lib/site";

export type InquiryState = { ok?: boolean; error?: string };

const clip = (v: FormDataEntryValue | null, n: number) => String(v ?? "").trim().slice(0, n);

export async function submitInquiry(_: InquiryState, form: FormData): Promise<InquiryState> {
  if (clip(form.get("website"), 10)) return { ok: true }; // honeypot
  const name = clip(form.get("name"), 120);
  const email = clip(form.get("email"), 200);
  const phone = clip(form.get("phone"), 40);
  if (!name || (!email && !phone)) return { error: "Please add your name and an email or phone number." };
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return { error: "That email doesn't look right." };

  const ip = await clientIp();
  if (!(await allow(`inq:${ip}`, 6, 3600))) return { error: "Too many requests. Please call us instead." };

  const interest = ["lease", "buy", "tour", "info"].includes(String(form.get("interest"))) ? String(form.get("interest")) : "info";
  const propertyId = clip(form.get("property_id"), 40) || null;
  const row = {
    property_id: propertyId,
    name, email: email || null, phone: phone || null,
    company: clip(form.get("company"), 160) || null,
    interest,
    message: clip(form.get("message"), 3000) || null,
    source: form.get("source") === "qr" ? "qr" : "web",
    utm_source: clip(form.get("utm_source"), 32).toLowerCase().replace(/[^a-z0-9_-]/g, "") || null,
  };
  const { error } = await db().from("inquiries").insert(row);
  if (error) { console.error("inquiry", error.message); return { error: "Something went wrong. Please call us." }; }

  const label = clip(form.get("property_label"), 200);
  await sendEmail({
    to: process.env.NOTIFY_EMAIL || process.env.CONTACT_EMAIL || "",
    replyTo: email || undefined,
    subject: `New ${interest} inquiry — ${label || "Bricktown Real Estate"}${row.source === "qr" ? " (sign scan)" : ""}`,
    text: [
      `Property: ${label || "General"}`,
      `Interest: ${interest}`, `Source: ${row.source === "qr" ? "QR sign" : row.utm_source || "Website"}`, "",
      `Name: ${name}`, `Email: ${email || "-"}`, `Phone: ${phone || "-"}`, `Company: ${row.company || "-"}`, "",
      row.message || "(no message)", "",
      `All inquiries: ${siteUrl()}/admin/inquiries`,
    ].join("\n"),
  });
  return { ok: true };
}
