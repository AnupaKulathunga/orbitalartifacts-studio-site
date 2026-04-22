/**
 * Embedded Sanity Studio, mounted at /studio.
 *
 * The Studio is a client-only React tree. It owns its own routing via
 * `tool` catch-all segments, so no logic lives here — the NextStudio
 * component hands off to Sanity's router.
 */
import { NextStudio } from "next-sanity/studio";
import config from "../../../sanity.config";

export const dynamic = "force-static";
export { metadata, viewport } from "next-sanity/studio";

export default function StudioPage() {
  return <NextStudio config={config} />;
}
