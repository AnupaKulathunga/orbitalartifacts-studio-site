# Orbital Artifacts

Studio site for **Orbital Artifacts** — Anupa Kulathunga's satellite-imagery art brand. Curated archive + origin story; all checkout is routed out to Etsy / Redbubble / Teespring (no cart, no Stripe, no Shopify).

Spec-of-record: [`CLAUDE_CODE_SPEC.md`](./CLAUDE_CODE_SPEC.md).

---

## Stack

- **Next.js 15** (App Router) · **TypeScript** (strict) · **React 19**
- **Tailwind CSS v4** — design tokens live in `app/globals.css` via `@theme`
- **Sanity v4** for scenes / press / site settings (embedded Studio at `/studio`)
- **MDX** for `/process` long-form copy (`content/process.mdx`)
- **Motion** for scroll reveals + archive grid layout animations
- **Web3Forms** for the contact form (free tier, client-side submit)
- **next/og** for per-scene OpenGraph images (fonts from fontsource CDN)
- Deploys on **Vercel**

---

## Local setup

```bash
npm install
cp .env.local.example .env.local   # fill in keys (see next section)
npm run dev                        # http://localhost:3000
```

### Environment variables

Create `.env.local` from `.env.local.example`. Three that matter:

| Variable | Required | Where to get it |
|---|---|---|
| `NEXT_PUBLIC_SANITY_PROJECT_ID` | yes | [sanity.io/manage](https://www.sanity.io/manage) → create project, copy ID |
| `NEXT_PUBLIC_SANITY_DATASET` | yes | Default `production` — leave as-is unless you know why |
| `SANITY_API_TOKEN` | only for `npm run seed:sanity` | sanity.io/manage → API → Tokens (Editor role) |
| `NEXT_PUBLIC_WEB3FORMS_ACCESS_KEY` | for the contact form | [web3forms.com](https://web3forms.com) — paste your email, copy the key. The NEXT_PUBLIC_ prefix is intentional: Web3Forms' free tier requires a browser-side submit, and the key is an account identifier, not a secret |
| `NEXT_PUBLIC_SITE_URL` | only for non-production | Overrides the sitemap / robots / JSON-LD canonical URL (defaults to `https://orbitalartifacts.shop`) |

### First-time Sanity setup

1. Visit `/studio` in the dev server and log in (Google or GitHub) — this registers your user with the project.
2. At [sanity.io/manage](https://www.sanity.io/manage), open your project → **API → CORS Origins** → add:
   - `http://localhost:3000` (check **Allow credentials**)
   - your Vercel production URL (check **Allow credentials**)
3. Optional: run `npm run seed:sanity` to upload the 8 starter scenes from `lib/scenes.ts` into Sanity with hero images. The seed script is idempotent — re-running it replaces (not duplicates) existing docs by slug.

---

## Scripts

| Script | Purpose |
|---|---|
| `npm run dev` | Next dev server, `http://localhost:3000` |
| `npm run build` | Production build |
| `npm run start` | Serve the production build locally |
| `npm run lint` | ESLint (Next's default config) |
| `npm run typecheck` | `tsc --noEmit` (no emit, just check) |
| `npm run seed:sanity` | Upload `SEED_SCENES` into your Sanity dataset (one-time) |

---

## Editing content

After Sanity is wired up and seeded, all content lives in the Studio:

- **Scenes** (`/studio` → Scenes) — title, slug, coords, sensor, band combo, narrative, hero image, marketplace links. Toggle `featured` to include a scene in the homepage rotator.
- **Press** (`/studio` → Press) — entries appear on `/press`, reverse-chronological.
- **Site settings** (`/studio` → Site settings) — tagline, origin question, socials, shop-level marketplaces, contact email.

Click **Publish** when done. Pages use ISR with a 60-second revalidate — your edits show up on the live site within a minute.

Prose that *doesn't* live in Sanity:
- **Process** article — `content/process.mdx` (6 sections per spec §6.4; edit as markdown)
- **About** bio — currently inline prose in `app/(site)/about/page.tsx` (swap the `<Image>` src to your portrait when available)

---

## Deployment (Vercel)

1. Push this repo to GitHub.
2. At [vercel.com/new](https://vercel.com/new), import the repo — Vercel auto-detects Next.js.
3. **Environment Variables** tab — paste each of the keys from your `.env.local` (except `NEXT_PUBLIC_SITE_URL`, which only matters for staging).
4. Deploy. You'll get a `*.vercel.app` URL.
5. **Sanity → CORS Origins** — add your `*.vercel.app` URL (and the custom domain below) with **Allow credentials** ticked, otherwise the embedded Studio at `/studio` won't be able to authenticate.
6. **Domains** — add `orbitalartifacts.shop` in Vercel → Settings → Domains. Point DNS apex records to Vercel per their instructions.
7. Add the custom domain to Sanity CORS too.

Every `git push` to the main branch redeploys automatically.

---

## Performance + SEO

Lighthouse (desktop, production build):

| Route | Perf | A11y | BP | SEO |
|---|---|---|---|---|
| `/` | 100 | 100 | 100 | 100 |
| `/archive` | 99 | 100 | 100 | 100 |
| `/archive/[slug]` | 100 | 100 | 100 | 100 |
| `/about` | 99 | 100 | 100 | 100 |
| `/process` | 100 | 100 | 100 | 100 |

Built-in:
- **Sitemap** at `/sitemap.xml` (auto-includes every scene slug)
- **robots.txt** at `/robots.txt` (allow all, disallow `/studio`)
- **JSON-LD `VisualArtwork`** on every scene page with creator, coords, image, dates
- **OG images** at `/opengraph-image` and `/archive/[slug]/opengraph-image` — 1200×630 with hero + wordmark + coords in Fraunces/JetBrains Mono
- **ISR 60s** — Sanity edits propagate within a minute, no deploy required

---

## Brand

Design tokens (`app/globals.css`):
- `--color-paper` `#ebe5d6` · `--color-paper-2` `#e8e3d8` — warm cream backgrounds
- `--color-ink` `#0a0a0a` · `--color-ink-2` `#2b2a26` — body text
- `--color-muted` `#5a5348` — secondary text
- `--color-rust` `#c94f2a` — italic accents (large type only)
- `--color-rust-deep` `#a53b1c` — 4.5:1 darker rust for small body links (WCAG AA)
- `--color-sand` `#c9a96e` — borders and dot separators

Assets in `public/brand/`:
- `logo-horizontal.png` / `logo-vertical.png` — wordmark lockups
- `mark-on-light.png` / `mark-on-dark.png` — tight mark variants
- `wordmark-on-light.png` / `wordmark-on-dark.png`
- `banner-hero.png` / `banner-1200x300.png` / `banner-mini.png`
- `shop-icon.png` — 500×500 avatar, used as portrait placeholder on `/about`
- `app/icon.png` — favicon

---

## Project layout

```
app/
  (site)/            ← public site routes (share Header/Footer via layout)
    page.tsx         ← /
    archive/
      page.tsx       ← /archive (client-side filter grid)
      [slug]/        ← /archive/<slug> + per-scene OG image
    about/           ← /about (inline bio, TODO(owner): long-form)
    process/         ← /process (pulls content/process.mdx)
    press/           ← /press (Sanity-backed, empty-state ships naturally)
    contact/         ← /contact (Web3Forms client submit)
  studio/            ← embedded Sanity Studio (/studio/*)
  sitemap.ts         ← dynamic sitemap.xml
  robots.ts          ← dynamic robots.txt
components/
  brand/             ← Logo, MetaStrip, CornerBrackets, SignalRings, FilmGrain
  home/              ← Hero, HeroRotator, FeaturedStrip, ProcessTeaser, AboutTeaser, OriginQuestion
  layout/            ← Header, Footer
  archive/           ← ArchiveBrowser (filters + grid)
  scene/             ← SceneCard, SceneThumbnail, SceneJsonLd
  motion/            ← Reveal (scroll), HeadlineReveal (mount stagger)
  contact/           ← ContactForm
content/
  process.mdx        ← Process article
sanity/
  schemas/           ← scene, pressEntry, siteSettings, embedded objects
  lib/               ← client, writeClient, image URL builder
  queries.ts         ← GROQ projections
  env.ts             ← env var loader
scripts/
  seed-sanity.ts     ← idempotent scene seeder
lib/
  scenes.ts          ← Scene type + Sanity-backed helpers + SEED_SCENES (seeder input)
  siteConfig.ts      ← siteSettings loader + static fallback
  press.ts           ← press entries loader
  ogFonts.ts         ← TTF font loader for OG image generation
  site.ts            ← canonical SITE_URL
  utils.ts           ← cn() classname joiner
mdx-components.tsx   ← brand typography mapping for MDX
sanity.config.ts     ← Studio config (structure + plugins)
```

---

## What this site is NOT

- **Not a cart / storefront** — no Stripe, no Shopify, no checkout logic. All "buy" links route out to marketplaces.
- **Not dark-mode** — paper `#ebe5d6` background everywhere, by design.
- **Not a single-CTA landing page** — it's a catalogue + studio story.
