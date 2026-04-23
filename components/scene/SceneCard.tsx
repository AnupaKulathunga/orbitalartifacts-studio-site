import Link from "next/link";
import { MetaStrip } from "@/components/brand/MetaStrip";
import { SceneThumbnail } from "@/components/scene/SceneThumbnail";
import type { Scene } from "@/lib/scenes";
import { cn } from "@/lib/utils";

type SceneCardProps = {
  scene: Scene;
  priority?: boolean;
  className?: string;
  /** Heading level for the tile title — defaults to h3 for nesting under
   *  a section h2 (e.g. the homepage featured strip). Archive passes "h2"
   *  so the document outline stays in order beneath its h1. */
  titleAs?: "h2" | "h3";
};

/**
 * The catalogue-tile representation of a scene — used on the archive grid
 * and the home-page featured strip. Hover scales the image by 1.02 and
 * reveals a rust inset border per §6.2.
 */
export function SceneCard({
  scene,
  priority,
  className,
  titleAs: TitleTag = "h3",
}: SceneCardProps) {
  return (
    <Link
      href={`/archive/${scene.slug}`}
      aria-label={`${scene.title}, ${scene.subtitle}`}
      className={cn("group block", className)}
    >
      <div className="relative aspect-square w-full overflow-hidden bg-paper-2">
        <div className="absolute inset-0 transition-transform duration-150 ease-out group-hover:scale-[1.02]">
          <SceneThumbnail scene={scene} priority={priority} />
        </div>
        <div
          aria-hidden
          className="absolute inset-0 border border-transparent transition-colors duration-150 group-hover:border-rust"
        />
      </div>

      <div className="mt-4 flex items-start justify-between gap-4">
        <div>
          <TitleTag className="font-serif text-[19px] leading-tight text-ink">
            {scene.title}
          </TitleTag>
          <p className="mt-0.5 font-sans text-xs text-muted">
            {scene.subtitle}
          </p>
        </div>
        <span className="mt-1 font-mono text-[10px] uppercase tracking-[0.22em] text-muted">
          {scene.catalogueNumber}
        </span>
      </div>

      <MetaStrip
        className="mt-2.5"
        marker={false}
        items={[scene.region, scene.sensor, scene.coords.formatted]}
      />
    </Link>
  );
}
