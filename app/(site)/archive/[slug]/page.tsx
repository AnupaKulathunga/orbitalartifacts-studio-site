import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CornerBrackets } from "@/components/brand/CornerBrackets";
import { SceneJsonLd } from "@/components/scene/SceneJsonLd";
import { SceneThumbnail } from "@/components/scene/SceneThumbnail";
import {
  getAllSceneSlugs,
  getSceneBySlug,
  getSceneNeighbours,
  type Scene,
} from "@/lib/scenes";

/**
 * Under-image metadata strip. Only renders fields the scene actually has —
 * EaA entries typically have acquisition date + sensor; processed scenes
 * add band combo + processing notes.
 */
function AcquisitionStrip({ scene }: { scene: Scene }) {
  const bits = [
    scene.acquisitionDate ? `Acquired ${scene.acquisitionDate}` : null,
    scene.sensor,
    scene.bandCombo,
    scene.processingNotes,
  ].filter(Boolean);
  if (bits.length === 0) return null;
  return (
    <p className="mt-5 flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-[11px] uppercase tracking-[0.22em] text-muted">
      <span aria-hidden className="text-rust">◉</span>
      {bits.map((b, i) => (
        <span key={i} className="flex items-center gap-3">
          {i > 0 ? <span aria-hidden className="text-sand">·</span> : null}
          <span>{b}</span>
        </span>
      ))}
    </p>
  );
}

type Params = Promise<{ slug: string }>;

export const revalidate = 60;

export async function generateStaticParams() {
  const slugs = await getAllSceneSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Params;
}): Promise<Metadata> {
  const { slug } = await params;
  const scene = await getSceneBySlug(slug);
  if (!scene) return { title: "Scene not found" };
  const descBits = [
    scene.catalogueNumber,
    scene.sensor,
    scene.bandCombo,
    scene.coords?.formatted,
  ].filter(Boolean);
  return {
    title: scene.subtitle ? `${scene.title} — ${scene.subtitle}` : scene.title,
    description: descBits.join(" · "),
  };
}

