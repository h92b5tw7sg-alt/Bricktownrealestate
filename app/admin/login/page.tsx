import { redirect } from "next/navigation";
import { isAdmin, passwordMatches, startSession } from "@/lib/auth";
import { allow, clientIp } from "@/lib/ratelimit";

export const dynamic = "force-dynamic";

async function login(form: FormData) {
  "use server";
  const ip = await clientIp();
  if (!(await allow(`login:${ip}`, 10, 900))) redirect("/admin/login?e=wait");
  if (!passwordMatches(String(form.get("password") ?? ""))) redirect("/admin/login?e=bad");
  await startSession();
  redirect("/admin");
}

export default async function Login({ searchParams }: { searchParams: Promise<{ e?: string }> }) {
  if (await isAdmin()) redirect("/admin");
  const { e } = await searchParams;
  return (
    <form action={login} className="card" style={{ maxWidth: 420, margin: "40px auto" }}>
      <h1 style={{ fontSize: "2rem" }}>Owner login</h1>
      {e === "bad" && <div className="notice bad" style={{ marginBottom: 12 }}>Wrong password.</div>}
      {e === "wait" && <div className="notice bad" style={{ marginBottom: 12 }}>Too many tries. Wait 15 minutes.</div>}
      <label htmlFor="pw">Password</label>
      <input id="pw" name="password" type="password" required autoFocus autoComplete="current-password" />
      <button className="btn" style={{ width: "100%", marginTop: 14 }}>Log in</button>
    </form>
  );
}
