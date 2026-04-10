# AGENTS.md

This file provides guidance to Codex (Codex.ai/code) when working with code in this repository.

## Build & Dev Commands

```bash
npm run dev          # Start dev server on localhost:3000
npm run build        # Production build (must pass before deploy)
next lint            # ESLint
tsc --noEmit         # Type check
./deploy.sh "msg"    # Commit + push + vercel --prod
vercel --prod        # Manual deploy
```

Calibration testing: `node scripts/validate-score-calibration.js`

No automated test suite -- validation is manual against reference sites (diviner.agency, grossmanlaw.net, searchinfluence.com, etc.).

## Architecture

Next.js 15 App Router + React 19 + TypeScript + Tailwind CSS. Deployed on Vercel. Supabase for persistence. HubSpot for lead capture.

### Analysis Pipeline

`/app/api/analyze/route.ts` is the main endpoint (rate-limited 30 req/60s per IP). Flow:

1. **Crawl** (`lib/crawler.ts`) -- Puppeteer-core + Cheerio fetch HTML, extract structured content. Includes SSRF protection and URL validation.
2. **Analyze** (`lib/analyzer/index.ts`) -- Orchestrates 4 factor analyzers in parallel, each returns a 0-100 score + details + recommendations.
3. **Score** (`lib/scoring/engine.ts`) -- Weighted combination using weights from `lib/scoring/config.ts`.

### Scoring Model (V3, 4-factor)

| Factor | Weight | Analyzer File |
|--------|--------|---------------|
| Content Structure | 35% | `lib/analyzer/content-structure.ts` |
| Structured Data | 25% | `lib/analyzer/structured-data.ts` |
| Technical Health | 20% | `lib/analyzer/technical-health.ts` |
| Page SEO | 20% | `lib/analyzer/page-seo.ts` |

**Single source of truth for weights:** `lib/scoring/config.ts`

Score labels: 65-100 excellent, 55-64 good, 45-54 average, 0-44 needs improvement.

Recommendations are generated per-factor in each analyzer, then prioritized in `lib/analyzer/recommendations.ts`.

### Pages & UI

- `/app/page.tsx` -- Landing page with URL input, FAQ, features
- `/app/report/[id]/page.tsx` -- Shared report viewer (30-day expiry links)
- `/app/print-report/page.tsx` -- Print-friendly report with SI branding
- `/components/` -- URLAnalyzer (main form with URL and text tabs), ScoreReport (results), `HubSpotFormModal`, export buttons

### Data Flow

- **Leads:** HubSpot-gated exports and CTA flow -> Supabase `leads` table + optional HubSpot CRM push
- **Analyses:** Stored in Supabase `analyses` table
- **Share links:** Supabase `shared_reports` with 30-day expiry via `/api/share`
- PDF export uses browser print dialog (no jsPDF)
- `Analyze Text` uses the `manual-input` path in `lib/crawler.ts` and should not require a valid URL

### External APIs

- Google PageSpeed Insights -- Core Web Vitals, performance score
- W3C HTML Validator -- Markup quality
- No paid API dependencies

## Environment Variables

- `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY` -- Supabase public
- `SUPABASE_SERVICE_ROLE_KEY` -- Server-side admin key
- `NEXT_PUBLIC_HUBSPOT_PORTAL_ID` -- HubSpot embed portal ID
- `NEXT_PUBLIC_HUBSPOT_EXPORT_FORM_ID` -- HubSpot form for export gating
- `NEXT_PUBLIC_HUBSPOT_CTA_FORM_ID` -- HubSpot form for CTA modal
- `NEXT_PUBLIC_GTM_ID` -- Google Tag Manager container ID
- `HUBSPOT_ACCESS_TOKEN` -- Lead push (optional, non-blocking if missing)
- `CORS_ALLOWED_ORIGINS` -- Additional allowed origins (comma-separated)

`/app/api/analyze/route.ts` also trusts Vercel preview origins on `.vercel.app` and `.vercel.dev`.

## Conventions

- No AI slop words: comprehensive, robust, leverage, utilize, delve, landscape
- Em-dashes: use ` -- ` (space-dash-dash-space), not `---`
- SI color palette defined as CSS variables in `app/globals.css`
- Serverless function timeout: 60s max (set in route config for analyze endpoint)
