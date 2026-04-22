import Link from "next/link";
import { Logo } from "@/components/brand/Logo";
import { siteConfig, type SiteLink } from "@/lib/siteConfig";

const SITE_LINKS = [
  { href: "/archive", label: "Archive" },
  { href: "/process", label: "Process" },
  { href: "/about", label: "About" },
  { href: "/press", label: "Press" },
  { href: "/contact", label: "Contact" },
] as const;

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-sand/30 bg-paper-2">
      <div className="mx-auto grid max-w-6xl gap-10 px-6 py-16 md:grid-cols-4">
        <div className="md:col-span-1">
          <Logo variant="lockup" markSize={48} href="/" />
          <p className="mt-5 font-serif italic text-ink-2">
            {siteConfig.tagline}
          </p>
          <p className="mt-2 font-sans text-sm text-muted">
            {siteConfig.byline}
          </p>
        </div>

        <FooterColumn title="Sitemap">
          {SITE_LINKS.map((item) => (
            <FooterItem key={item.href}>
              <Link
                href={item.href}
                className="font-sans text-sm text-ink-2 transition-colors hover:text-rust"
              >
                {item.label}
              </Link>
            </FooterItem>
          ))}
        </FooterColumn>

        <FooterColumn title="Buy">
          {siteConfig.marketplaceLinks.map((m) => (
            <FooterItem key={m.platform}>
              <ExternalLink link={m}>{m.platform}</ExternalLink>
            </FooterItem>
          ))}
        </FooterColumn>

        <FooterColumn title="Follow">
          {siteConfig.socialLinks.map((s) => (
            <FooterItem key={s.platform}>
              <ExternalLink link={s}>{s.platform}</ExternalLink>
            </FooterItem>
          ))}
        </FooterColumn>
      </div>

      <div className="border-t border-sand/30">
        <p className="mx-auto max-w-6xl px-6 py-6 font-mono text-[11px] uppercase tracking-[0.22em] text-muted">
          © {year} Orbital Artifacts · All satellite data used under
          open-access licenses (Copernicus · USGS)
        </p>
      </div>
    </footer>
  );
}

function FooterColumn({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <p className="font-mono text-[11px] uppercase tracking-[0.25em] text-muted">
        {title}
      </p>
      <ul className="mt-4 flex flex-col gap-2.5">{children}</ul>
    </div>
  );
}

function FooterItem({ children }: { children: React.ReactNode }) {
  return <li>{children}</li>;
}

/**
 * External link for marketplaces / socials. When the URL is still `#`
 * (owner hasn't supplied it yet), we render as a disabled-looking span so
 * the footer layout still reads correctly without a dead link.
 */
function ExternalLink({
  link,
  children,
}: {
  link: SiteLink;
  children: React.ReactNode;
}) {
  const placeholder = !link.url || link.url === "#";
  if (placeholder) {
    return (
      <span
        className="font-sans text-sm text-muted/60"
        title="Coming soon"
        aria-disabled="true"
      >
        {children}
      </span>
    );
  }
  return (
    <a
      href={link.url}
      target="_blank"
      rel="noopener noreferrer"
      className="font-sans text-sm text-ink-2 transition-colors hover:text-rust"
    >
      {children}
    </a>
  );
}
