import type { SchemaTypeDefinition } from "sanity";
import { coords } from "./objects/coords";
import { marketplaceLink } from "./objects/marketplaceLink";
import { pressEntry } from "./pressEntry";
import { scene } from "./scene";
import { siteSettings } from "./siteSettings";

export const schemaTypes: SchemaTypeDefinition[] = [
  // embedded objects
  coords,
  marketplaceLink,
  // documents
  scene,
  pressEntry,
  siteSettings,
];
