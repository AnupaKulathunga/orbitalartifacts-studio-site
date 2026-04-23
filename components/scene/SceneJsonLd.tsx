import type { Scene } from "@/lib/scenes";
import { SITE_URL } from "@/lib/site";

type SceneJsonLdProps = {
  scene: Scene;
};

/**
 * Schema.org VisualArtwork structured data for scene detail pages —
 * spec §10. Tells Google (and IG/LinkedIn scrapers) that each scene is
 * an artwork with a creator, creation date, content location, and image,
 * so rich result eligibility kicks in.
 *
 * Emitted as a plain <script type="application/ld+json"> — Next supports
 * this inline in Server Components.
 */
export function SceneJsonLd({ scene }: SceneJsonLdProps) {
  const url = `${SITE_URL}/archive/${scene.slug}`;

  const headlineTail = scene.subtitle ? ` — ${scene.subtitle}` : "";
  const payload: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "VisualArtwork",
    name: scene.title,
    alternateName: scene.catalogueNumber,
    headline: `${scene.title}${headlineTail}`,
    description:
      scene.narrative && scene.narrative.length > 20
        ? scene.narrative
        : `${scene.title}${headlineTail}.`,
    url,
    image: scene.imageUrl ? [scene.imageUrl] : undefined,
    dateCreated: scene.acquisitionDate,
    datePublished: scene.publishedAt,
    creator: {
      "@type": "Person",
      name: "Anupa Kulathunga",
      url: `${SITE_URL}/about`,
    },
    copyrightHolder: {
      "@type": "Organization",
      name: "Orbital Artifacts",
      url: SITE_URL,
    },
    artform: "Digital print",
    artMedium: "Pigment inkjet on archival cotton paper",
    artworkSurface: "Archival matte cotton paper, 320gsm",
    keywords: [
      "satellite imagery",
      "earth observation",
      scene.region,
      scene.sensor,
      scene.treatment,
    ]
      .filter(Boolean)
      .join(", "),
  };
  if (scene.coords) {
    payload.contentLocation = {
      "@type": "Place",
      name: scene.subtitle,
      geo: {
        "@type": "GeoCoordinates",
        latitude: scene.coords.lat,
        longitude: scene.coords.lng,
      },
    };
  }

  return (
    <script
      type="application/ld+json"
      // JSON.stringify escapes what matters; Next injects this server-side.
      dangerouslySetInnerHTML={{ __html: JSON.stringify(payload) }}
    />
  );
}
