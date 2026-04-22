import Image from "next/image";
import type { Region, Scene } from "@/lib/scenes";
import { cn } from "@/lib/utils";

type SceneThumbnailProps = {
  scene: Scene;
  className?: string;
  priority?: boolean;
  /** Tells Next the display sizes for srcset when a real image is used. */
  sizes?: string;
};

/**
 * 3-stop gradient palettes keyed by region — tasteful stand-ins that evoke
 * the terrain type without pretending to be actual satellite imagery. Each
 * palette is warm-biased so tiles sit on the paper bg without jumping out.
 */
const REGION_PALETTES: Record<Region, [string, string, string]> = {
  Arctic: ["#dfe7ea", "#a8bec8", "#526d78"],
  Desert: ["#e8c9a0", "#c98f5a", "#7a3f24"],
  Delta: ["#9fbf95", "#4a8260", "#1f3d35"],
  Coast: ["#d8c98e", "#8bb0b4", "#3f6673"],
  Mountain: ["#b09a80", "#6b5a47", "#2e2418"],
  Urban: ["#b0ada6", "#5f5e59", "#2b2a26"],
  Island: ["#cdd8a8", "#5a8b72", "#2a4a3d"],
};

/**
 * Deterministic seed derived from the catalogue number so the same scene
 * renders the same noise pattern on every load.
 */
function hashSeed(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return Math.abs(h) % 100;
}

/**
 * Renders the scene's hero image if one is supplied, otherwise paints a
 * procedural gradient + noise tile keyed by the scene's region. The
 * procedural version is deterministic per catalogue number so reloading a
 * page never jiggles the art.
 *
 * TODO(M6): once Sanity is wired, `scene.imageUrl` will be set for every
 * scene and the procedural fallback only triggers for in-flight drafts.
 */
export function SceneThumbnail({
  scene,
  className,
  priority,
  sizes = "(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw",
}: SceneThumbnailProps) {
  if (scene.imageUrl) {
    return (
      <Image
        src={scene.imageUrl}
        alt={`${scene.title}, ${scene.subtitle} — ${scene.sensor} ${scene.treatment.toLowerCase()}`}
        fill
        sizes={sizes}
        priority={priority}
        className={cn("object-cover", className)}
      />
    );
  }

  const [c1, c2, c3] = REGION_PALETTES[scene.region];
  const id = `tile-${scene.catalogueNumber.toLowerCase()}`;
  const seed = hashSeed(scene.catalogueNumber);
  // Delta / coast regions get finer noise to suggest water patterns;
  // desert / mountain get coarser noise to suggest dune / ridgelines.
  const frequency =
    scene.region === "Delta" || scene.region === "Coast"
      ? 1.4
      : scene.region === "Desert" || scene.region === "Mountain"
        ? 0.6
        : 0.9;

  return (
    <svg
      viewBox="0 0 100 100"
      preserveAspectRatio="xMidYMid slice"
      className={cn("absolute inset-0 h-full w-full", className)}
      aria-label={`${scene.title} — placeholder`}
      role="img"
    >
      <defs>
        <linearGradient id={`${id}-grad`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor={c1} />
          <stop offset="0.55" stopColor={c2} />
          <stop offset="1" stopColor={c3} />
        </linearGradient>
        <filter id={`${id}-noise`}>
          <feTurbulence
            type="fractalNoise"
            baseFrequency={frequency}
            numOctaves={3}
            seed={seed}
          />
          <feColorMatrix type="saturate" values="0.4" />
          <feComponentTransfer>
            <feFuncA type="linear" slope="0.45" />
          </feComponentTransfer>
        </filter>
      </defs>
      <rect width="100" height="100" fill={`url(#${id}-grad)`} />
      <rect
        width="100"
        height="100"
        filter={`url(#${id}-noise)`}
        style={{ mixBlendMode: "overlay" }}
      />
    </svg>
  );
}
