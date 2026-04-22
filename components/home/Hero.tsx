import Link from "next/link";
import { MetaStrip } from "@/components/brand/MetaStrip";
import { HeroRotator } from "@/components/home/HeroRotator";
import type { Scene } from "@/lib/scenes";

type HeroProps = {
  scenes: ReadonlyArray<Scene>;
};

/**
 * Hero — spec §6.1. Full-viewport intro.
 *
 * Left column (server): headline, rust-italic emphasis, copy, CTAs.
 * Right column (client via <HeroRotator />): a cross-fading gallery of
 * featured scenes with coordinated catalogue/coords readout.
 *
 * Scenes without an `imageUrl` are filtered out so the rotator only ever
 * renders real imagery.
 */
export function Hero({ scenes }: HeroProps) {
  const withImages = scenes.filter((s) => Boolean(s.imageUrl));

  return (
    <section className="relative overflow-hidden">
      <div className="mx-auto grid min-h-[88vh] max-w-6xl grid-cols-1 items-center gap-14 px-6 pb-24 pt-16 lg:grid-cols-[1.1fr_1fr] lg:gap-16 lg:pb-32 lg:pt-24">
        {/* Left column — headline */}
        <div className="relative">
          <MetaStrip
            items={["Orbital Artifacts", "Satellite Imagery · Art Prints"]}
          />

          <h1 className="mt-10 font-serif text-[2.75rem] leading-[1.02] tracking-[-0.01em] text-ink sm:text-6xl lg:text-[5.25rem]">
            Earth data,
            <br />
            <span className="italic text-rust">reimagined as art.</span>
          </h1>

          <p className="mt-8 max-w-md font-sans text-base leading-[1.6] text-ink-2">
            A curated archive of Earth, as seen from orbit. Every piece is a
            satellite scene — Sentinel-2, Landsat, ASTER — framed with its
            own coordinates.
          </p>

          <div className="mt-12 flex flex-wrap items-center gap-x-8 gap-y-4 font-mono text-[11px] uppercase tracking-[0.22em]">
            <Link
              href="/archive"
              className="inline-flex items-center gap-2 text-rust transition-opacity hover:opacity-75"
            >
              Enter the archive
              <span aria-hidden>→</span>
            </Link>
            <Link
              href="/process"
              className="text-ink-2 transition-colors hover:text-rust"
            >
              How it&rsquo;s made
            </Link>
          </div>
        </div>

        {/* Right column — cross-fading hero gallery */}
        <HeroRotator scenes={withImages} />
      </div>
    </section>
  );
}
