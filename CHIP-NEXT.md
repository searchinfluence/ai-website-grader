# AI Website Grader V3 — Next Round of Improvements

**Repo:** `~/clawd/repos/ai-website-grader-si`
**Branch:** Work on `main` directly (commit after each task)
**Deploy:** After all changes, run `vercel --prod --yes`
**Stack:** Next.js 15, TypeScript, Tailwind CSS, Supabase
**Live URL:** https://ai-website-grader-si.vercel.app/

## Context
All V3 features are shipped: email gate, print, share, PDF export, lead gen CTAs, mobile optimization. The scoring system uses 4 weighted factors (Content Structure 35%, Structured Data 25%, Technical Health 25%, Page SEO 15%).

## Tasks (Priority Order)

### 1. Scoring Recalibration
The current scoring is too generous — well-optimized pages score 90-100% when they should score 70-80%. Recalibrate per ROLLED_BACK_FEATURES.md "Scoring System Overhaul" section. Key changes:

**Content Structure (lib/analyzer/content-structure.ts):**
- Reduce point values across all metrics
- Internal linking: require 15+ links for full points (currently 5+)
- Alt text: require 98%+ coverage for full points (currently 90%+)

**Technical Health (lib/analyzer/technical-health.ts):**
- HTTPS: reduce from 15 to 10 points (baseline requirement)
- Core Web Vitals: add penalties for poor performance
- HTML errors: stricter thresholds (zero errors = full points)
- Mobile: all indicators required for full points
- Accessibility: require 90+ for full points

**Page SEO (lib/analyzer/page-seo.ts):**
- Title tags: reduce from 35 to 12 points (optimal)
- Meta descriptions: reduce from 30 to 12 points
- H1: heavy penalties for 0 or multiple H1s

**Structured Data (lib/analyzer/structured-data.ts):**
- Schema bonuses: reduce from 8 to 2-3 points

**Target Ranges After Recalibration:**
- Well-optimized: 70-80%
- Excellent: 80-90%
- Pages with issues: 50-70%

**Validation:** After recalibration, test these URLs and verify scores are in target ranges:
- searchinfluence.com (should be 70-85 range)
- google.com (should be 60-75 range)
- example.com (should be very low)

### 2. Enhanced Schema Detection (if not already done)
Check if these are already implemented in structured-data.ts. If not, add:
- @graph structure support in JSON-LD
- Microdata detection (itemscope, itemtype)
- RDFa detection (typeof, property)
- Improved recursion through nested schema structures

### 3. Visual Polish Pass
Look at the report output and tighten up anything that looks off:
- Ensure consistent spacing between sections
- Check that score circle/card colors match SI brand (dark navy #012c3a, navy #014a61, medium blue #3490b5, light blue #4eb1cd, green #91c364, orange #df5926)
- Verify the CTA banners don't feel too aggressive

### 4. Deploy
After all changes pass `npm run build`, deploy with `vercel --prod --yes`.

## Rules
- `npm run build` before every commit
- Commit each task separately with descriptive messages
- Don't break existing functionality
- Test the live site after deploy

When completely finished, run this command to notify me:
openclaw system event --text "Done: AI Grader scoring recalibration + polish deployed" --mode now
