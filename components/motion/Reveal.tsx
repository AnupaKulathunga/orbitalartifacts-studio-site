"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
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
 * Uses a plain IntersectionObserver with a generous rootMargin so the
 * trigger fires as soon as ~15% of the element crosses into view. Once
 * visible, the observer disconnects so re-entering the viewport (via
 * scrolling up) doesn't retrigger — matches spec §8 "once per section."
 *
 * Honors `prefers-reduced-motion`: the check runs inside the effect
 * (not during render) so SSR output stays identical to the animated
 * path. If the user has reduced-motion on, we immediately flip to
 * visible without any transition.
 */
export function Reveal({
  children,
  delay = 0,
  y = 24,
  className,
  as: Tag = "div",
}: RevealProps) {
  const ref = useRef<HTMLElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    if (reducedMotion) {
      setVisible(true);
      return;
    }

    // If the element is already on-screen on mount (e.g. short page, or
    // back/forward nav restored scroll), show it immediately without
    // animation delay — avoids the "why didn't it fade" perception when
    // the user lands mid-page.
    const rect = el.getBoundingClientRect();
    const inViewOnMount =
      rect.top < window.innerHeight && rect.bottom > 0;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      {
        threshold: 0.15,
        // Trigger slightly before the element hits the viewport edge.
        rootMargin: "0px 0px -10% 0px",
      },
    );

    // Defer the observer so the initial paint renders with `visible = false`
    // — that way the very first IO callback (which fires synchronously on
    // observe) animates from hidden to visible rather than skipping it.
    const id = window.requestAnimationFrame(() => {
      if (inViewOnMount) {
        setVisible(true);
        return;
      }
      observer.observe(el);
    });

    return () => {
      window.cancelAnimationFrame(id);
      observer.disconnect();
    };
  }, []);

  return (
    <Tag
      // @ts-expect-error — ref typing narrows per tag but runtime is fine
      ref={ref}
      className={cn(className)}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "none" : `translateY(${y}px)`,
        transition: `opacity 500ms cubic-bezier(0.22, 1, 0.36, 1) ${delay}s, transform 500ms cubic-bezier(0.22, 1, 0.36, 1) ${delay}s`,
        willChange: visible ? undefined : "opacity, transform",
      }}
    >
      {children}
    </Tag>
  );
}
