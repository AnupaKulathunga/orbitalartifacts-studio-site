import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { client } from "@/sanity/lib/client";
import { getWriteClient } from "@/sanity/lib/writeClient";
import { CURATION_SESSION_QUERY } from "@/sanity/queries";

export const dynamic = "force-dynamic";

/**
 * Read/write the shared curation session.
 *
 * Persists to a Sanity singleton (id=`curationSession`) because Vercel's
 * runtime filesystem is read-only — we can't write JSON files in preview
 * or production. Sanity also means both curators see the same picks and
 * Anupa can pull the picks into ingestion from anywhere.
 *
 * Access is gated two ways:
 *  - `VERCEL_ENV === "production"` returns 404, no matter what. /curate
 *    is preview-only; the live site never exposes it.
 *  - Everywhere else, requests must carry a `curate_auth` cookie with
 *    the right `CURATE_PASSWORD`. Local `next dev` bypasses this when
 *    no CURATE_PASSWORD is set, so you can test without a code.
 */

function prodBlocked() {
  return process.env.VERCEL_ENV === "production";
}

async function authed(): Promise<boolean> {
  const expected = process.env.CURATE_PASSWORD;
  // Local dev without a password set → allow. Setting CURATE_PASSWORD
  // locally is still supported if you want to smoke-test the gate.
  if (!expected && process.env.NODE_ENV !== "production") return true;
  if (!expected) return false;
  const jar = await cookies();
  return jar.get("curate_auth")?.value === expected;
}

function unauthorized() {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}

type Selections = {
  startingNumber: number;
  picks: string[];
  updatedAt?: string;
  updatedBy?: string | null;
};

export async function GET() {
  if (prodBlocked()) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  if (!(await authed())) return unauthorized();

  const doc = await client.fetch<Selections | null>(CURATION_SESSION_QUERY);
  return NextResponse.json(
    doc ?? { startingNumber: 10, picks: [], updatedAt: null, updatedBy: null },
  );
}

export async function POST(req: Request) {
  if (prodBlocked()) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  if (!(await authed())) return unauthorized();

  const body = (await req.json().catch(() => ({}))) as {
    picks?: unknown;
    startingNumber?: unknown;
    updatedBy?: unknown;
  };
  const picks = Array.isArray(body.picks)
    ? (body.picks.filter((s) => typeof s === "string") as string[])
    : [];
  const startingNumber =
    typeof body.startingNumber === "number" && Number.isFinite(body.startingNumber)
      ? Math.max(1, Math.floor(body.startingNumber))
      : 10;
  const updatedBy =
    typeof body.updatedBy === "string" && body.updatedBy.trim().length > 0
      ? body.updatedBy.trim().slice(0, 60)
      : undefined;

  const writeClient = getWriteClient();
  await writeClient.createOrReplace({
    _id: "curationSession",
    _type: "curationSession",
    startingNumber,
    picks,
    updatedAt: new Date().toISOString(),
    ...(updatedBy ? { updatedBy } : {}),
  });

  return NextResponse.json({ ok: true, saved: picks.length });
}