export default async function ScenePage({ params }: { params: Params }) {
  const { slug } = await params;
  const scene = await getSceneBySlug(slug);
  if (!scene) notFound();

  const { prev, next } = await getSceneNeighbours(slug);

  return (
    <article className="mx-auto max-w-6xl px-6 py-16 sm:py-20">
      <SceneJsonLd scene={scene} />
      <div className="grid gap-12 lg:grid-cols-[3fr_2fr] lg:gap-16">
        {/* LEFT — image + acquisition strip */}
        <div>
          <CornerBrackets size={16} inset={-6} color="var(--color-ink-2)">
            <div className="relative aspect-square w-full overflow-hidden bg-paper-2 shadow-[0_0_0_1px_rgba(43,42,38,0.08)]">
              <SceneThumbnail
                scene={scene}
                priority
                sizes="(min-width: 1024px) 60vw, 100vw"
              />
            </div>
          </CornerBrackets>

          <AcquisitionStrip scene={scene} />
        </div>

        {/* RIGHT — sticky gallery-label */}
        <aside className="lg:sticky lg:top-[96px] lg:self-start">
          <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-muted">
            <span aria-hidden className="mr-2 text-rust">◉</span>
            {scene.catalogueNumber}
          </p>

          <h1 className="mt-6 font-serif text-4xl leading-[1.05] text-ink sm:text-5xl">
            {scene.title}
          </h1>
          <p className="mt-3 font-sans text-base text-ink-2">
            {scene.subtitle}
          </p>

          <div className="mt-8 space-y-1 font-mono text-[12px] uppercase tracking-[0.2em] text-ink-2">
            {scene.coords?.formatted ? <p>{scene.coords.formatted}</p> : null}
            <p>
              {[scene.sensor, scene.bandCombo].filter(Boolean).join(" · ")}
            </p>
            {scene.acquisitionDate ? <p>Acquired {scene.acquisitionDate}</p> : null}
            {scene.region || scene.treatment ? (
              <p className="text-muted">
                {[scene.region, scene.treatment].filter(Boolean).join(" · ")}
              </p>
            ) : null}
            {scene.source === "earth-as-art" && scene.sourceCredit ? (
              <p className="text-muted">{scene.sourceCredit}</p>
            ) : null}
          </div>

          <p className="mt-10 max-w-md font-sans text-base leading-[1.7] text-ink-2">
            {scene.narrative}
          </p>

          {scene.source === "earth-as-art" ? (
            <aside className="mt-8 max-w-md border-l-2 border-sand/60 pl-4 font-sans text-sm leading-[1.65] text-ink-2">
              <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted">
                Curated from
              </p>
              <p className="mt-1">
                U.S. Geological Survey —{" "}
                {scene.sourceUrl ? (
                  <a
                    href={scene.sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-rust-deep underline underline-offset-4 decoration-rust-deep/40 transition-opacity hover:opacity-75 hover:decoration-rust-deep"
                  >
                    Earth as Art
                    {scene.sourceCollection ? ` ${scene.sourceCollection}` : ""}
                    {scene.sourceTitle && scene.sourceTitle !== scene.title
                      ? `, “${scene.sourceTitle}”`
                      : ""}
                  </a>
                ) : (
                  <span>
                    Earth as Art
                    {scene.sourceCollection ? ` ${scene.sourceCollection}` : ""}
                  </span>
                )}
                . Imagery in the public domain; the edit and sequencing are
                Orbital Artifacts&rsquo;.
              </p>
            </aside>
          ) : null}

          <hr className="mt-10 max-w-md border-t border-sand/40" />

          <div className="mt-8 max-w-md">
            <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-muted">
              Available as
            </p>

            {scene.availability.length === 0 ? (
              <p className="mt-4 font-sans text-sm leading-[1.65] text-ink-2">
                Not yet in the shop.{" "}
                <Link
                  href="/contact"
                  className="text-rust-deep underline underline-offset-4 decoration-rust-deep/40 transition-opacity hover:opacity-75 hover:decoration-rust-deep"
                >
                  Get in touch →
                </Link>{" "}
                for commissions or an early print of this scene.
              </p>
            ) : (
              <ul className="mt-4 flex flex-col gap-3">
                {scene.availability.map((link) => (
                  <li key={`${link.platform}-${link.url}`}>
                    <a
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group flex items-center justify-between gap-4 border border-sand/40 bg-paper px-4 py-3 transition-colors hover:border-rust"
                    >
                      <span>
                        <span className="block font-serif text-base text-ink">
                          {link.productType}
                        </span>
                        <span className="mt-0.5 block font-mono text-[10px] uppercase tracking-[0.22em] text-muted">
                          {link.platform} · from ${link.startingPrice}
                        </span>
                      </span>
                      <span
                        aria-hidden
                        className="font-mono text-sm text-rust-deep transition-transform group-hover:translate-x-0.5"
                      >
                        →
                      </span>
                    </a>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </aside>
      </div>

      {/* Bottom nav */}
      <nav
        aria-label="Scene navigation"
        className="mt-24 flex flex-col gap-8 border-t border-sand/30 pt-10 sm:flex-row sm:items-start sm:justify-between"
      >
        <Link
          href="/archive"
          className="font-mono text-[11px] uppercase tracking-[0.22em] text-rust-deep transition-opacity hover:opacity-75"
        >
          ← Back to archive
        </Link>

        <div className="flex flex-col gap-6 sm:flex-row sm:gap-10">
          {prev ? (
            <SceneStep direction="prev" scene={prev} />
          ) : (
            <span className="sm:w-40" aria-hidden />
          )}
          {next ? <SceneStep direction="next" scene={next} /> : null}
        </div>
      </nav>
    </article>
  );
}

type SceneStepProps = {
  direction: "prev" | "next";
  scene: { slug: string; title: string; catalogueNumber: string };
};

function SceneStep({ direction, scene }: SceneStepProps) {
  const label = direction === "prev" ? "Previous" : "Next";
  const arrow = direction === "prev" ? "←" : "→";
  const align = direction === "prev" ? "text-left" : "sm:text-right";

  return (
    <Link
      href={`/archive/${scene.slug}`}
      className={`group block max-w-[200px] ${align}`}
    >
      <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted">
        {direction === "prev" ? `${arrow} ${label}` : `${label} ${arrow}`}
      </p>
      <p className="mt-2 font-serif text-lg text-ink transition-colors group-hover:text-rust">
        {scene.title}
      </p>
      <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.22em] text-muted">
        {scene.catalogueNumber}
      </p>
    </Link>
  );
}
