import { AboutTeaser } from "@/components/home/AboutTeaser";
import { FeaturedStrip } from "@/components/home/FeaturedStrip";
import { Hero } from "@/components/home/Hero";
import { OriginQuestion } from "@/components/home/OriginQuestion";
import { ProcessTeaser } from "@/components/home/ProcessTeaser";
import { getFeaturedPool, getFeaturedScenes } from "@/lib/scenes";

export default function HomePage() {
  const featuredPool = getFeaturedPool();
  const strip = getFeaturedScenes(3);

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
