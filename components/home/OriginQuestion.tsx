import { SignalRings } from "@/components/brand/SignalRings";
import { getSiteSettings } from "@/lib/siteConfig";

/**
 * Origin question — spec §6.1, item 2.
 *
 * Large Fraunces italic quote, centered. Fade-in on scroll is added in M8.
 * Copy comes from Sanity `siteSettings.originQuestion`; a spec-derived
 * default kicks in when the field is empty.
 */
export async function OriginQuestion() {
  const { originQuestion } = await getSiteSettings();

  return (
    <section className="relative overflow-hidden border-y border-sand/30 bg-paper">
      <div className="pointer-events-none absolute inset-0 text-ink-2">
        <SignalRings position="center" count={6} opacity={0.05} />
      </div>

      <div className="relative mx-auto max-w-4xl px-6 py-32 text-center sm:py-40">
        <p className="font-mono text-[11px] uppercase tracking-[0.25em] text-rust">
          Origin
        </p>
        <blockquote className="mt-10 font-serif text-[1.65rem] leading-[1.25] text-ink sm:text-3xl md:text-4xl lg:text-[2.75rem]">
          <span className="italic">&ldquo;{originQuestion}&rdquo;</span>
        </blockquote>
      </div>
    </section>
  );
}
