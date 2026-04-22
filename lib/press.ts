import { client } from "@/sanity/lib/client";
import { PRESS_ENTRIES_QUERY } from "@/sanity/queries";

export type PressEntry = {
  _id: string;
  publication: string;
  date: string; // YYYY-MM-DD
  title: string;
  url: string;
  quote?: string;
  logoUrl?: string;
};

export async function getPressEntries(): Promise<ReadonlyArray<PressEntry>> {
  return client.fetch<PressEntry[]>(PRESS_ENTRIES_QUERY);
}
