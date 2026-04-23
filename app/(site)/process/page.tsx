import type { Metadata } from "next";
import Link from "next/link";
import { MetaStrip } from "@/components/brand/MetaStrip";
import { Reveal } from "@/components/motion/Reveal";
import Content from "@/content/process.mdx";

export const metadata: Metadata = {
  title: "Process",
  description:
    "From a satellite pass to a print — how Orbital Artifacts composes open Earth-observation data into art.",
};

export default function ProcessPage() {
  return (
    <article className="mx-auto max-w-3xl px-6 py-20 sm:py-24">
      <MetaStrip items={["Process"]} />
      <h1 className="mt-6 font-serif text-5xl leading-[1.05] text-ink sm:text-6xl">
        From a satellite pass
        <br />
        <span className="italic text-rust">to a print.</span>
      </h1>
      <p className="mt-8 max-w-xl font-sans text-base leading-[1.65] text-ink-2">
        Every scene in the archive is the output of a slow pipeline that
        starts with freely-available Earth observation data and ends with
        pigment on cotton paper. Here&rsquo;s how.
      </p>

      <Reveal>
        <Content />
      </Reveal>

      <div className="mt-24 border-t border-sand/30 pt-10">
        <Link
          href="/archive"
          className="inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.22em] text-rust transition-opacity hover:opacity-75"
        >
          See the archive
          <span aria-hidden>→</span>
        </Link>
      </div>
    </article>
  );
}
