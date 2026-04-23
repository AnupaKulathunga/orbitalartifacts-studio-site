import fs from "node:fs";
import path from "node:path";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { CurateClient, type ManifestEntry, type Selections } from "./CurateClient";

export const metadata: Metadata = {
  title: "Curate",
  robots: { index: false, follow: false },
};

// Disable caching — the manifest and selections files change between visits.
export const dynamic = "force-dynamic";

function loadJson<T>(relPath: string, fallback: T): T {
  const p = path.join(process.cwd(), relPath);
  if (!fs.existsSync(p)) return fallback;
  return JSON.parse(fs.readFileSync(p, "utf-8")) as T;
}

export default function CuratePage() {
  // Dev-only. Ships in the bundle but 404s in production so this page is
  // reachable only when running `next dev` on localhost.
  if (process.env.NODE_ENV !== "development") notFound();

  const manifest = loadJson<ManifestEntry[]>("data/eaa-manifest.json", []);
  const selections = loadJson<Selections>("data/eaa-selections.json", {
    startingNumber: 10,
    picks: [],
  });

  return <CurateClient manifest={manifest} initialSelections={selections} />;
}
