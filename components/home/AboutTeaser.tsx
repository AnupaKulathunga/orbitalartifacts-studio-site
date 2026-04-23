import Image from "next/image";
import Link from "next/link";
import { CornerBrackets } from "@/components/brand/CornerBrackets";
import { MetaStrip } from "@/components/brand/MetaStrip";

/**
 * About teaser — spec §6.1, item 5.
 *
 * Portrait slot uses the pre-composed shop-icon (mark on a paper-colored
 * circle) as the placeholder. It's the right stand-in because it's an
 * existing brand asset — the same avatar Anupa uses on the Etsy store —
 * and reads as "studio mark" rather than "missing image".
 *
 * TODO(owner): when a portrait photo is available, drop it at
 * `/public/brand/portrait.jpg` and swap the <Image> src below.
 * TODO(owner): replace the Lorem bio with a 2-sentence distillation of the
 * full About page copy.
 */
export function AboutTeaser() {
  return (
    <section className="border-t border-sand/30 bg-paper py-24 sm:py-32">
      <div className="mx-auto grid max-w-6xl gap-14 px-6 lg:grid-cols-[minmax(0,_1fr)_minmax(0,_1.7fr)] lg:items-center lg:gap-20">
        {/* Portrait slot */}
        <div>
          <CornerBrackets size={14} inset={-6} color="var(--color-ink-2)">
            <div className="relative aspect-square w-full overflow-hidden bg-paper-2">
              <Image
                src="/brand/shop-icon.png"
                alt="Orbital Artifacts studio mark"
                fill
                sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                className="object-cover"
              />
            </div>
          </CornerBrackets>
          <p className="mt-4 font-mono text-[10px] uppercase tracking-[0.25em] text-muted">
            <span aria-hidden className="mr-2 text-rust">◉</span>
            Anupa Kulathunga · Sri Lanka
          </p>
        </div>

        {/* Bio */}
        <div>
          <MetaStrip items={["About"]} />
          <h2 className="mt-5 font-serif text-[2rem] leading-[1.15] text-ink sm:text-4xl lg:text-[2.625rem]">
            Orbital Artifacts is the work of{" "}
            <span className="italic text-rust">
              Anupa Kulathunga,
            </span>{" "}
            from Sri Lanka.
          </h2>
          <p className="mt-7 max-w-xl font-sans text-base leading-[1.65] text-ink-2">
            {/* TODO(owner): Anupa to supply a 2-sentence bio for this teaser. */}
            Lorem ipsum — About teaser copy pending. The full origin story
            and process will live on the About page.
          </p>
          <Link
            href="/about"
            className="mt-10 inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.22em] text-rust-deep transition-opacity hover:opacity-75"
          >
            Read the story
            <span aria-hidden>→</span>
          </Link>
        </div>
      </div>
    </section>
  );
}
