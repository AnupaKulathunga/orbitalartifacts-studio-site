/**
 * Font loader for OG image generation. @vercel/og requires TTF/OTF
 * (it can't ingest WOFF2), so we pull TTFs from jsdelivr's fontsource
 * CDN, which publishes Google Fonts as static TTF files.
 *
 * Results are memoized in-process so repeated OG requests don't refetch.
 */

type FontSpec = {
  name: string;
  /** jsdelivr fontsource slug, e.g. "fraunces". */
  slug: string;
  weight: 400 | 500 | 700;
  style: "normal" | "italic";
};

const FONTS: ReadonlyArray<FontSpec> = [
  { name: "Fraunces", slug: "fraunces", weight: 500, style: "normal" },
  { name: "Fraunces", slug: "fraunces", weight: 500, style: "italic" },
  {
    name: "JetBrainsMono",
    slug: "jetbrains-mono",
    weight: 500,
    style: "normal",
  },
];

type LoadedFont = {
  name: string;
  data: ArrayBuffer;
  weight: 400 | 500 | 700;
  style: "normal" | "italic";
};

let cache: Promise<LoadedFont[]> | null = null;

async function fetchFont({
  name,
  slug,
  weight,
  style,
}: FontSpec): Promise<LoadedFont> {
  const url = `https://cdn.jsdelivr.net/fontsource/fonts/${slug}@latest/latin-${weight}-${style}.ttf`;
  const res = await fetch(url);
  if (!res.ok)
    throw new Error(
      `Failed to fetch ${slug} ${weight} ${style}: ${res.status}`,
    );
  const data = await res.arrayBuffer();
  return { name, data, weight, style };
}

export async function loadOgFonts(): Promise<LoadedFont[]> {
  if (!cache) {
    cache = Promise.all(FONTS.map(fetchFont)).catch((err) => {
      cache = null;
      throw err;
    });
  }
  return cache;
}
