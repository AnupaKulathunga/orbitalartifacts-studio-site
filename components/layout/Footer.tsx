import Link from "next/link";
import { Logo } from "@/components/brand/Logo";
import { getSiteSettings, type SiteLink } from "@/lib/siteConfig";

const SITE_LINKS = [
  { href: "/archive", label: "Archive" },
  { href: "/process", label: "Process" },
  { href: "/about", label: "About" },
  { href: "/press", label: "Press" },
  { href: "/contact", label: "Contact" },
] as const;

export async function Footer() {
  const settings = await getSiteSettings();
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-sand/30 bg-paper-2">
      <div className="mx-auto grid max-w-6xl gap-10 px-6 py-16 md:grid-cols-4">
        <div className="md:col-span-1">
          <Logo variant="lockup" markSize={48} href="/" />
          <p className="mt-5 font-serif italic text-ink-2">
            {settings.tagline}
          </p>
          <p className="mt-2 font-sans text-sm text-muted">
            {settings.byline}
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
          {settings.marketplaceLinks.length === 0 ? (
            <FooterItem>
              <span
                className="font-sans text-sm text-muted/60"
                title="Coming soon"
              >
                Coming soon
              </span>
            </FooterItem>
          ) : (
            settings.marketplaceLinks.map((m) => (
              <FooterItem key={m.platform}>
                <ExternalLink link={m}>{m.platform}</ExternalLink>
              </FooterItem>
            ))
          )}
        </FooterColumn>

        <FooterColumn title="Follow">
          {settings.socialLinks.length === 0 ? (
            <FooterItem>
              <span
                className="font-sans text-sm text-muted/60"
                title="Coming soon"
              >
                Coming soon
              </span>
            </FooterItem>
          ) : (
            settings.socialLinks.map((s) => (
              <FooterItem key={s.platform}>
                <ExternalLink link={s}>{s.platform}</ExternalLink>
              </FooterItem>
            ))
          )}
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

function ExternalLink({
  link,
  children,
}: {
  link: SiteLink;
  children: React.ReactNode;
}) {
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
