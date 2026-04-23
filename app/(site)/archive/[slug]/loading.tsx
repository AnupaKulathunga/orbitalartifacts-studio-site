import { CornerBrackets } from "@/components/brand/CornerBrackets";

/**
 * Shown while a scene detail's GROQ query resolves. Mirrors the two-column
 * gallery layout so the first paint has the right shape — no layout shift
 * when the real data arrives.
 */
export default function SceneLoading() {
  return (
    <article
      className="mx-auto max-w-6xl px-6 py-16 sm:py-20"
      aria-busy="true"
      aria-live="polite"
    >
      <div className="grid gap-12 lg:grid-cols-[3fr_2fr] lg:gap-16">
        <div>
          <CornerBrackets size={16} inset={-6} color="var(--color-ink-2)">
            <div className="aspect-square w-full animate-pulse bg-paper-2" />
          </CornerBrackets>
          <div className="mt-5 h-3 w-3/4 animate-pulse bg-paper-2" />
        </div>

        <aside className="flex flex-col gap-6">
          <div className="h-3 w-20 animate-pulse bg-paper-2" />
          <div className="h-14 w-3/4 animate-pulse bg-paper-2" />
          <div className="h-4 w-1/2 animate-pulse bg-paper-2/80" />
          <div className="mt-4 flex flex-col gap-2">
            <div className="h-3 w-40 animate-pulse bg-paper-2/70" />
            <div className="h-3 w-48 animate-pulse bg-paper-2/70" />
            <div className="h-3 w-36 animate-pulse bg-paper-2/70" />
          </div>
          <div className="mt-6 h-24 w-full animate-pulse bg-paper-2/60" />
        </aside>
      </div>
    </article>
  );
}
