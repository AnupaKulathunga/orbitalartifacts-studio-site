import { AboutTeaser } from "@/components/home/AboutTeaser";
import { FeaturedStrip } from "@/components/home/FeaturedStrip";
import { Hero } from "@/components/home/Hero";
import { OriginQuestion } from "@/components/home/OriginQuestion";
import { ProcessTeaser } from "@/components/home/ProcessTeaser";
import { getFeaturedPool, getFeaturedScenes } from "@/lib/scenes";

export const revalidate = 60;

export default async function HomePage() {
  const [featuredPool, strip] = await Promise.all([
    getFeaturedPool(),
    getFeaturedScenes(3),
  ]);

  return (
    <>
      <Hero scenes={featuredPool} />
      <OriginQuestion />
      <FeaturedStrip scenes={strip} />
      <ProcessTeaser />
      <AboutTeaser />
    </>
  );
}
