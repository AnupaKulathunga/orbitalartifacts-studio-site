import type { Metadata } from "next";
import { ArchiveBrowser } from "@/components/archive/ArchiveBrowser";
import { MetaStrip } from "@/components/brand/MetaStrip";
import { getAllScenes } from "@/lib/scenes";

export const metadata: Metadata = {
  title: "Archive",
  description:
    "Every scene in the Orbital Artifacts archive — filter by region, sensor, and treatment.",
};

export default function ArchivePage() {
  const scenes = getAllScenes();

  return (
    <section className="mx-auto max-w-6xl px-6 py-24">
      <MetaStrip items={["Archive", `${scenes.length} scenes`]} />
      <h1 className="mt-5 font-serif text-5xl leading-[1.05] text-ink sm:text-6xl">
        Every <span className="italic text-rust">scene.</span>
      </h1>
      <p className="mt-6 max-w-xl font-sans text-base leading-[1.65] text-ink-2">
        The full catalogue — Sentinel-2, Landsat, and ASTER scenes composited
        into false-color and natural-light prints. Filter by region, sensor,
        or treatment.
      </p>

      <div className="mt-12">
        <ArchiveBrowser scenes={scenes} />
      </div>
    </section>
  );
}
