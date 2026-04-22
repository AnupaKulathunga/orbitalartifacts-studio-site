import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Process",
  description:
    "How a satellite pass becomes a print — the data, the composition, the craft.",
};

/**
 * Process — scaffold stub.
 *
 * TODO(M7): port long-form content from `content/process.mdx` into an MDX
 * article layout per spec §6.4 (editorial image + text alternating, 6
 * sections from "The data is public" through "The print").
 */
export default function ProcessPage() {
  return (
    <section className="mx-auto max-w-3xl px-6 py-24">
      <p className="font-mono text-xs uppercase tracking-[0.2em] text-muted">
        <span className="mr-2 text-rust" aria-hidden>◉</span>
        Process
      </p>
      <h1 className="mt-6 font-serif text-5xl text-ink sm:text-6xl">
        From a satellite pass<br />
        <span className="italic text-rust">to a print.</span>
      </h1>
      <p className="mt-8 font-sans text-base text-ink-2">
        Long-form MDX article arrives in M7. Copy to be provided by Anupa.
      </p>
    </section>
  );
}
