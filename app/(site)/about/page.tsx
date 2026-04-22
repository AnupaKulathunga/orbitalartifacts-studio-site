import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { CornerBrackets } from "@/components/brand/CornerBrackets";
import { MetaStrip } from "@/components/brand/MetaStrip";
import { getSiteSettings } from "@/lib/siteConfig";

export const metadata: Metadata = {
  title: "About",
  description:
    "About Anupa Kulathunga and the Orbital Artifacts studio — satellite imagery composed as art prints.",
};

export const revalidate = 60;

/**
 * TODO(owner): replace the placeholder bio below with the full 400–600
 * word version (spec §6.5). Starting copy can be lifted from the Pinterest
 * bio and expanded. Drop a portrait at /public/brand/portrait.jpg to
 * replace the studio-mark placeholder.
 */
export default async function AboutPage() {
  const settings = await getSiteSettings();

  return (
    <article className="mx-auto max-w-3xl px-6 py-20 sm:py-24">
      <MetaStrip items={["About"]} />
      <h1 className="mt-6 font-serif text-5xl leading-[1.05] text-ink sm:text-6xl">
        The work of{" "}
        <span className="italic text-rust">Anupa Kulathunga.</span>
      </h1>

      <div className="mt-14 flex flex-col gap-10 sm:flex-row sm:items-start">
        <div className="w-full max-w-[280px] shrink-0">
          <CornerBrackets size={14} inset={-6} color="var(--color-ink-2)">
            <div className="relative aspect-square w-full overflow-hidden bg-paper-2">
              <Image
                src="/brand/shop-icon.png"
                alt="Orbital Artifacts studio mark"
                fill
                sizes="(min-width: 640px) 280px, 100vw"
                className="object-cover"
              />
            </div>
          </CornerBrackets>
          <p className="mt-4 font-mono text-[10px] uppercase tracking-[0.25em] text-muted">
            <span aria-hidden className="mr-2 text-rust">◉</span>
            Anupa Kulathunga · Sri Lanka
          </p>
        </div>

        <div>
          <p className="font-serif text-2xl italic leading-[1.35] text-ink">
            &ldquo;{settings.originQuestion}&rdquo;
          </p>

          <div className="mt-8 flex flex-col gap-5 font-sans text-base leading-[1.75] text-ink-2">
            <p>
              Orbital Artifacts is a one-person studio working at the seam
              between Earth observation and image-making. The source material
              is open: Sentinel-2, Landsat, ASTER — the same data climate
              scientists use every day. The output is print.
            </p>
            <p>
              Every scene starts as raw satellite bands — channels of
              infrared, shortwave, thermal — and gets composited through SNAP
              into a false-color frame that reveals what the human eye
              can&rsquo;t see. Lakes read as copper. Deserts as deep blue.
              Volcanoes shout. The colors are lies in the kindest way: they
              tell truths about chemistry, vegetation, mineralogy that
              natural light simply can&rsquo;t.
            </p>
            <p>
              I&rsquo;m Anupa Kulathunga, based in Sri Lanka. This project
              started as a question on a Pinterest board — <em>what if the
              way satellites see our planet is itself a kind of art?</em> —
              and became a catalogue, a framing system, and a shop. Every
              print carries its own coordinates. It&rsquo;s Earth, in its
              own handwriting.
            </p>
            <p>
              The archive will keep growing. If a place matters to you and
              isn&rsquo;t in the catalogue yet,{" "}
              <Link
                href="/contact"
                className="text-rust transition-opacity hover:opacity-75"
              >
                commission one →
              </Link>
            </p>
          </div>
        </div>
      </div>

      <section className="mt-20 border-t border-sand/30 pt-10">
        <p className="font-mono text-[11px] uppercase tracking-[0.25em] text-muted">
          Elsewhere
        </p>

        <div className="mt-6 grid gap-10 sm:grid-cols-2">
          <ElsewhereColumn
            title="Follow"
            empty="Social links coming soon."
            items={settings.socialLinks}
          />
          <ElsewhereColumn
            title="Buy"
            empty="Shop links coming soon."
            items={settings.marketplaceLinks}
          />
        </div>
      </section>
    </article>
  );
}

function ElsewhereColumn({
  title,
  empty,
  items,
}: {
  title: string;
  empty: string;
  items: ReadonlyArray<{ platform: string; url: string }>;
}) {
  return (
    <div>
      <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-rust">
        {title}
      </p>
      {items.length === 0 ? (
        <p className="mt-3 font-sans text-sm text-muted/80">{empty}</p>
      ) : (
        <ul className="mt-3 flex flex-col gap-2">
          {items.map((item) => (
            <li key={item.platform}>
              <a
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                className="font-sans text-base text-ink-2 transition-colors hover:text-rust"
              >
                {item.platform}
                <span aria-hidden className="ml-2 text-rust">
                  ↗
                </span>
              </a>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
