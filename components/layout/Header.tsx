"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Logo } from "@/components/brand/Logo";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/archive", label: "Archive" },
  { href: "/process", label: "Process" },
  { href: "/about", label: "About" },
  { href: "/press", label: "Press" },
  { href: "/contact", label: "Contact" },
] as const;

export function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 4);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close mobile menu on route change.
  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  // Lock body scroll while the mobile menu is open.
  useEffect(() => {
    if (!menuOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [menuOpen]);

  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(`${href}/`);

  return (
    <>
      <header
        className={cn(
          "sticky top-0 z-50 transition-[background-color,border-color,backdrop-filter] duration-200",
          scrolled
            ? "border-b border-sand/40 bg-paper/90 backdrop-blur-sm"
            : "border-b border-transparent bg-paper/60 backdrop-blur-[2px]",
        )}
      >
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Logo variant="lockup" markSize={40} href="/" />

          <nav
            aria-label="Primary"
            className="hidden items-center gap-7 font-mono text-[11px] uppercase tracking-[0.22em] md:flex"
          >
            {NAV_ITEMS.map((item) => {
              const active = isActive(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "transition-colors hover:text-rust",
                    active ? "text-rust" : "text-ink-2",
                  )}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <button
            type="button"
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
            aria-controls="mobile-menu"
            onClick={() => setMenuOpen((o) => !o)}
            className="relative flex h-10 w-10 items-center justify-center md:hidden"
          >
            <span className="relative block h-4 w-6">
              <span
                className={cn(
                  "absolute inset-x-0 h-px bg-ink-2 transition-transform duration-200",
                  menuOpen ? "top-1/2 rotate-45" : "top-0",
                )}
              />
              <span
                className={cn(
                  "absolute inset-x-0 top-1/2 h-px bg-ink-2 transition-opacity duration-200",
                  menuOpen ? "opacity-0" : "opacity-100",
                )}
              />
              <span
                className={cn(
                  "absolute inset-x-0 h-px bg-ink-2 transition-transform duration-200",
                  menuOpen ? "top-1/2 -rotate-45" : "bottom-0",
                )}
              />
            </span>
          </button>
        </div>
      </header>

      <div
        id="mobile-menu"
        role="dialog"
        aria-modal={menuOpen}
        aria-hidden={!menuOpen}
        className={cn(
          "fixed inset-0 z-40 bg-paper transition-opacity duration-200 md:hidden",
          menuOpen
            ? "pointer-events-auto opacity-100"
            : "pointer-events-none opacity-0",
        )}
      >
        <nav
          aria-label="Mobile"
          className="flex h-full flex-col items-start justify-center gap-6 px-10"
        >
          {NAV_ITEMS.map((item) => {
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "font-serif text-4xl italic transition-colors",
                  active ? "text-rust" : "text-ink hover:text-rust",
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </>
  );
}
