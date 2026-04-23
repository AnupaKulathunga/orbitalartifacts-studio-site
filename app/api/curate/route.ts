import fs from "node:fs";
import path from "node:path";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const SELECTIONS_PATH = path.join(process.cwd(), "data", "eaa-selections.json");

/**
 * Dev-only. The UI at /curate posts picks here; we persist them to
 * `data/eaa-selections.json` so curation state lives with the repo.
 * In production, the route 404s — the gate is NODE_ENV, same as the page.
 */
function requireDev() {
  if (process.env.NODE_ENV !== "development") {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return null;
}

export async function GET() {
  const block = requireDev();
  if (block) return block;
  if (!fs.existsSync(SELECTIONS_PATH)) {
    return NextResponse.json({ startingNumber: 10, picks: [] });
  }
  return NextResponse.json(JSON.parse(fs.readFileSync(SELECTIONS_PATH, "utf-8")));
}

export async function POST(req: Request) {
  const block = requireDev();
  if (block) return block;

  const body = await req.json();
  const picks = Array.isArray(body?.picks) ? body.picks.filter((s: unknown) => typeof s === "string") : [];
  const startingNumber =
    typeof body?.startingNumber === "number" && Number.isFinite(body.startingNumber)
      ? Math.max(1, Math.floor(body.startingNumber))
      : 10;

  const payload = { startingNumber, picks };
  fs.mkdirSync(path.dirname(SELECTIONS_PATH), { recursive: true });
  fs.writeFileSync(SELECTIONS_PATH, JSON.stringify(payload, null, 2) + "\n");
  return NextResponse.json({ ok: true, saved: payload.picks.length });
}
