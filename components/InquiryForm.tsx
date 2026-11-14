"use client";
import { useActionState } from "react";
import { submitInquiry, type InquiryState } from "@/app/p/[slug]/actions";

export default function InquiryForm({ propertyId, label, source, defaultInterest }: {
  propertyId: string; label: string; source: "web" | "qr"; defaultInterest: "lease" | "buy" | "info";
}) {
  const [state, action, pending] = useActionState<InquiryState, FormData>(submitInquiry, {});
  if (state.ok) return <div className="notice ok">Thanks — we got it. Expect a call or email shortly.</div>;
  return (
    <form action={action} id="inquire">
      <input type="hidden" name="property_id" value={propertyId} />
      <input type="hidden" name="property_label" value={label} />
      <input type="hidden" name="source" value={source} />
      <input type="hidden" name="utm_source" defaultValue="" />
      <input className="hp" tabIndex={-1} autoComplete="off" name="website" aria-hidden="true" />
      {state.error && <div className="notice bad" style={{ marginBottom: 12 }}>{state.error}</div>}
      <div className="field"><label htmlFor="iq-name">Name</label><input id="iq-name" name="name" required autoComplete="name" /></div>
      <div className="field two">
        <div><label htmlFor="iq-phone">Phone</label><input id="iq-phone" name="phone" type="tel" autoComplete="tel" /></div>
        <div><label htmlFor="iq-email">Email</label><input id="iq-email" name="email" type="email" autoComplete="email" /></div>
      </div>
      <div className="field two">
        <div><label htmlFor="iq-co">Company / concept</label><input id="iq-co" name="company" autoComplete="organization" /></div>
        <div>
          <label htmlFor="iq-int">I&apos;m interested in</label>
          <select id="iq-int" name="interest" defaultValue={defaultInterest}>
            <option value="lease">Leasing</option>
            <option value="buy">Buying</option>
            <option value="tour">Scheduling a tour</option>
            <option value="info">More information</option>
          </select>
        </div>
      </div>
      <div className="field"><label htmlFor="iq-msg">Message</label><textarea id="iq-msg" name="message" placeholder="Use, size needed, timing…" /></div>
      <button className="btn" style={{ width: "100%", marginTop: 14 }} disabled={pending}>{pending ? "Sending…" : "Send inquiry"}</button>
    </form>
  );
}
