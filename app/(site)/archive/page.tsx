import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Archive",
  description:
    "Every scene in the Orbital Artifacts archive — filter by region, sensor, and treatment.",
};

/**
 * Archive — scaffold stub.
 *
 * TODO(M4): replace with the real archive per spec §6.2:
 *   - Sticky filter bar (region / sensor / treatment / sort)
 *   - Client-side filtered grid, 3-col desktop · 2-col tablet · 1-col mobile
 *   - SceneCard with hover state + rust border
 */
export default function ArchivePage() {
  return (
    <section className="mx-auto max-w-6xl px-6 py-24">
      <p className="font-mono text-xs uppercase tracking-[0.2em] text-muted">
        <span className="mr-2 text-rust" aria-hidden>◉</span>
        Archive · 0 scenes
      </p>
      <h1 className="mt-6 font-serif text-5xl text-ink sm:text-6xl">
        Every <span className="italic text-rust">scene.</span>
      </h1>
      <p className="mt-8 max-w-xl font-sans text-base text-ink-2">
        The full catalogue will live here — filterable by region, sensor,
        and treatment. Populated in M4 with seed data, then wired to Sanity
        in M6.
      </p>
    </section>
  );
}
