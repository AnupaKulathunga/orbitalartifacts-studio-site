import Link from "next/link";
import { MetaStrip } from "@/components/brand/MetaStrip";
import { SceneCard } from "@/components/scene/SceneCard";
import type { Scene } from "@/lib/scenes";

type FeaturedStripProps = {
  scenes: ReadonlyArray<Scene>;
};

/**
 * Featured strip — spec §6.1, item 3. Three featured scenes in a row.
 */
export function FeaturedStrip({ scenes }: FeaturedStripProps) {
  return (
    <section className="bg-paper py-24 sm:py-32">
      <div className="mx-auto max-w-6xl px-6">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <MetaStrip items={["Featured", "Selected scenes"]} />
            <h2 className="mt-5 font-serif text-4xl leading-[1.1] text-ink sm:text-5xl">
              A few pieces,
              <br />
              <span className="italic text-rust">from the archive.</span>
            </h2>
          </div>
          <Link
            href="/archive"
            className="font-mono text-[11px] uppercase tracking-[0.22em] text-rust-deep transition-opacity hover:opacity-75"
          >
            See all &rarr;
          </Link>
        </div>

        <div className="mt-14 grid gap-12 sm:grid-cols-2 lg:grid-cols-3 lg:gap-10">
          {scenes.map((scene, i) => (
            <SceneCard key={scene.slug} scene={scene} priority={i === 0} />
          ))}
        </div>
      </div>
    </section>
  );
}
