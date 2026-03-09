# AI Website Grader V3 — Comprehensive Plan

**Date:** March 7, 2026
**Branch:** `v3-fixes`
**Deploy Preview:** https://ai-website-grader-si.vercel.app/

---

## Current State Assessment

### What's Done & Working ✅
1. **4-factor scoring engine** — Content Structure (35%), Structured Data (25%), Technical Health (25%), Page SEO (15%)
2. **Supabase integration** — `analyses` table logging every scan
3. **Specific recommendations** — data-backed, prioritized (high/medium/low), with effort estimates
4. **UI polish** — circular score gauge, progress bars, accordion factor details, Lucide icons, loading overlay with fun facts
5. **Schema scoring fix** — V2 multi-factor approach ported, @graph/microdata/RDFa support
6. **GTM-injected schema detection** — headless Chromium hybrid approach for dynamic schemas
7. **CTA sections** — two banners in report (after summary + bottom) linking to SI contact page
8. **Landing page resources** — 3 downloadable resources (research study, workbook, roadmap) with real images
9. **Copy refresh** — messaging matches "page analysis" not "website grader"
10. **Build passes clean** — only 1 minor ESLint warning

### What's Scaffolded (in stash, not merged) 🔄
The stash (`git stash list`) has ~2,500 lines of WIP code including:
- **LeadCaptureModal** component (name, email, company)
- **EmailGateModal** component (already committed and working in ExportButtons)
- **Leads API route** (`/api/leads`) — validates + saves to Supabase
- **Share API route** (`/api/share`) — creates/retrieves shared reports
- **Shared reports library** — Supabase CRUD with 30-day expiry + RLS policies
- **Supabase migrations** — `leads` + `shared_reports` tables ready to run
- **PDF export** — print-report based export using the browser print dialog

### What's NOT Done ❌
- **Supabase tables not created** — migrations exist but haven't been run against the database
- **Email gate not wired** — ExportButtons has the EmailGateModal but gating logic needs testing
- **Share link flow** — API exists but UI button → copy-to-clipboard not end-to-end tested
- **Print report** — `/print-report` page exists but needs print CSS polish + email gate
- **PDF branding** — needs SI brand colors (navy/blue/green), Open Sans font, logo placement per SI-BRANDING.md
- **Mobile optimization** — no responsive testing done; score cards likely don't stack
- **Calibration validation** — haven't run the 9-site test suite since schema changes
- **Resource images** — images exist in `public/images/` but only the higher-ed ones (need to generalize for non-higher-ed audiences or make configurable)
- **Comparison feature** — Datasite feedback requested side-by-side URL comparison (future)

---

## The Plan: 8 Phases

### Phase 1: Foundation — Supabase Tables + Stash Integration
**Effort:** ~1 hour | **Risk:** Low

1. Run migrations against Supabase to create `leads` and `shared_reports` tables
2. Apply stash (`git stash pop`) and resolve any conflicts
3. Verify `/api/leads` POST works end-to-end (modal → API → Supabase row)
4. Verify `/api/share` POST/GET works (create → retrieve)
5. Commit clean foundation

**Why first:** Everything else (email gate, share links, PDF) depends on these tables existing.

---

### Phase 2: Email Gate — Wire Up the Flow
**Effort:** ~1-2 hours | **Risk:** Low

1. Ensure EmailGateModal triggers before PDF export, print, and share
2. Save lead to Supabase via `/api/leads` on submit
3. Persist to localStorage so returning visitors skip the gate
4. Test the full flow: click Export → modal appears → submit → action proceeds
5. Make it feel helpful: "Get your full report emailed to you" framing
6. Track gate conversions via GTM dataLayer event

**Acceptance criteria:**
- First-time user clicking any export button sees the email modal
- After submitting once, all export actions work without the modal
- Lead appears in Supabase `leads` table

---

### Phase 3: Share Link
**Effort:** ~1-2 hours | **Risk:** Low

1. Wire Share button → calls `/api/share` → stores analysis in `shared_reports`
2. Copy share URL to clipboard with toast notification ("Link copied!")
3. Build the `/report/[id]` page to display shared reports (read-only, no re-analyze)
4. Share links expire after 30 days (already configured in migration)
5. Gate behind email capture (Phase 2)

**Acceptance criteria:**
- Click Share → get URL → open in incognito → see full report
- Expired links show "Report expired" message
- Share URL format: `ai-grader.searchinfluence.com/report/{uuid}`

---

### Phase 4: Print Report Polish
**Effort:** ~1-2 hours | **Risk:** Low

1. Review `/print-report` page — ensure all factor data renders
2. Print-specific CSS: hide nav/input/buttons, proper page breaks between factors
3. Add SI branding to print header (logo + "AI Website Grader Report")
4. Gate behind email capture
5. Test in Chrome and Safari print preview

**Acceptance criteria:**
- Print output is clean, professional, readable
- Each factor starts on its own section (page breaks where needed)
- SI logo and branding visible in print header

---

### Phase 5: PDF Export with SI Branding
**Effort:** ~2-3 hours | **Risk:** Medium (print layout needs to stay aligned with the report view)

