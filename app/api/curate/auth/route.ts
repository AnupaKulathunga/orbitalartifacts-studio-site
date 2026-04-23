import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

/**
 * Shared-password gate for /curate.
 *
 * POST receives the access code from the login form; if it matches the
 * server-side `CURATE_PASSWORD` env var we set an HTTP-only cookie so
 * subsequent page loads and API calls are authenticated. 30-day lifetime
 * balances "partner doesn't retype every visit" against "cookie shouldn't
 * live forever if they close the browser and walk away."
 *
 * Kept separate from the main /api/curate route so the password check
 * lives in one place and bad attempts don't leak into pick data.
 */

function prodBlocked() {
  // Production = the live apex domain, exposed only on main branch
  // deploys. `/curate` should 404 there outright even for logged-in
  // users. Preview + local dev are fine.
  return process.env.VERCEL_ENV === "production";
}

export async function POST(req: Request) {
  if (prodBlocked()) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const expected = process.env.CURATE_PASSWORD;
  if (!expected) {
    return NextResponse.json(
      { error: "CURATE_PASSWORD is not configured on this deployment." },
      { status: 500 },
    );
  }

  const { password } = (await req.json().catch(() => ({}))) as {
    password?: string;
  };
  if (typeof password !== "string" || password !== expected) {
    return NextResponse.json({ error: "Wrong access code" }, { status: 401 });
  }

  const res = NextResponse.json({ ok: true });
  // httpOnly so it can't be stolen by client JS. Secure so it's only
  // sent over HTTPS (Vercel preview URLs). sameSite=lax so the cookie
  // accompanies the page navigation that follows.
  res.cookies.set("curate_auth", password, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
  return res;
}

export async function DELETE() {
  const res = NextResponse.json({ ok: true });
  res.cookies.delete("curate_auth");
  return res;
}
