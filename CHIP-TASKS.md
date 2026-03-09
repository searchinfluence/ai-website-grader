# AI Website Grader — Chip Tasks (Round 3: Scoring Calibration)

**Repo:** `~/clawd/repos/ai-website-grader-si`
**Branch:** `main`
**Deploy URL:** https://ai-website-grader-si.vercel.app/
**Stack:** Next.js 15, TypeScript, Tailwind CSS, Supabase

---

## Round 3: Scoring Calibration Fixes

### Task 1: Rebalance Factor Weights
**File:** `lib/scoring/config.ts`
**Status:** [x] Done

Change the factor weights to:
| Factor | Current | New |
|---|---|---|
| Content Structure | 0.15 | **0.30** |
| Structured Data | 0.22 | **0.20** |
| Technical Health | 0.45 | **0.30** |
| Page SEO | 0.18 | **0.20** |

This stops Technical Health from dominating. Content Structure gets the differentiation weight it deserves.

---

### Task 2: Add Back Penalty Signals to Technical Health
**File:** `lib/analyzer/technical-health.ts`
**Status:** [x] Done

The current TH analyzer only checks booleans (HTTPS ✓, viewport ✓, canonical ✓) — nearly every modern site scores 85+. The `analyzePerformance()` function in `performance-apis.ts` already computes `htmlValidation`, `accessibilityScore`, and `performanceScore` — but none of that feeds into the TH factor score. The TH analyzer only grabs `coreWebVitals.score` from the crawl data.

**Fix:** Pull `performanceScore` (which blends CWV 40% + HTML validity 30% + accessibility 30%) into TH scoring as a sub-component, replacing or blending with the current speed-only approach. This reintroduces the differentiation that was lost.

Look at how `analyzePerformance()` in `performance-apis.ts` returns its data and wire `performanceScore` into the TH factor calculation. The goal is that sites with poor HTML validation, bad accessibility, or slow CWV get meaningfully penalized in TH — not just get 85+ by having HTTPS and a viewport tag.

---

### Task 3: Fix Readability Bug in Content Structure
**File:** `lib/analyzer/content-structure.ts`
**Status:** [x] Done

**The bug:** `getMainContentText()` joins `content.paragraphs`. If the crawler extracts paragraphs but strips or loses sentence-ending punctuation, `sentenceCount` stays at 1, so `wordsPerSentence = 2700/1 = 2700`, and `readabilityScore = clamp(100 - 10728) = 0`.

**Fix:** Add a fallback — if `wordsPerSentence > 50` (clearly broken extraction), estimate sentence count from word count using avg ~17 words/sentence and log a warning. Also check if `text` is empty/short when `wordCount` is high (text extraction mismatch).

---

## Rules
- `npm run build` before every commit — must pass clean
- Commit each task separately with descriptive messages
- **DO NOT DEPLOY** — commit and push only. Will deploys manually.
- When ALL tasks done, notify: `openclaw system event --text "Done: Round 3 scoring calibration — weights rebalanced, TH penalty signals restored, readability bug fixed" --mode now`

## Completed Rounds

**Round 2 (March 8-9, 2026):**
- [x] Scoring revert — pre-calibration weights restored
- [x] Modal input fields — light backgrounds, dark text, proper contrast
- [x] CTA panel consistency — matching styles
- [x] PDF = print format — jsPDF removed, uses print-report page
- [x] Markdown export email gate — verified gating flow

**Round 1 (March 7-8, 2026):**
- [x] V3 scoring engine (4-factor)
- [x] Security hardening + Supabase integration
- [x] Recommendations overhaul + UI alignment
- [x] Calibration, email gate, share links, print, PDF, SI branding, mobile, UI review
