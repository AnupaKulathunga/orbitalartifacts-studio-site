import type { Metadata } from "next";
import { MetaStrip } from "@/components/brand/MetaStrip";
import { ContactForm } from "@/components/contact/ContactForm";
import { getSiteSettings } from "@/lib/siteConfig";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Commissions, licensing, and wholesale inquiries for Orbital Artifacts.",
};

export const revalidate = 60;

export default async function ContactPage() {
  const { contactEmail } = await getSiteSettings();
  const configured = Boolean(process.env.WEB3FORMS_ACCESS_KEY);

  return (
    <section className="mx-auto max-w-2xl px-6 py-24">
      <MetaStrip items={["Contact"]} />
      <h1 className="mt-6 font-serif text-5xl leading-[1.05] text-ink sm:text-6xl">
        Get in <span className="italic text-rust">touch.</span>
      </h1>
      <p className="mt-8 max-w-lg font-sans text-base leading-[1.65] text-ink-2">
        Commissions, licensing, wholesale, press — or just a note. I read
        everything and reply within a few days.
      </p>

      {configured ? (
        <ContactForm />
      ) : (
        <div className="mt-12 border border-sand/40 bg-paper-2/60 p-8">
          <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-muted">
            ◉ Form offline
          </p>
          <p className="mt-4 font-serif text-lg italic leading-[1.45] text-ink-2">
            The contact form isn&rsquo;t hooked up yet — email me directly
            in the meantime.
          </p>
        </div>
      )}

      <p className="mt-14 border-t border-sand/30 pt-8 font-sans text-sm text-ink-2">
        Prefer plain email?{" "}
        <a
          href={`mailto:${contactEmail}`}
          className="text-rust transition-opacity hover:opacity-75"
        >
          {contactEmail}
        </a>
      </p>
    </section>
  );
}
