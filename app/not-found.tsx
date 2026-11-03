import Link from "next/link";

export default function NotFound() {
  return (
    <div className="card" style={{ maxWidth: 560, margin: "40px auto", textAlign: "center" }}>
      <h1>Not listed</h1>
      <p className="muted">That property may have been leased or sold. See what&apos;s available now.</p>
      <Link className="btn" href="/">View available properties</Link>
    </div>
  );
}
