import Link from "next/link";
import { logout } from "./actions";

export default function AdminNav() {
  return (
    <nav className="admin-nav no-print card" style={{ padding: 8 }} aria-label="Admin">
      <Link href="/admin">Properties</Link>
      <Link href="/admin/inquiries">Inquiries</Link>
      <Link href="/admin/signs">Signs &amp; QR codes</Link>
      <Link href="/admin/site">Homepage</Link>
      <Link href="/" target="_blank">View site ↗</Link>
      <form action={logout} style={{ marginLeft: "auto" }}><button className="btn sm ghost">Log out</button></form>
    </nav>
  );
}