1. Update `lib/exporters.ts` to use SI brand colors per SI-BRANDING.md:
   - Primary: Dark Navy `#012c3a` for headers
   - Accent: Medium Blue `#3490b5` for section headers
   - Score highlights: Green `#91c364`
   - Background sections: Light Blue `#4eb1cd` for data tables
2. Add SI logo to PDF header (`public/search-influence-logo.png` already exists)
3. Professional layout:
   - Page 1: Header with logo + date, URL, overall score gauge, 4-factor summary cards
   - Pages 2+: Factor deep-dives with findings + recommendations
   - Final page: Priority recommendations summary + CTA
4. Footer on every page: "Generated by AI Website Grader | searchinfluence.com"
5. Proper page breaks — no orphaned headings or split recommendation blocks

**Acceptance criteria:**
- PDF looks like it came from a professional agency, not a dev tool
- Colors match SI brand guidelines
- Every page has header/footer
- Recommendations are readable and complete (no truncation)

---

### Phase 6: Mobile Optimization
**Effort:** ~2-3 hours | **Risk:** Medium

1. **Score cards** — stack 2x2 on tablet, 1-column on mobile (currently 4-across)
2. **Factor accordions** — full-width on all breakpoints
3. **Export buttons** — stack vertically on mobile, full-width tap targets
4. **Input form** — URL input + button stack on mobile
5. **Landing page** — resources section responsive (stack on mobile)
6. **CTA banners** — readable on mobile, button full-width
7. Test at 375px (iPhone SE), 390px (iPhone 14), 768px (iPad)

**Acceptance criteria:**
- No horizontal scroll at any breakpoint
- All buttons have minimum 44px touch targets
- Score cards are readable on a phone screen
- Export actions work on mobile

---

### Phase 7: Calibration & Validation
**Effort:** ~2-3 hours | **Risk:** Medium (may require scoring tweaks)

1. Run `run-calibration-suite.js` against all 9 test sites
2. Verify score distribution matches expected tiers:
   - Excellent (80-95): Well-optimized sites
   - Good (65-79): Decent sites with room to improve
   - Average (45-64): Typical sites
   - Poor (20-44): Sites with significant issues
3. Verify recommendations are **specific and different** across sites
4. Check for false positives (recommending something the site already does)
5. Check consistency: same URL, two runs → scores within ±2 points
6. Document results in `calibration-results.json`
7. If scores are off, adjust thresholds in analyzer modules (not weights)

**Acceptance criteria:**
- All 9 sites score within expected tiers
- No two sites have identical recommendation sets
- Every recommendation references specific data from the analysis
- Consecutive runs are stable (±2 points)

---

### Phase 8: Production Deploy & QA
**Effort:** ~1 hour | **Risk:** Low (if phases 1-7 pass)

1. Full `npm run build` — verify zero errors
2. Final review of all pages: landing, report, print, shared report
3. Test complete user flow: enter URL → analyze → view report → email gate → export PDF → share link → open shared link
4. Merge `v3-fixes` → `main`
5. Deploy: `vercel --prod`
6. Smoke test production URL
7. Verify Supabase is logging analyses + leads

---

## Future Enhancements (Post-V3, Not in This Sprint)

These came from the Datasite feedback and our own ideas. Parking them here for later:

| Feature | Source | Priority |
|---------|--------|----------|
| **URL comparison** — side-by-side scoring | Datasite feedback | High |
| **Multi-page crawl** — analyze full site, not just one page | Datasite + Chuck | High |
| **Text-only analysis** — better scoring when no URL | Datasite (Sam) | Medium |
| **Deeper click-through** — expand each finding into detail view | Datasite (Nathan) | Medium |
| **Resource images** — generalize for non-higher-ed audiences | Internal | Low |
| **Email report delivery** — email the PDF after gate capture | Internal | Medium |
| **HubSpot integration** — push leads to HubSpot CRM | Internal | Medium |
| **Historical tracking** — re-analyze same URL over time, show progress | Internal | Low |

---

## Estimated Total Effort

| Phase | Effort | Dependencies |
|-------|--------|-------------|
| 1. Foundation | ~1h | None |
| 2. Email Gate | ~1-2h | Phase 1 |
| 3. Share Link | ~1-2h | Phase 1 |
| 4. Print Polish | ~1-2h | Phase 2 |
| 5. PDF Branding | ~2-3h | Phase 2 |
| 6. Mobile | ~2-3h | None (parallel) |
| 7. Calibration | ~2-3h | None (parallel) |
| 8. Deploy | ~1h | All phases |
| **Total** | **~12-17 hours** | |

Phases 6 and 7 can run in parallel with 3-5. A sub-agent (Chip) can handle the bulk of the implementation work.

---

## Technical Notes

- **Branch:** `v3-fixes` (18 commits ahead of main)
- **Stash:** 1 stash with ~2,500 lines of WIP (leads, shares, modal, PDF improvements)
- **Build:** ✅ Clean (1 minor warning)
- **Supabase:** Tables need migration — SQL files ready in `supabase/migrations/`
- **SI Logo:** `public/search-influence-logo.png` exists
- **SI Brand Colors:** Dark Navy #012c3a, Navy #014a61, Medium Blue #3490b5, Light Blue #4eb1cd, Green #91c364
