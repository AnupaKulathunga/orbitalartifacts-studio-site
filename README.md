# Orbital Artifacts

Studio site for **Orbital Artifacts** — Anupa Kulathunga's satellite-imagery art brand. Curated archive + origin story; all checkout is routed out to Etsy / Redbubble / Teespring (no cart, no Stripe, no Shopify).

Spec-of-record: [`CLAUDE_CODE_SPEC.md`](./CLAUDE_CODE_SPEC.md).

---

## Stack

- **Next.js 15** (App Router) · **TypeScript** (strict)
- **Tailwind CSS v4** — design tokens live in `app/globals.css` via `@theme`
- **Sanity v3** for scenes / press / site settings (embedded Studio under `/studio`)
- **MDX** for `/about` and `/process` long-form copy
- **Motion** for tasteful reveals (added in M8)
- Deployed on **Vercel**, domain `orbitalartifacts.shop`

## Getting started

```bash
npm install
cp .env.local.example .env.local   # fill in keys as they become available
npm run dev                        # http://localhost:3000
```

## Scripts

| Script | What it does |
|---|---|
| `npm run dev` | Start Next dev server |
| `npm run build` | Production build |
| `npm run start` | Run production build locally |
| `npm run lint` | ESLint |
| `npm run typecheck` | `tsc --noEmit` |

## Build milestones

Scaffolded in milestones per the spec's §14 build order. Current state: **M3 — home page complete.**

- [x] **M1** — Next.js + TypeScript + Tailwind v4 scaffold, design tokens, route stubs
- [x] **M2** — Fonts, shared Header / Footer, `SignalRings` / `MetaStrip` / `Logo` / `FilmGrain` components
- [x] **M3** — Home page (static seed data)
- [ ] **M4** — Archive + scene detail (static seed data)
- [ ] **M5** — Sanity Studio with schemas per §9
- [ ] **M6** — Wire Sanity queries, replace static data
- [ ] **M7** — About / Process / Press / Contact pages
- [ ] **M8** — Motion reveals
- [ ] **M9** — OG images, sitemap, robots, JSON-LD
- [ ] **M10** — Perf / Lighthouse pass + final README polish

## Owner TODO checklist

Things **Anupa** needs to supply before launch. Each corresponds to a `// TODO(owner):` in the code.

- [ ] **Sanity project ID** — create a free project at [sanity.io](https://sanity.io) and paste the ID into `.env.local` as `NEXT_PUBLIC_SANITY_PROJECT_ID`
- [ ] **Web3Forms access key** — grab one at [web3forms.com](https://web3forms.com) (no account needed) and set `WEB3FORMS_ACCESS_KEY`
- [ ] **Scene narratives** (2–3 sentences per scene) — editable in Sanity Studio once M5 is live
- [ ] **Marketplace listing URLs** (Etsy / Redbubble / Teespring per scene) — editable in Sanity
- [ ] **About & Process copy** — edit `content/about.mdx` and `content/process.mdx` directly
- [ ] **Social handles** — Instagram / TikTok / Pinterest, set in Sanity `siteSettings`
- [ ] **Portrait photo** (optional) — drop into `public/brand/portrait.jpg` if/when available; `/about` falls back to the OA mark otherwise

## Brand assets

Source files for the Signal identity live in `public/brand/`:

- `banner-hero.png` — primary 3360×840 banner
- `banner-1200x300.png`, `banner-mini.png` — smaller banner crops
- `shop-icon.png` — 500×500 shop avatar
- `logo-horizontal.png`, `logo-vertical.png` — wordmark lockups
- `wordmark-on-light.png` / `wordmark-on-dark.png` — dark/light wordmark variants
- `mark-on-light.png` / `mark-on-dark.png` — tight mark variants
- `app/icon.png` — favicon (uses the tight mark)

An SVG version of the mark will be traced in M2 so the logo can live inline in the header and inherit `currentColor`.

## Deployment

1. Push this repo to GitHub
2. Import at [vercel.com/new](https://vercel.com/new)
3. Add the env vars from your local `.env.local` to the Vercel project
4. Add custom domain `orbitalartifacts.shop` in Vercel → Domains
5. Point DNS apex records to Vercel per their instructions

## What this site is NOT

- Not a cart / storefront. No Stripe, no Shopify, no checkout logic.
- Not dark-mode. Paper `#ebe5d6` background everywhere, by design.
- Not a single-CTA landing page. It is a catalogue + studio story.
