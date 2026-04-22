type FilmGrainProps = {
  /** Overall opacity. Spec §4: 25%. */
  opacity?: number;
  /** feTurbulence base frequency. Lower = larger grain; higher = finer grain. */
  frequency?: number;
};

/**
 * Subtle film grain overlay — matches the printed banner's paper texture.
 *
 * Fixed full-viewport, non-interactive, multiply-blended so dark specks
 * darken the paper while light areas have no effect. The filter runs on
 * the GPU so this is effectively free.
 */
export function FilmGrain({ opacity = 0.25, frequency = 0.9 }: FilmGrainProps) {
  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 z-[60]"
      style={{ mixBlendMode: "multiply", opacity }}
    >
      <svg
        className="h-full w-full"
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="none"
      >
        <filter id="oa-grain">
          <feTurbulence
            type="fractalNoise"
            baseFrequency={frequency}
            numOctaves={2}
            stitchTiles="stitch"
          />
          <feColorMatrix type="saturate" values="0" />
        </filter>
        <rect width="100%" height="100%" filter="url(#oa-grain)" />
      </svg>
    </div>
  );
}
