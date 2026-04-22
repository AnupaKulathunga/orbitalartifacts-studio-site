import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Commissions, licensing, and wholesale inquiries for Orbital Artifacts.",
};

/**
 * Contact — scaffold stub.
 *
 * TODO(M7): build the form per spec §6.7 — fields: name, email, type
 * (Commission/Licensing/Wholesale/Press/Other), message. Submit via
 * Web3Forms (WEB3FORMS_ACCESS_KEY env var). Inline success state, no
 * redirect. Plain-text email fallback below.
 */
export default function ContactPage() {
  return (
    <section className="mx-auto max-w-2xl px-6 py-24">
      <p className="font-mono text-xs uppercase tracking-[0.2em] text-muted">
        <span className="mr-2 text-rust" aria-hidden>◉</span>
        Contact
      </p>
      <h1 className="mt-6 font-serif text-5xl text-ink sm:text-6xl">
        Get in <span className="italic text-rust">touch.</span>
      </h1>
      <p className="mt-8 font-sans text-base text-ink-2">
        Contact form lands in M7. Web3Forms access key needed in `.env.local`
        before it can actually send.
      </p>
    </section>
  );
}
