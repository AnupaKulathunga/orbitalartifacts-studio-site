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

  const payload = {
    "@context": "https://schema.org",
    "@type": "VisualArtwork",
    name: scene.title,
    alternateName: scene.catalogueNumber,
    headline: `${scene.title} — ${scene.subtitle}`,
    description:
      scene.narrative && scene.narrative.length > 20
        ? scene.narrative
        : `${scene.title}, ${scene.subtitle}. ${scene.sensor} · ${scene.bandCombo} · ${scene.treatment} treatment.`,
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
    ].join(", "),
    contentLocation: {
      "@type": "Place",
      name: scene.subtitle,
      geo: {
        "@type": "GeoCoordinates",
        latitude: scene.coords.lat,
        longitude: scene.coords.lng,
      },
    },
  };

  return (
    <script
      type="application/ld+json"
      // JSON.stringify escapes what matters; Next injects this server-side.
      dangerouslySetInnerHTML={{ __html: JSON.stringify(payload) }}
    />
  );
}
