import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Press",
  description: "Features and mentions of Orbital Artifacts.",
};

/**
 * Press — scaffold stub.
 *
 * TODO(M6): query Sanity for `pressEntry[]` per spec §6.6.
 * TODO(M7): render list when non-empty; keep empty state below for first launch.
 */
export default function PressPage() {
  const pressEntries: Array<unknown> = []; // populated via Sanity in M6

  return (
    <section className="mx-auto max-w-3xl px-6 py-24">
      <p className="font-mono text-xs uppercase tracking-[0.2em] text-muted">
        <span className="mr-2 text-rust" aria-hidden>◉</span>
        Press
      </p>

      {pressEntries.length === 0 ? (
        <div className="mt-10">
          <p className="font-serif text-3xl italic leading-relaxed text-ink sm:text-4xl">
            Nothing yet.
            <br />
            If you&rsquo;d like to feature Orbital Artifacts,{" "}
            <Link href="/contact" className="text-rust hover:underline">
              get in touch →
            </Link>
          </p>
        </div>
      ) : null}
    </section>
  );
}
