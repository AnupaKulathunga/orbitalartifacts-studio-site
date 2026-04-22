import Image from "next/image";
import Link from "next/link";
import { CornerBrackets } from "@/components/brand/CornerBrackets";
import { MetaStrip } from "@/components/brand/MetaStrip";
import { SignalRings } from "@/components/brand/SignalRings";

/**
 * Process teaser — spec §6.1, item 4.
 *
 * Band-composition diagram: the three tiles on the left are the real
 * grayscale channel separations of the Re-entry composite — its red
 * channel IS Landsat 8 B07 (SWIR-2), green IS B06 (SWIR-1), blue IS B04
 * (Red), which is how the false-color was assembled in the first place.
 * Stacking them beside the composited output shows the mechanic of
 * false-color satellite art without a software screenshot.
 */
const BANDS = [
  { label: "B07", detail: "SWIR-2", src: "/process/band-b07.jpg" },
  { label: "B06", detail: "SWIR-1", src: "/process/band-b06.jpg" },
  { label: "B04", detail: "RED", src: "/process/band-b04.jpg" },
] as const;

export function ProcessTeaser() {
  return (
    <section className="border-t border-sand/30 bg-paper-2/40 py-24 sm:py-32">
      <div className="mx-auto grid max-w-6xl gap-14 px-6 lg:grid-cols-2 lg:items-center lg:gap-20">
        {/* Visual — band composition diagram */}
        <div className="relative">
          <div className="pointer-events-none absolute -inset-6 text-ink-2">
            <SignalRings position="left" count={5} opacity={0.06} />
          </div>
          <CornerBrackets size={16} inset={-6} color="var(--color-ink-2)">
            <div className="relative aspect-[4/3] w-full overflow-hidden bg-paper p-5 sm:p-6">
              <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-muted">
                <span aria-hidden className="mr-2 text-rust">◉</span>
                B07 · B06 · B04 → RGB
              </p>

              <div className="mt-4 grid h-[calc(100%-2.75rem)] grid-cols-[auto_auto_1fr] items-center gap-3 sm:gap-4">
                {/* Three grayscale band tiles */}
                <div className="flex h-full flex-col justify-between gap-2">
                  {BANDS.map((band) => (
                    <div
                      key={band.label}
                      className="relative aspect-square w-16 overflow-hidden bg-paper-2 shadow-[0_0_0_1px_rgba(43,42,38,0.08)] sm:w-20"
                    >
                      <Image
                        src={band.src}
                        alt={`${band.label} ${band.detail} channel`}
                        fill
                        sizes="80px"
                        className="object-cover"
                      />
                      <span className="absolute bottom-1 left-1 right-1 flex items-center justify-between font-mono text-[8px] uppercase tracking-[0.18em] text-paper drop-shadow-[0_1px_1px_rgba(0,0,0,0.5)] sm:text-[9px]">
                        <span>{band.label}</span>
                        <span className="opacity-70">{band.detail}</span>
                      </span>
                    </div>
                  ))}
                </div>

                {/* Arrow */}
                <div
                  aria-hidden
                  className="flex h-full flex-col items-center justify-center text-rust"
                >
                  <svg
                    width="28"
                    height="14"
                    viewBox="0 0 28 14"
                    fill="none"
                    className="sm:h-4 sm:w-9"
                  >
                    <path
                      d="M1 7h24m-5-5l5 5-5 5"
                      stroke="currentColor"
                      strokeWidth="1"
                      strokeLinecap="square"
                    />
                  </svg>
                </div>

                {/* Composite output */}
                <div className="relative aspect-square h-full overflow-hidden bg-paper-2 shadow-[0_0_0_1px_rgba(43,42,38,0.08)]">
                  <Image
                    src="/scenes/re-entry.jpg"
                    alt="Re-entry false-color composite"
                    fill
                    sizes="(min-width: 1024px) 30vw, 50vw"
                    className="object-cover"
                  />
                </div>
              </div>

              <p className="absolute bottom-3 right-5 font-mono text-[10px] uppercase tracking-[0.25em] text-muted sm:right-6">
                histogram stretch · 99%
              </p>
            </div>
          </CornerBrackets>
        </div>

        {/* Copy */}
        <div>
          <MetaStrip items={["Process"]} />
          <h2 className="mt-5 font-serif text-4xl leading-[1.1] text-ink sm:text-5xl">
            From a satellite pass
            <br />
            <span className="italic text-rust">to a print.</span>
          </h2>
          <p className="mt-7 max-w-md font-sans text-base leading-[1.65] text-ink-2">
            Every scene begins as public data — Sentinel-2, Landsat, ASTER —
            composited through SNAP into a band combination that reveals
            what the eye can&rsquo;t. Then it&rsquo;s framed with its own
            coordinates and printed at museum grade.
          </p>
          <Link
            href="/process"
            className="mt-10 inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.22em] text-rust transition-opacity hover:opacity-75"
          >
            Read the process
            <span aria-hidden>→</span>
          </Link>
        </div>
      </div>
    </section>
  );
}
