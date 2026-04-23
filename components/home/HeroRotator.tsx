"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { CornerBrackets } from "@/components/brand/CornerBrackets";
import { SignalRings } from "@/components/brand/SignalRings";
import type { Scene } from "@/lib/scenes";

const INTERVAL_MS = 6000;
const FADE_MS = 900;

type HeroRotatorProps = {
  scenes: ReadonlyArray<Scene>;
};

/**
 * Rotating hero tile. Cycles through the featured pool on a slow timer,
 * cross-fading each image into the next. The catalogue / coords readout
 * below the image tracks the current scene so the whole right column
 * reads as a single object.
 *
 * Honors `prefers-reduced-motion`: if the user has asked for less motion,
 * the timer never starts and the hero stays on the first scene.
 *
 * All scenes passed in MUST have `imageUrl` set — server callers filter
 * accordingly so this component doesn't have to guard.
 */
export function HeroRotator({ scenes }: HeroRotatorProps) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (scenes.length <= 1) return;
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (mediaQuery.matches) return;

    const timer = window.setInterval(() => {
      setIndex((i) => (i + 1) % scenes.length);
    }, INTERVAL_MS);

    // If the user toggles the OS setting mid-session, respect it.
    const onChange = () => {
      if (mediaQuery.matches) window.clearInterval(timer);
    };
    mediaQuery.addEventListener("change", onChange);

    return () => {
      window.clearInterval(timer);
      mediaQuery.removeEventListener("change", onChange);
    };
  }, [scenes.length]);

  const current = scenes[index] ?? scenes[0];
  if (!current) return null;

  return (
    <div className="relative">
      {/* Signal rings bleed in from the right, behind the image. */}
      <div className="pointer-events-none absolute -right-16 -top-8 bottom-0 left-0 text-ink-2">
        <SignalRings position="right" count={6} opacity={0.09} />
      </div>

      <div className="relative">
        <CornerBrackets size={18} inset={-8} color="var(--color-ink-2)">
          <div className="relative aspect-square w-full overflow-hidden bg-paper-2 shadow-[0_0_0_1px_rgba(43,42,38,0.08)]">
            {scenes.map((scene, i) => (
              <Image
                key={scene.slug}
                src={scene.imageUrl ?? ""}
                alt={`${scene.title}, ${scene.subtitle} — ${scene.sensor}`}
                fill
                sizes="(min-width: 1024px) 45vw, 100vw"
                priority={i === 0}
                className="object-cover"
                style={{
                  opacity: i === index ? 1 : 0,
                  transition: `opacity ${FADE_MS}ms ease-in-out`,
                }}
              />
            ))}
          </div>
        </CornerBrackets>

        {/* Catalogue + coords readout — updates with the current scene */}
        <div className="mt-4 flex items-center justify-between font-mono text-[11px] uppercase tracking-[0.22em] text-muted">
          <span>
            <span aria-hidden className="mr-2 text-rust">
              ◉
            </span>
            {current.catalogueNumber} · {current.title}
          </span>
          <span>{current.coords.formatted}</span>
        </div>

        {/* Tiny progress dots — visually 1px tall but each button gets a
            24px hit area (padding) so touch targets meet WCAG AA size. */}
        {scenes.length > 1 ? (
          <div className="mt-2 flex items-center justify-end">
            {scenes.map((scene, i) => (
              <button
                key={scene.slug}
                type="button"
                onClick={() => setIndex(i)}
                aria-label={`Show ${scene.title}`}
                aria-current={i === index ? "true" : undefined}
                className="flex h-6 min-w-6 items-center justify-center px-1.5"
              >
                <span
                  aria-hidden
                  className="block h-1 transition-all"
                  style={{
                    width: i === index ? 18 : 6,
                    backgroundColor:
                      i === index
                        ? "var(--color-rust)"
                        : "var(--color-muted)",
                    opacity: i === index ? 1 : 0.4,
                  }}
                />
              </button>
            ))}
          </div>
        ) : null}
      </div>
    </div>
  );
}
