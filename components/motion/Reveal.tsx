"use client";

import { motion, useReducedMotion } from "motion/react";
import type { ReactNode } from "react";

type RevealProps = {
  children: ReactNode;
  /** Stagger offset when several reveals are visible at once, in seconds. */
  delay?: number;
  /** Travel distance of the fade-up, in px. Kept small by default. */
  y?: number;
  className?: string;
  /** Render as a different element (e.g. `section`, `li`). Defaults to div. */
  as?: "div" | "section" | "article" | "li";
};

/**
 * Fade-up-on-scroll wrapper — spec §8. Once per section, 0.4s ease-out.
 * Honors `prefers-reduced-motion` by rendering children with no animation
 * at all when the user has asked for less motion.
 */
export function Reveal({
  children,
  delay = 0,
  y = 24,
  className,
  as = "div",
}: RevealProps) {
  const reduce = useReducedMotion();

  if (reduce) {
    const Static = as;
    return <Static className={className}>{children}</Static>;
  }

  const MotionTag = motion[as] as typeof motion.div;

  return (
    <MotionTag
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-10% 0px -10% 0px" }}
      transition={{ duration: 0.4, ease: "easeOut", delay }}
      className={className}
    >
      {children}
    </MotionTag>
  );
}
