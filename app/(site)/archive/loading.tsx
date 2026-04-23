import { MetaStrip } from "@/components/brand/MetaStrip";

/**
 * Shown instantly while the archive page's Sanity query resolves.
 * Keeps the page header stable so only the grid area swaps in once
 * data arrives — no layout shift, no blank screen.
 */
export default function ArchiveLoading() {
  return (
    <section className="mx-auto max-w-6xl px-6 py-24">
      <MetaStrip items={["Archive", "Loading"]} />
      <h1 className="mt-5 font-serif text-5xl leading-[1.05] text-ink sm:text-6xl">
        Every <span className="italic text-rust">scene.</span>
      </h1>
      <p className="mt-6 max-w-xl font-sans text-base leading-[1.65] text-ink-2">
        The full catalogue — Sentinel-2, Landsat, and ASTER scenes composited
        into false-color and natural-light prints.
      </p>

      <div className="mt-12" aria-busy="true" aria-live="polite">
        {/* Filter-bar skeleton — same height as the real bar */}
        <div className="-mx-6 border-y border-sand/30 bg-paper-2/85 px-6">
          <div className="mx-auto h-[52px] max-w-6xl" />
        </div>

        {/* Grid skeleton — three tile placeholders on desktop */}
        <div className="mt-14 grid gap-12 sm:grid-cols-2 lg:grid-cols-3 lg:gap-10">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="aspect-square w-full bg-paper-2" />
              <div className="mt-4 h-5 w-2/3 bg-paper-2" />
              <div className="mt-2 h-3 w-1/3 bg-paper-2/70" />
              <div className="mt-3 h-3 w-full bg-paper-2/60" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
