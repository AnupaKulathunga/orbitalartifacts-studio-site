import { createClient } from "next-sanity";
import { apiVersion, dataset, projectId, writeToken } from "../env";

/**
 * Write-capable Sanity client — only use from server-side scripts.
 * Pulls `SANITY_API_TOKEN` from the environment; throws if missing so
 * seeders fail loud rather than silently writing to the wrong dataset.
 */
export function getWriteClient() {
  if (!writeToken) {
    throw new Error(
      "SANITY_API_TOKEN is not set. Create a write token at sanity.io/manage → API → Tokens, add it to .env.local, and re-run.",
    );
  }
  return createClient({
    projectId,
    dataset,
    apiVersion,
    token: writeToken,
    useCdn: false,
  });
}
