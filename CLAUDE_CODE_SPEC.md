# Orbital Artifacts — Website Build Spec

> This document is the authoritative spec for building `orbitalartifacts.shop`. It was authored by a planning session with the project owner (Anupa Kulathunga). Claude Code should treat it as source-of-truth for scope, stack, design direction, and content model.

---

## 1 · Project in one sentence

A studio-style website for **Orbital Artifacts** — Anupa's satellite-imagery art brand — that showcases the work as a curated archive, tells the origin story, and routes buyers to external marketplaces (Etsy, Redbubble, Teespring) rather than handling checkout itself.

---

## 2 · What this site is *not*

Explicit non-goals so Claude Code doesn't accidentally build them:

- ❌ Not a landing page with a single CTA funnel.
- ❌ Not an e-commerce site with cart, checkout, or payment processing.
- ❌ Not connected to Shopify, WooCommerce, Stripe, or any storefront backend.
- ❌ Not headless commerce. No product variants, inventory, or tax logic.

Checkout is handled entirely by Etsy (primary), Redbubble, Teespring, etc. Each scene page links out to whichever marketplaces carry it.

---

## 3 · Stack (locked)

| Layer | Choice | Reason |
|---|---|---|
| Framework | **Next.js 15+** (App Router) | Static-first, file-based routing, Vercel-native |
| Language | **TypeScript** | Strict mode on |
| Styling | **Tailwind CSS v4** | Utility-first; use `@theme` for design tokens |
| Content (scenes) | **Sanity v3** (free tier) | Nice editor UI for adding scenes without code |
| Content (static pages) | Inline in TSX | About/Process/Contact content is low-churn |
| Animation | **Motion** (formerly Framer Motion) | Used tastefully — see §8 |
| Image handling | Next `<Image>` + Sanity CDN | Sanity serves optimized images; Next handles loading |
| Deployment | **Vercel** | Connect to GitHub, auto-deploy on push |
| Domain | `orbitalartifacts.shop` (apex) | Already owned |
| Analytics | Vercel Analytics or Plausible (free tier) | Privacy-respecting |
| Fonts | Self-hosted Fraunces + Archivo + JetBrains Mono | Via `next/font/local` or `next/font/google` |

