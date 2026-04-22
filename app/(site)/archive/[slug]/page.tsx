import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

type Params = Promise<{ slug: string }>;

export async function generateMetadata({
  params,
}: {
  params: Params;
}): Promise<Metadata> {
  const { slug } = await params;
  return {
    title: slug,
    description: `Scene ${slug} — Orbital Artifacts archive.`,
  };
}

/**
 * Scene detail — scaffold stub.
 *
 * TODO(M4): implement the two-column gallery-label layout per spec §6.3.
 * TODO(M6): replace static read with Sanity GROQ query for the scene by slug.
 * TODO(M9): per-scene Open Graph image via opengraph-image.tsx.
 */
export default async function ScenePage({ params }: { params: Params }) {
  const { slug } = await params;

  // In M1 we have no data layer yet — every slug 404s gracefully so the
  // route is wired but nothing pretends to exist.
  if (!slug) notFound();

  return (
    <section className="mx-auto max-w-6xl px-6 py-24">
      <p className="font-mono text-xs uppercase tracking-[0.2em] text-muted">
        <span className="mr-2 text-rust" aria-hidden>◉</span>
        Scene · {slug}
      </p>
      <h1 className="mt-6 font-serif text-5xl text-ink sm:text-6xl">
        Scene detail <span className="italic text-rust">placeholder.</span>
      </h1>
      <p className="mt-8 max-w-xl font-sans text-base text-ink-2">
        The two-column gallery-label layout lands in M4.
      </p>
      <Link
        href="/archive"
        className="mt-12 inline-block font-mono text-sm uppercase tracking-[0.2em] text-rust hover:underline"
      >
        ← Back to archive
      </Link>
    </section>
  );
}
