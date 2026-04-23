"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

type Line = {
  text: string;
  /** Per-line class applied to each word span in the line. */
  className?: string;
};

type HeadlineRevealProps = {
  lines: ReadonlyArray<Line>;
  className?: string;
  /** Per-word stagger offset in ms. */
  stagger?: number;
  /** Per-word fade-up duration in ms. */
  duration?: number;
};

/**
 * Staggered word-by-word reveal for the hero headline — spec §8.
 * 0.8s total feel: ~70ms per-word stagger × ~5 words + 400ms duration.
 *
 * Server renders with opacity 0 / transformed so there is no flash of
 * fully-laid-out text. On mount (one RAF after hydration) `visible`
 * flips to true and the staggered transition plays.
 *
 * `prefers-reduced-motion` short-circuits to fully-visible immediately.
 */
export function HeadlineReveal({
  lines,
  className,
  stagger = 70,
  duration = 400,
}: HeadlineRevealProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const reduce = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    if (reduce) {
      setVisible(true);
      return;
    }
    // Defer one frame so the first paint shows the hidden state and the
    // second paint triggers the transition.
    const id = window.requestAnimationFrame(() => setVisible(true));
    return () => window.cancelAnimationFrame(id);
  }, []);

  let wordIndex = 0;

  return (
    <h1 className={className}>
      {lines.map((line, lineIdx) => {
        const words = line.text.split(" ");
        return (
          <span key={lineIdx}>
            {words.map((word, wi) => {
              const idx = wordIndex++;
              const delay = idx * stagger;
              return (
                <span
                  key={`${lineIdx}-${wi}`}
                  className={cn("inline-block", line.className)}
                  style={{
                    opacity: visible ? 1 : 0,
                    transform: visible ? "none" : "translateY(10px)",
                    transition: `opacity ${duration}ms cubic-bezier(0.22, 1, 0.36, 1) ${delay}ms, transform ${duration}ms cubic-bezier(0.22, 1, 0.36, 1) ${delay}ms`,
                    willChange: visible ? undefined : "opacity, transform",
                  }}
                >
                  {word}
                  {wi < words.length - 1 ? " " : ""}
                </span>
              );
            })}
            {lineIdx < lines.length - 1 ? <br /> : null}
          </span>
        );
      })}
    </h1>
  );
}