**Do not add:** a CMS other than Sanity, a styling system other than Tailwind, a state manager (there's no state), a component library (Radix UI primitives only if needed for dialog/tooltip accessibility).

---

## 4 · Design language

The site must match the **"Signal" brand identity** already established on the shop banners.

### Palette (use Tailwind custom tokens)

| Token | Hex | Role |
|---|---|---|
| `paper` | `#ebe5d6` | Primary background |
| `paper-2` | `#e8e3d8` | Slight depth / card bg |
| `ink` | `#0a0a0a` | Primary text |
| `ink-2` | `#2b2a26` | Secondary text |
| `muted` | `#5a5348` | Tertiary text, metadata |
| `rust` | `#c94f2a` | Single accent — use sparingly for italic emphasis |
| `sand` | `#c9a96e` | Decorative, borders |

Background is **warm paper (#ebe5d6) throughout** — homepage, archive, scene pages, about, process, contact. The user explicitly chose "match the Signal banner exactly" and did not want dark-mode scene pages.

### Typography

- **Fraunces** (italic 400, italic 500, regular 400) — headlines and serif quotes
- **Archivo** (500, 700) — UI elements, wordmarks, buttons
- **JetBrains Mono** (400, 500) — metadata, coordinates, eyebrow labels

Headline treatment used on banner:
> Earth data, **_reimagined as art._**

Black serif for main clause, **rust italic for the emphasis clause.** Reuse this pattern across headline hierarchy.

### Decorative elements (carried from banners)

- **Concentric "signal rings"** emanating from screen edges or centered on icon — use as background treatment, low opacity (5–8%)
- **Corner brackets** (`⌐ ¬ L ⌟`) as section frames — mirrors the corner brackets already in the print frame template
- **Monospace meta strips** at top/bottom of key sections (e.g. `◉ ORBITAL ARTIFACTS · ARCHIVE · N 07.87° · E 80.77°`)
- **Subtle film grain** via SVG `feTurbulence` overlay, blend-mode multiply, 25% opacity — matches the banner treatment

### Visual reference

The already-shipped files at `/assets/brand/` (to be uploaded by Anupa) will include:

- `OrbitalArtifacts_Banner_3360x840.png` — the primary banner; replicate this tonal/typographic system
- `OrbitalArtifacts_ShopIcon_500x500.png` — the mark
- `Dark_Virsion_Icon.png` — tight-cropped logo mark (use `icon_black_tight.png` equivalent as SVG)
- The logo is provided as PDF in `Frame_Template.psd` — extract as SVG for web use

If assets aren't in the repo yet, Claude Code should create tasteful placeholders and flag them in a README for the owner to replace.

---

## 5 · Routes

```
/                    Home
/archive             Archive index (filterable grid)
/archive/[slug]      Scene detail page (one per piece)
/process             How a satellite pass becomes a print
/about               Origin story
/press               Features / mentions (starts empty-state)
/contact             Commission / licensing / wholesale form
```

Plus standard extras:
- `/sitemap.xml` (auto-generated by Next)
- `/robots.txt`
- `/404` custom page
- Open Graph image generation per scene (via `@vercel/og` or Next.js OG image route)

---

## 6 · Page-by-page spec

### 6.1 · `/` Home

**Purpose:** 30-second brand introduction. Entry point into archive or story.

**Structure (top to bottom):**

1. **Hero** — full viewport. Left: headline ("Earth data, reimagined as art.") in Fraunces, rust italic emphasis on "reimagined as art." Right: one featured scene image (rotates from a curated pool of 5–6 scenes on each page load, or animates through them on a slow timer). Concentric rings emanate from right edge behind the image. Corner bracket top-left + coords bottom-right.
2. **Origin question** — full-width, centered, large Fraunces italic: *"What if the way satellites see our planet is itself a kind of art?"* — slow fade-in on scroll.
3. **Featured scenes strip** — 3 scenes in a row, metadata below each. Link to scene detail pages. "See all" link to `/archive`.
4. **Process teaser** — single large image (one of the SNAP processing steps) + short explainer + link to `/process`.
5. **About teaser** — short 2-sentence version of about + portrait (if Anupa provides one) + link to `/about`.
6. **Footer** — see §7.

### 6.2 · `/archive` Archive

**Purpose:** The catalogue. Every scene, filterable.

**Structure:**

- Page header: eyebrow `◉ ARCHIVE · [N scenes]`, title "Every scene.", short subheading.
- **Filter bar** (sticky on scroll):
  - Region: `All / Arctic / Desert / Delta / Coast / Mountain / Urban / Island`
  - Sensor: `All / Sentinel-2 / Landsat / ASTER / MODIS`
  - Treatment: `All / Natural / False-color / Infrared / Thermal`
  - Sort: `Newest / Oldest / Region A–Z`
- **Grid:** square tiles (3-col desktop, 2-col tablet, 1-col mobile). Each tile:
  - Scene image
  - Scene title below (Fraunces, 18px)
  - Monospace metadata line below title: `[REGION] · [SENSOR] · [COORDS]`
  - Hover: subtle scale (1.02) + rust border appears
- Clicking tile → `/archive/[slug]`.

Filters should work client-side (no server round-trip) since the full catalogue fits in a single JSON payload.

### 6.3 · `/archive/[slug]` Scene detail

**Purpose:** The "gallery label" for one piece. Deep content. Shareable URL.

**Structure (two-column desktop, stacked mobile):**

**Left column (60% width):**
- Full-resolution scene image, clickable for lightbox/zoom
- Below image: thin monospace strip showing acquisition metadata: `ACQUIRED YYYY-MM-DD · SENSOR · BAND COMBO · PROCESSING NOTES`

**Right column (40% width, sticky on scroll):**

```
◉ OA-0001

Delta Region
Netherlands

N 51.67° · E 4.32°
Sentinel-2 · Bands 8-4-3
Acquired 2024-07-12

[narrative paragraph — 2-3 sentences about the place,
its history, what you're looking at]

──────────────

Available as

[Marketplace buttons — each is a card with:
 · Marketplace logo
 · Product name (e.g. "Framed giclée 16×20")
 · Starting price
 · "View on Etsy →" link]
```

Marketplace list is defined per-scene in Sanity (see §9). Not every scene is on every marketplace.

**Bottom of page:**
- `← Back to archive` link
- "Next scene →" / "← Previous scene" navigation (within current filter context if possible, otherwise chronological)

### 6.4 · `/process` Process

**Purpose:** Positions Anupa as craftsman. Educates buyers. Ranks in Google for long-tail searches.

**Structure:**

- Hero: eyebrow `◉ PROCESS`, headline "From a satellite pass to a print."
- Long-form, scrollable article format. Use MDX so Anupa can write this as long-form prose without touching components.
- Sections (editorial, image + text alternating):
  1. "The data is public" — what Sentinel/Landsat are, why the data is free, attribution
  2. "Choosing a scene" — how locations get selected
  3. "False-color" — the science of looking at Earth in wavelengths we can't see (include visual showing same scene in 3 band combos)
  4. "Composition" — SNAP workflow at a high level (no jargon)
  5. "The frame" — how metadata becomes part of the art
  6. "The print" — fulfillment, materials, where to buy
- Closing CTA: "See the archive →"

Content is MDX in `/content/process.mdx` for now — since this is a single page with slow content evolution, keeping it out of Sanity is fine.

### 6.5 · `/about` About

**Purpose:** The human behind the work.

**Structure:**

- Portrait (if provided) or the OA mark as placeholder
- Long-form text: origin question + bio. Uses the full Pinterest bio as starting copy but can expand to 400–600 words.
- "Elsewhere" section: social links with proper icons (IG, TikTok, Pinterest) + marketplace links.
- Content model: MDX in `/content/about.mdx`.

### 6.6 · `/press` Press

**Purpose:** Social proof accumulator. Starts empty.

**Structure:**

- If `pressEntries.length === 0`: show graceful empty state — Fraunces italic: *"Nothing yet. If you'd like to feature Orbital Artifacts, get in touch →"* linking to `/contact`.
- Otherwise: list of press entries, reverse chronological. Each entry = publication name, date, article title (linked), optional 1-sentence quote.
- Content model: Sanity schema `pressEntry` with fields: `publication`, `date`, `title`, `url`, `quote (optional)`, `logo (optional)`.

### 6.7 · `/contact` Contact

**Purpose:** Capture leads for commissions, licensing, wholesale.

**Structure:**

- Eyebrow + headline: "Get in touch"
- Short intro copy
- Form with fields: name, email, **type** (dropdown: `Commission / Licensing / Wholesale / Press / Other`), message
- Form submission: use **Resend** (free tier) or **Web3Forms** (free, no account) — don't build a backend for this. Claude Code should use Web3Forms by default unless Resend account is provided.
- Success state: inline confirmation, no redirect
- Below form: direct email link `hello@orbitalartifacts.shop` as fallback

---

## 7 · Shared components

### 7.1 · Header (sticky)

- Logo mark (SVG) + "ORBITAL ARTIFACTS" wordmark on the left
- Nav links on the right: Archive · Process · About · Press · Contact
- On scroll: paper background shifts to slightly more opaque, 1px sand-colored bottom border appears
- Mobile: hamburger → full-screen overlay menu

### 7.2 · Footer

Three columns on desktop, stacked on mobile:

**Column 1 — Brand block**
```
◉ ORBITAL ARTIFACTS
Earth data, reimagined as art.
By Anupa Kulathunga · Sri Lanka
```

**Column 2 — Sitemap**
Archive · Process · About · Press · Contact

**Column 3 — Buy**
Etsy · Redbubble · Teespring · (Amazon, etc. as added)

**Column 4 — Follow**
Instagram · TikTok · Pinterest

**Bottom bar:**
```
© 2026 Orbital Artifacts · All satellite data used under open-access licenses (Copernicus, USGS).
```

### 7.3 · `SignalRings` component

Reusable background flourish. Props: `position ('left' | 'right' | 'center')`, `count (3-5)`, `opacity (0-1)`. Renders as SVG with concentric circles.

### 7.4 · `MetaStrip` component

The monospace dashboard-style metadata bar. Props: `items: string[]`, `align: 'left' | 'center' | 'right'`.

### 7.5 · `SceneCard` component

Used in archive grid and home featured strip. Props: the `Scene` type (see §9).

### 7.6 · `MarketplaceLink` component

Used on scene pages. Props: `platform`, `url`, `productType`, `price`.

---

## 8 · Motion

Tasteful reveals, not flashy. Use the `motion` library.

**Approved motion patterns:**

- Fade-up on scroll (sections appearing as user scrolls, 0.4s, ease-out, once per section)
- Hero headline: staggered character reveal on mount (0.8s total)
- Scene card hover: scale 1 → 1.02, 150ms
- Archive filter selection: layout animation on grid (Motion's `layout` prop does this for free)
- Page transitions: 200ms fade between routes

**Forbidden:**

- Parallax scrolling
- Cursor followers
- Anything that blocks content reading
- Auto-rotating carousels (use subtle cross-fades instead)
- Snap scrolling
- Intro animations that gate content reveal on the homepage

Animations should never exceed 500ms. Respect `prefers-reduced-motion` media query — disable all non-essential motion when user has it enabled.

---

## 9 · Content model (Sanity)

Set up Sanity Studio as a sibling folder in the repo: `/studio`.

### `scene` (main type)

| Field | Type | Notes |
|---|---|---|
| `title` | string | e.g. "Delta Region" |
| `slug` | slug | auto-from-title, manually editable |
| `subtitle` | string | e.g. "Netherlands" |
| `catalogueNumber` | string | e.g. "OA-0001" |
| `coords` | object `{ lat: number, lng: number, formatted: string }` | `formatted` is the display string, e.g. "N 51.67° · E 4.32°" |
| `region` | string, from list | Arctic / Desert / Delta / Coast / Mountain / Urban / Island |
| `sensor` | string, from list | Sentinel-2 / Landsat 9 / Landsat 8 / ASTER / MODIS / Other |
| `bandCombo` | string | e.g. "Bands 8-4-3" |
| `treatment` | string, from list | Natural / False-color / Infrared / Thermal |
| `acquisitionDate` | date | YYYY-MM-DD |
| `processingNotes` | string, optional | Short technical note |
| `narrative` | rich text | 2-3 sentences about the place, history, significance |
| `hero` | image | Main display image (Sanity CDN handles scaling) |
| `variations` | array of images, optional | Alternate color treatments |
| `availability` | array of `marketplaceLink` objects | see below |
| `featured` | boolean | Show on homepage rotation? |
| `publishedAt` | datetime | For sorting |

### `marketplaceLink` (embedded)

| Field | Type | Notes |
|---|---|---|
| `platform` | string, from list | Etsy / Redbubble / Teespring / Society6 / Amazon / Other |
| `url` | url | Direct link to the listing |
| `productType` | string | e.g. "Framed giclée 16×20" |
| `startingPrice` | number | USD |

### `pressEntry`

| Field | Type | Notes |
|---|---|---|
| `publication` | string | |
| `date` | date | |
| `title` | string | |
| `url` | url | |
| `quote` | string, optional | |
| `logo` | image, optional | |

### `siteSettings` (singleton)

| Field | Type | Notes |
|---|---|---|
| `tagline` | string | Default "Earth data, reimagined as art." |
| `socialLinks` | array of `{ platform, url }` | IG, TikTok, Pinterest |
| `marketplaceLinks` | array of `{ platform, url }` | Shop-level, not scene-level |
| `contactEmail` | string | |
| `origin question` | rich text | Used on homepage |

---

## 10 · SEO + metadata

- Every page has proper `<title>` and `<meta description>`.
- Scene pages generate Open Graph images via `@vercel/og` or Next's built-in `opengraph-image.tsx` convention — OG image = scene hero with brand overlay (wordmark + coords), 1200×630.
- Sitemap auto-generated including all scene slugs.
- JSON-LD structured data on scene pages: `VisualArtwork` schema with `creator`, `dateCreated`, `contentLocation` (from coords).
- `robots.txt`: allow all, reference sitemap.

---

## 11 · Performance budget

- Lighthouse targets: Performance ≥ 95, Accessibility ≥ 95, Best Practices ≥ 95, SEO = 100
- Total JS bundle on any page: < 150 KB gzipped
- LCP < 2.0s on 4G
- Scene images: never serve larger than 2× display size; use Sanity's `?w=` params
- Fonts: preload, `font-display: swap`, subset to Latin

---

## 12 · Folder structure

```
orbitalartifacts/
├── app/
│   ├── (site)/
│   │   ├── layout.tsx                  # shared header+footer
│   │   ├── page.tsx                    # /
│   │   ├── archive/
│   │   │   ├── page.tsx                # /archive (client-filtered grid)
│   │   │   └── [slug]/
│   │   │       ├── page.tsx            # /archive/[slug]
│   │   │       └── opengraph-image.tsx # per-scene OG
│   │   ├── process/page.tsx
│   │   ├── about/page.tsx
│   │   ├── press/page.tsx
│   │   └── contact/page.tsx
│   ├── globals.css                     # Tailwind directives + @theme tokens
│   ├── layout.tsx                      # root <html>, fonts
│   └── not-found.tsx
├── components/
│   ├── brand/
│   │   ├── Logo.tsx                    # SVG of the OA mark
│   │   ├── SignalRings.tsx
│   │   └── MetaStrip.tsx
│   ├── layout/
│   │   ├── Header.tsx
│   │   └── Footer.tsx
│   ├── scene/
│   │   ├── SceneCard.tsx
│   │   ├── SceneGrid.tsx
│   │   ├── FilterBar.tsx
│   │   └── MarketplaceLink.tsx
│   └── ui/                             # primitives if needed
├── content/
│   ├── process.mdx
│   └── about.mdx
├── lib/
│   ├── sanity/
│   │   ├── client.ts
│   │   ├── queries.ts
│   │   └── types.ts                    # generated from schema
│   └── utils.ts
├── public/
│   ├── brand/                          # banners, icon PNGs
│   ├── og/                             # fallback OG image
│   └── fonts/                          # self-hosted woff2s
├── studio/                             # Sanity Studio
│   ├── sanity.config.ts
│   └── schemas/
│       ├── scene.ts
│       ├── pressEntry.ts
│       └── siteSettings.ts
├── next.config.ts
├── tailwind.config.ts
├── tsconfig.json
├── package.json
└── README.md
```

---

## 13 · Env vars

```
# Sanity
NEXT_PUBLIC_SANITY_PROJECT_ID=
NEXT_PUBLIC_SANITY_DATASET=production
SANITY_API_TOKEN=                        # for writes if needed

# Contact form (Web3Forms default, Resend optional)
WEB3FORMS_ACCESS_KEY=
# or
RESEND_API_KEY=

# Analytics (optional)
NEXT_PUBLIC_PLAUSIBLE_DOMAIN=orbitalartifacts.shop
```

---

## 14 · Build order (Claude Code can follow this)

1. Scaffold Next.js + Tailwind + TypeScript
2. Set up fonts (local woff2 files), paper-color theme tokens, shared layout/header/footer
3. Build homepage with static placeholder scene data (not yet wired to Sanity)
4. Build archive + scene detail pages using the same static data
5. Set up Sanity Studio with the schemas from §9
6. Replace static data with Sanity queries
7. Build About, Process, Contact, Press pages
8. Add Motion for reveals + filter animations
9. Add OG image generation for scene pages
10. SEO metadata, sitemap, robots, JSON-LD
11. Lighthouse pass, fix regressions
12. README with deploy-to-Vercel instructions for Anupa

---

## 15 · Seed data

For launch, use these 8 scenes (from the planning session). Claude Code should pre-populate them as Sanity documents, using placeholder images until Anupa provides finals.

| # | Title | Subtitle | Region | Sensor | Coords |
|---|---|---|---|---|---|
| OA-0001 | Lena Delta | Russia | Delta | Sentinel-2 | 72.5°N, 126°E |
| OA-0002 | Richat Structure | Mauritania | Desert | Landsat 9 | 21.1°N, 11.4°W |
| OA-0003 | Okavango | Botswana | Delta | Sentinel-2 | 19.3°S, 22.9°E |
| OA-0004 | Lake Natron | Tanzania | Desert | Sentinel-2 | 2.4°S, 36.0°E |
| OA-0005 | Skeleton Coast | Namibia | Coast | Sentinel-2 | 24.0°S, 14.5°E |
| OA-0006 | Great Salt Lake | Utah, USA | Desert | Sentinel-2 | 41.1°N, 112.6°W |
| OA-0007 | Svalbard Fjords | Norway | Arctic | Sentinel-2 | 78.5°N, 16.0°E |
| OA-0008 | Mahaweli Delta | Sri Lanka | Delta | Sentinel-2 | 8.5°N, 81.2°E |

Narratives can start as `Lorem ipsum —` with a `// TODO: Anupa will write` comment. Marketplace links empty until Anupa provides Etsy listings.

---

## 16 · What to ask Anupa if blocked

If any of these are missing when Claude Code reaches that step, flag rather than guess:

- Brand asset files (banners, icon PNGs, logo SVG)
- A Sanity project ID (Anupa will need to create one at sanity.io)
- Web3Forms access key OR Resend API key + verified domain
- Social handles (IG, TikTok, Pinterest) for footer links
- Etsy shop URL for marketplace links
- A portrait photo (optional — for /about page)

For anything else, make a reasonable default, leave a `// TODO(owner):` comment, and note it in the README.

---

## 17 · Out of scope for v1

Good things to *not* build now:

- Newsletter signup (add in v2 once there's a reason to email)
- Blog / journal (the /process page covers this need for now)
- Search (archive is < 50 items, filters are enough)
- User accounts / wishlists
- Dark mode
- Multi-language (English only)
- A cart of any kind

---

*End of spec. Claude Code: treat §3, §4, §5, §9 as non-negotiable. §6, §7, §8 are strongly preferred but can be refined with reasonable judgment. Flag anything that requires inventing content Anupa hasn't provided.*
