# AI Website Grader — Chip Tasks

**Repo:** `~/clawd/repos/ai-website-grader-si`
**Branch:** `main`
**Deploy URL:** https://ai-website-grader-si.vercel.app/
**Stack:** Next.js 15, TypeScript, Tailwind CSS, Supabase

## How This Works
Chip picks up the **highest priority unchecked task**, completes it, commits, and moves on. Each task is self-contained with clear acceptance criteria.

---

## Tasks (Priority Order)

### 1. Scoring Recalibration ⚡ HIGHEST PRIORITY
- [ ] **Content Structure** (`lib/analyzer/content-structure.ts`): Reduce point values — internal linking needs 15+ for full points (not 5+), alt text needs 98%+ (not 90%+)
- [ ] **Technical Health** (`lib/analyzer/technical-health.ts`): HTTPS from 15→10 pts, add Core Web Vitals penalties, stricter HTML error thresholds, require 90+ accessibility for full points
- [ ] **Page SEO** (`lib/analyzer/page-seo.ts`): Title tags from 35→12 pts, meta descriptions from 30→12 pts, heavy H1 penalties for 0 or multiple
- [ ] **Structured Data** (`lib/analyzer/structured-data.ts`): Reduce schema bonuses from 8→2-3 pts
- [ ] **Validate scores**: searchinfluence.com (70-85), google.com (60-75), example.com (very low)

**Target ranges:** Well-optimized 70-80%, Excellent 80-90%, Issues 50-70%

### 2. Visual Polish
- [ ] Consistent spacing between report sections
- [ ] Score card colors match SI brand (#012c3a navy, #4eb1cd light blue, #91c364 green, #df5926 orange)
- [ ] CTA banners don't feel too aggressive
- [ ] Review mobile layout at 375px and 768px

### 3. Production Deploy
- [ ] `npm run build` passes clean
- [ ] `vercel --prod --yes`
- [ ] Verify live site works with a test scan

---

## Completed (V3 Launch) ✅
Schema scoring fix, enhanced schema detection, email gate, print report, share link, PDF export w/ SI branding, lead gen CTAs, mobile optimization, calibration suite — all shipped.

## Rules
- `npm run build` before every commit
- Commit each task separately with descriptive messages
- When finished with a task, check it off and commit this file too
- When ALL tasks done, notify: `openclaw system event --text "Done: AI Grader tasks complete" --mode now`
