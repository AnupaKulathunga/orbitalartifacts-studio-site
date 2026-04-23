import type { Metadata } from "next";
import Link from "next/link";
import { MetaStrip } from "@/components/brand/MetaStrip";
import { getPressEntries, type PressEntry } from "@/lib/press";

export const metadata: Metadata = {
  title: "Press",
  description: "Features and mentions of Orbital Artifacts.",
};

export const revalidate = 60;

export default async function PressPage() {
  const entries = await getPressEntries();

  return (
    <section className="mx-auto max-w-3xl px-6 py-24">
      <MetaStrip
        items={[
          "Press",
          entries.length === 0 ? "Nothing yet" : `${entries.length} entries`,
        ]}
      />

      <h1 className="mt-6 font-serif text-5xl leading-[1.05] text-ink sm:text-6xl">
        In the <span className="italic text-rust">wild.</span>
      </h1>

      {entries.length === 0 ? (
        <EmptyState />
      ) : (
        <ul className="mt-16 flex flex-col divide-y divide-sand/30">
          {entries.map((entry) => (
            <PressRow key={entry._id} entry={entry} />
          ))}
        </ul>
      )}
    </section>
  );
}

function EmptyState() {
  return (
    <div className="mt-14 max-w-xl">
      <p className="font-serif text-2xl italic leading-[1.35] text-ink sm:text-3xl">
        Nothing yet. If you&rsquo;d like to feature Orbital Artifacts,{" "}
        <Link href="/contact" className="text-rust hover:underline">
          get in touch →
        </Link>
      </p>
    </div>
  );
}

function PressRow({ entry }: { entry: PressEntry }) {
  const year = entry.date.slice(0, 4);
  return (
    <li className="py-8 first:pt-10 last:pb-10">
      <a
        href={entry.url}
        target="_blank"
        rel="noopener noreferrer"
        className="group flex flex-col gap-2 sm:grid sm:grid-cols-[6rem_1fr_auto] sm:items-baseline sm:gap-8"
      >
        <span className="font-mono text-[11px] uppercase tracking-[0.22em] text-muted">
          {entry.date}
        </span>

        <div>
          <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-rust-deep">
            {entry.publication}
          </p>
          <h2 className="mt-2 font-serif text-xl text-ink transition-colors group-hover:text-rust sm:text-2xl">
            {entry.title}
          </h2>
          {entry.quote ? (
            <p className="mt-3 max-w-xl font-serif italic leading-[1.55] text-ink-2">
              &ldquo;{entry.quote}&rdquo;
            </p>
          ) : null}
          <span className="sr-only"> (opens in new tab — {year})</span>
        </div>

        <span
          aria-hidden
          className="font-mono text-sm text-rust-deep transition-transform group-hover:translate-x-0.5"
        >
          ↗
        </span>
      </a>
    </li>
  );
}
