# AI Website Grader V3 — Task Brief for Chip

## Overview
Build the next version of the AI Website Grader. The `fix/security-hardening` branch already has Phase 1 (security fixes) done. Create a `v3` branch from there and implement the remaining phases.

## Repo
- Location: `~/clawd/repos/ai-website-grader-si/`
- Remote: `searchinfluence/ai-website-grader`
- Branch: `v3` (already created from `main`)
- This is the canonical repo — all work goes here

## Reference Documents (READ THESE FIRST)
1. `CODE_REVIEW.md` — Your previous code review with critical findings
2. `SCORING_LOGIC_REVIEW.md` — Detailed scoring function analysis showing inflated scores
3. `~/clawd/projects/ai-website-grader/SCORING-ASSESSMENT.md` — Full scoring assessment with proposed 4-factor model, fix test, implementation plan
4. `SCORING_UPDATE_SUMMARY.md` — Previous scoring changes
5. `ROLLED_BACK_FEATURES.md` — What was tried and reverted
6. `Datasite Feedback on AI Website Grader.txt` — User feedback (recommendations too generic, page vs site confusion)

## Supabase Credentials
Already saved in `.env.local` (gitignored). The keys:
- `NEXT_PUBLIC_SUPABASE_URL=https://spvbszdxzjneatlcknyb.supabase.co`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` — in .env.local
- `SUPABASE_SERVICE_ROLE_KEY` — in .env.local

## Phases

### Phase 1: Security
The security fixes from the CODE_REVIEW.md need to be implemented on this repo:
- Remove `GET /api/analyze` debug endpoint that leaks env info
- Add SSRF protections (block private IPs, localhost, cloud metadata endpoints)
- Lock CORS to trusted origins (not `*`)
- Fix XSS in print export (React route instead of `document.write`)
- Basic rate limiting
- Fix load time unit bug (seconds vs milliseconds)
- Fix validator fallback (return "unknown" not "valid" on failure)

### Phase 2: New 4-Factor Scoring Engine
Replace BOTH existing scoring systems (7-factor weighted AND 6-factor hybrid) with a single 4-factor model:

| Factor | Weight | What to check |
|--------|--------|---------------|
| Content Structure | 35% | Heading hierarchy, word count, FAQ sections, internal links, alt text, readability, question-format headings, content-to-code ratio |
| Structured Data | 25% | JSON-LD presence, schema types, schema completeness, Open Graph, social meta, rich snippet eligibility |
| Technical Health | 25% | HTTPS, Core Web Vitals, robots.txt, sitemap, canonical, hreflang, mobile viewport, responsive CSS, page speed |
| Page SEO | 15% | Title tag, meta description, H1, URL structure, image optimization |

Key changes:
- Remove `detectIndustryExpertise()` and ALL domain-specific bonuses
- Remove unmeasurable signals (E-E-A-T keywords, "authority," "citation potential")
- Fix `div` text extraction — read `<main>`, `<article>`, or semantic content selectors, NOT every div
- Fix inflated sub-scores per SCORING_LOGIC_REVIEW.md:
  - Entity recognition: 20 capitalized words = 100% (broken)
  - Link quality: 1 internal + 1 external = 80% (too easy)
  - Q&A format: 1 heading with ? = 80% (not real Q&A)
  - Factual density: 7 keyword matches = 100% (meaningless)
- Create shared config file for weights (single source of truth for UI + backend)
- Remove `calculateHybridAISearchScore` (6-factor)
- Remove legacy `calculateOverallScore` (7-factor)

### Phase 3: Database Logging (Supabase)
Create table and wire it up:
- Table: `analyses` with columns: id (uuid), url (text), analyzed_at (timestamptz), overall_score (int), factor_scores (jsonb), recommendations (jsonb), raw_stats (jsonb), ip (text), user_agent (text)
- Use Supabase JS client (`@supabase/supabase-js`)
- Server-side writes using service_role key (in API route)
- Set up Row Level Security (RLS) — anon can read, only service_role can write
- Log every analysis automatically after scoring completes
- Create the table via Supabase SQL editor or migration script

### Phase 4: Recommendations Overhaul
The #1 user complaint was generic recommendations. Fix:
- Every recommendation MUST be tied to a specific finding from the analysis
- Include the actual data: "6 of 12 images missing alt text" not "improve image optimization"
- Priority levels: high/medium/low
- Effort estimates: "~30 min", "~1 hour", "~half day"
- Template code where applicable (e.g., Organization JSON-LD template, FAQ schema template)
- No recommendation should appear identically on two different sites

### Phase 5: UI Alignment
- Update landing page copy to match the 4 factors (currently says 9 categories)
- Score display should derive weights from the shared config
- Split `analyzer.ts` (3500+ LOC monolith) into domain-specific files
- Split `ScoreReport.tsx` into per-factor components

### Phase 6: Calibration & Testing
Test sites (existing calibration suite):
- diviner.agency, grossmanlaw.net, highereducationseo.com, wfrancklemd.com
- freeman.tulane.edu, searchinfluence.com, upcea.edu, oho.com, gofishdigital.com

Expected score tiers:
- Excellent: 80-95
- Good: 65-79
- Average: 45-64
- Poor: 20-44

Validation criteria:
1. Well-structured sites score higher than poorly structured ones
2. Same URL on consecutive runs produces same score (±2 points)
3. Every site gets at least 3 specific, actionable recommendations
4. No recommendation is a false positive
5. No sub-score hits 100% unless truly exceptional

## Self-Improvement Loop
After each phase:
1. Run the 9-site calibration suite
2. Compare scores to expected tiers
3. Fix anything that doesn't pass
4. Log results to `test-results/phase-N.json`
5. Only move to next phase when current phase passes

For recommendations specifically: generate for all 9 test sites → verify each is specific and actionable → if any are generic, rewrite the logic → re-run.

## Git Workflow
- Work on `v3` branch
- Commit after each phase with clear messages
- Push to origin so Vercel creates preview deployments
- Don't merge to main — Will reviews first

## Important
- Do NOT skip phases or cut corners on testing
- The tool must produce DIFFERENT, SPECIFIC recommendations for different sites
- Every scoring signal must pass the "fix test": if a site scores low, can you tell them exactly what to change?
