# AI Website Grader v3.0 — Search Influence

A web application that analyzes websites for readiness in AI-powered search engines, chat interfaces, and modern search algorithms. Built with Next.js 15, TypeScript, Tailwind CSS, and Supabase.

**Live:** [ai-grader.searchinfluence.com](https://ai-grader.searchinfluence.com) / [ai-website-grader-si.vercel.app](https://ai-website-grader-si.vercel.app/)

**Powered by Search Influence** — AI-Driven SEO Experts for Higher Education and Healthcare.

[![Next.js](https://img.shields.io/badge/Next.js-15.4.8-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)

---

## Scoring System — 4-Factor Weighted Model

V3 uses a single, clean 4-factor scoring engine (replaced the old 7-factor and 6-factor hybrid systems):

| Factor | Weight | What It Measures |
|--------|--------|------------------|
| **Technical Health** | 45% | HTTPS, Core Web Vitals, crawlability, canonical/hreflang, viewport, responsiveness, speed |
| **Structured Data** | 22% | JSON-LD presence, schema quality, Open Graph, social metadata, rich snippet eligibility |
| **Page SEO** | 18% | Title/meta quality, H1 usage, URL quality, image optimization |
| **Content Structure** | 15% | Heading hierarchy, content depth, FAQ/Q&A structure, internal linking, alt text, readability |

Weights are defined in a single config: `lib/scoring/config.ts`.

### Score Interpretation
- **65-100%**: Excellent — well-optimized for AI search
- **55-64%**: Good — solid foundation, minor improvements needed
- **45-54%**: Average — significant optimization opportunities
- **0-44%**: Needs Improvement — major work required

Scores are calibrated realistically. Even professional SEO agencies typically score 60-70%.

---

## Key Features

- **4-factor scoring engine** with shared config (single source of truth for UI + backend)
- **Specific, data-backed recommendations** — tied to actual findings, with priority levels and effort estimates
- **Email gate** — captures leads before export (name, email, company → Supabase + HubSpot)
- **Share links** — generates shareable report URLs with 30-day expiry
- **Print report** — clean print-friendly layout with SI branding
- **PDF export** — uses print-report page + browser print dialog (no jsPDF)
- **Markdown export** — gated behind email capture
- **Supabase integration** — logs all analyses, leads, and shared reports
- **HubSpot integration** — pushes captured leads to HubSpot CRM
- **Free API integration** — Google PageSpeed Insights + W3C HTML Validator (no API key required)
- **Real Core Web Vitals** — actual LCP, FID, CLS from Google
- **SI branding** — branded header, CTAs, print layout, color palette
- **Mobile responsive** — stacking layouts, proper touch targets

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 15 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS + custom CSS |
| Database | Supabase (PostgreSQL + RLS) |
| CRM | HubSpot (lead push) |
| APIs | Google PageSpeed Insights, W3C HTML Validator |
| HTML Parsing | Cheerio |
| Deployment | Vercel |

---

## Project Structure

```
ai-website-grader-si/
├── app/
│   ├── api/
│   │   ├── analyze/route.ts      # Main analysis endpoint
│   │   ├── leads/route.ts        # Lead capture endpoint
│   │   └── share/route.ts        # Share link create/retrieve
│   ├── report/[id]/page.tsx      # Shared report viewer
│   ├── print-report/page.tsx     # Print-friendly report
│   ├── page.tsx                  # Landing page + analyzer
│   ├── layout.tsx                # Root layout
│   ├── globals.css               # Global styles
│   └── not-found.tsx             # 404
├── components/
│   ├── URLAnalyzer.tsx           # URL input + analysis trigger
│   ├── ScoreReport.tsx           # Main report display
│   ├── ScoreCard.tsx             # Factor score cards
│   ├── ExportButtons.tsx         # Export actions (PDF, MD, print, share)
│   ├── EmailGateModal.tsx        # Lead capture modal
│   ├── LeadCaptureModal.tsx      # Alternate lead capture
│   └── report/
│       ├── FactorCard.tsx        # Individual factor display
│       └── FactorDetails.tsx     # Factor detail accordion
├── lib/
│   ├── analysis-engine.ts        # Main analysis orchestration
│   ├── crawler.ts                # Website crawling + content extraction
│   ├── exporters.ts              # Export functionality
│   ├── hubspot.ts                # HubSpot lead push
│   ├── normalize-analysis.ts     # Analysis data normalization
│   ├── performance-apis.ts       # PageSpeed + W3C API calls
│   ├── analyzer/
│   │   ├── index.ts              # Analyzer orchestration
│   │   ├── content-structure.ts  # Content Structure factor
│   │   ├── structured-data.ts    # Structured Data factor
│   │   ├── technical-health.ts   # Technical Health factor
│   │   ├── page-seo.ts           # Page SEO factor
│   │   ├── recommendations.ts    # Recommendation generation
│   │   ├── shared.ts             # Shared utilities
│   │   └── types.ts              # Analyzer type definitions
│   ├── scoring/
│   │   ├── config.ts             # Factor weights (single source of truth)
│   │   └── engine.ts             # Score calculation
│   ├── supabase/
│   │   ├── admin.ts              # Service role client
│   │   ├── leads.ts              # Lead CRUD
│   │   ├── log-analysis.ts       # Analysis logging
│   │   └── shared-reports.ts     # Share link CRUD
│   └── utils/                    # Utility functions
├── types/
│   └── index.ts                  # TypeScript definitions
└── scripts/
    └── validate-score-calibration.js  # Score validation
```

---

## Development

```bash
npm install
npm run dev        # http://localhost:3000
npm run build      # Production build
```

### Deployment
```bash
# Commit + push + deploy
npm run deploy "commit message"

# Or deploy directly
vercel --prod
```

### Environment Variables
Set in `.env.local` (gitignored):
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- HubSpot credentials (in `lib/hubspot.ts`)

---

## Supabase Tables

| Table | Purpose | RLS |
|-------|---------|-----|
| `analyses` | Logs every scan (url, scores, recommendations) | service_role write, anon read |
| `leads` | Email gate captures (name, email, company) | service_role write |
| `shared_reports` | Shareable report snapshots (30-day expiry) | service_role write, anon read |

---

## Testing

```bash
# Score calibration validation
node scripts/validate-score-calibration.js
```

Test sites: diviner.agency, grossmanlaw.net, highereducationseo.com, wfrancklemd.com, freeman.tulane.edu, searchinfluence.com, upcea.edu, oho.com, gofishdigital.com

---

## History

- **V1** (2024): Initial grader with basic scoring
- **V2** (Nov 2025): 7-factor weighted scoring, W3C validation, PageSpeed integration, export options
- **V3** (Mar 2026): Complete rewrite — 4-factor scoring engine, Supabase backend, email gate, share links, HubSpot integration, SI branding overhaul, UI review polish (11 items), mobile responsive

### V3 Changelog
- Replaced 7-factor + 6-factor hybrid scoring with clean 4-factor model
- Split monolithic `analyzer.ts` (3500+ LOC) into domain-specific modules
- Added Supabase for analysis logging, leads, and shared reports
- Added HubSpot lead push
- Email gate on all exports
- Share links with 30-day expiry
- Print report with SI branding
- PDF export via print dialog (removed jsPDF)
- Security hardening: SSRF protection, CORS lockdown, removed debug endpoint
- UI review: 11 issues fixed (expanded factors, color palette, priority improvements section, next steps section, branded header, sub-detail scores, export button placement, heading hierarchy, gradient alignment, accordion polish)

---

## Future Enhancements

| Feature | Priority |
|---------|----------|
| URL comparison (side-by-side scoring) | High |
| Multi-page crawl (full site analysis) | High |
| Email report delivery (send PDF after gate) | Medium |
| Historical tracking (re-analyze over time) | Medium |
| Text-only analysis improvements | Medium |

---

**AI Website Grader v3.0** — Powered by [Search Influence](https://www.searchinfluence.com)
