import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { FilmGrain } from "@/components/brand/FilmGrain";
import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";

export default function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col bg-paper text-ink">
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
      <FilmGrain />
      {/* Vercel Analytics + Speed Insights — scoped to the public site only
          (not /studio) so admin traffic doesn't skew the metrics. */}
      <Analytics />
      <SpeedInsights />
    </div>
  );
}
