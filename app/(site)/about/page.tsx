import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About",
  description: "Orbital Artifacts is the work of Anupa Kulathunga.",
};

/**
 * About — scaffold stub.
 *
 * TODO(M7): pull MDX from `content/about.mdx` per spec §6.5 (portrait or OA
 * mark placeholder, origin question, bio, "elsewhere" social/marketplace
 * links). Owner to supply real bio copy.
 */
export default function AboutPage() {
  return (
    <section className="mx-auto max-w-3xl px-6 py-24">
      <p className="font-mono text-xs uppercase tracking-[0.2em] text-muted">
        <span className="mr-2 text-rust" aria-hidden>◉</span>
        About
      </p>
      <h1 className="mt-6 font-serif text-5xl text-ink sm:text-6xl">
        <span className="italic text-rust">Who</span> is behind this.
      </h1>
      <p className="mt-8 font-sans text-base text-ink-2">
        Origin story lands in M7 from `content/about.mdx`.
      </p>
    </section>
  );
}
