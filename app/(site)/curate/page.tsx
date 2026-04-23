import fs from "node:fs";
import path from "node:path";
import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { client } from "@/sanity/lib/client";
import { CURATION_SESSION_QUERY } from "@/sanity/queries";
import { CurateClient, type ManifestEntry, type Selections } from "./CurateClient";
import { CurateLogin } from "./CurateLogin";

export const metadata: Metadata = {
  title: "Curate",
  robots: { index: false, follow: false },
};

// Session state lives in Sanity, not the filesystem, so every page view
// must go fresh to Sanity rather than a build-time snapshot.
export const dynamic = "force-dynamic";

function readManifest(): ManifestEntry[] {
  // The manifest is committed to the repo — it ships with the bundle and
  // is read from the working tree at request time.
  const p = path.join(process.cwd(), "data", "eaa-manifest.json");
  if (!fs.existsSync(p)) return [];
  return JSON.parse(fs.readFileSync(p, "utf-8")) as ManifestEntry[];
}

async function isAuthed(): Promise<boolean> {
  const expected = process.env.CURATE_PASSWORD;
  // Local `next dev` without a password set → bypass the gate so the
  // solo developer doesn't have to type a code every refresh. Setting
  // CURATE_PASSWORD locally still forces the gate.
  if (!expected && process.env.NODE_ENV !== "production") return true;
  if (!expected) return false;
  const jar = await cookies();
  return jar.get("curate_auth")?.value === expected;
}

export default async function CuratePage() {
  // Preview + local dev only. Production (the live apex) 404s even for
  // authenticated users — /curate isn't a feature, it's a back-office
  // tool and shouldn't exist on the main site.
  if (process.env.VERCEL_ENV === "production") notFound();

  if (!(await isAuthed())) {
    // The env can't be configured? Surface that rather than leaving a
    // broken login form — the curator needs to know to ping the dev.
    const configured = Boolean(process.env.CURATE_PASSWORD);
    return <CurateLogin configured={configured} />;
  }

  const manifest = readManifest();
  const session = await client.fetch<Selections | null>(CURATION_SESSION_QUERY);
  const selections: Selections = session ?? {
    startingNumber: 10,
    picks: [],
  };

  return <CurateClient manifest={manifest} initialSelections={selections} />;
}
