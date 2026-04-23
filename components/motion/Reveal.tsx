"use client";

import { useInView, useReducedMotion } from "motion/react";
import { useRef, type ReactNode } from "react";
import { cn } from "@/lib/utils";

type RevealProps = {
  children: ReactNode;
  /** Stagger offset when adjacent reveals fire together. */
  delay?: number;
  /** Travel distance of the fade-up, in px. */
  y?: number;
  className?: string;
  /** Underlying element. Defaults to div so it doesn't affect layout. */
  as?: "div" | "section" | "article" | "li";
};

/**
 * Scroll-reveal wrapper — fades content up as it enters the viewport.
 *
 * Uses motion's `useInView` (backed by IntersectionObserver) with
 * `once: true` so each section reveals exactly once. The trigger fires
 * when 15% of the element is in the viewport — generous enough that
 * sections don't have to be fully scrolled past before firing, strict
 * enough that the top edge has actually entered. Matches spec §8.
 *
 * Honors `prefers-reduced-motion`.
 */
export function Reveal({
  children,
  delay = 0,
  y = 24,
  className,
  as: Tag = "div",
}: RevealProps) {
  const ref = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();
  const inView = useInView(ref, {
    once: true,
    // Fire when the top of the element has crossed roughly 1/3 of the
    // viewport from the bottom — the element is clearly on-screen when
    // the fade starts, so the motion is actually noticeable rather than
    // already-completed by the time it's read.
    amount: 0,
    margin: "0px 0px -33% 0px",
  });

  const visible = reduce || inView;

  return (
    <Tag
      // @ts-expect-error — ref typing narrows per tag; runtime is fine
      ref={ref}
      className={cn(className)}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "none" : `translateY(${y}px)`,
        transition: reduce
          ? "none"
          : `opacity 800ms cubic-bezier(0.22, 1, 0.36, 1) ${delay}s, transform 800ms cubic-bezier(0.22, 1, 0.36, 1) ${delay}s`,
        willChange: visible ? undefined : "opacity, transform",
      }}
    >
      {children}
    </Tag>
  );
}
