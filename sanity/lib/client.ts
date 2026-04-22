import { createClient } from "next-sanity";
import { apiVersion, dataset, projectId } from "../env";

/**
 * Read-only Sanity client used by server components. `useCdn: true` routes
 * through Sanity's CDN for faster, cached reads on the public dataset.
 * Write operations should use `writeClient` (below), never this one.
 */
export const client = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn: true,
  perspective: "published",
});
