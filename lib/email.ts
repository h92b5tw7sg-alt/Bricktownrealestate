/** Sends via Resend if configured. Never throws — inquiries are saved regardless. */
export async function sendEmail(opts: { to: string; subject: string; text: string; replyTo?: string }) {
  const key = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM;
  if (!key || !from || !opts.to) return false;
  try {
    const r = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({ from, to: opts.to.split(",").map((s) => s.trim()), subject: opts.subject, text: opts.text, reply_to: opts.replyTo }),
    });
    if (!r.ok) console.error("resend", r.status, await r.text());
    return r.ok;
  } catch (e) {
    console.error("resend", e);
    return false;
  }
}
