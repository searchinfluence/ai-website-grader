# AI Website Grader Code Review

## Scope Reviewed
- `package.json`
- `next.config.ts`
- `app/`
- `components/`
- `lib/`
- `hooks/`
- `types/`
- `README.md`
- `SCORING_LOGIC_REVIEW.md`
- `ROLLED_BACK_FEATURES.md`
- Deployment/testing config and scripts (`vercel.json`, `deploy.sh`, `setup-vercel-deploy.sh`, test scripts)

## Executive Summary
The codebase has strong momentum and feature breadth, but there are several **critical production risks**: an environment-debug API leak, unrestricted server-side URL fetching (SSRF risk), permissive CORS, and client-side HTML injection in print export. Scoring architecture is also inconsistent (6-factor hybrid + 7-factor weighted systems coexisting), and scoring logic contains multiple hardcoded/bias-prone heuristics that can produce unstable or inflated scores.

## Priority Findings (Highest Impact First)

### Critical
1. **Environment information disclosure via public API endpoint**
- Evidence: `app/api/analyze/route.ts:64`, `app/api/analyze/route.ts:68`, `app/api/analyze/route.ts:72`, `app/api/analyze/route.ts:76`
- Issue: `GET /api/analyze` returns env metadata (`apiKeyExists`, key length, env var names, `nodeEnv`) and is CORS-accessible from any origin.
- Impact: Sensitive deployment telemetry is exposed publicly; attackers can enumerate environment configuration.
- Recommendation: Remove `GET` debug handler entirely in production, or guard behind strict admin auth and non-production checks.

2. **Unrestricted server-side fetch of user-provided URLs (SSRF risk)**
- Evidence: `lib/crawler.ts:13`, `lib/crawler.ts:22`, `lib/crawler.ts:396`, `lib/crawler.ts:399`
- Issue: Arbitrary user URLs are fetched from server context without private network / metadata IP / localhost protections.
- Impact: Potential access to internal services, cloud metadata endpoints, or internal network reconnaissance.
- Recommendation: Add URL allow/deny policy (block `localhost`, RFC1918, link-local, metadata IPs), DNS rebinding protections, and outbound fetch restrictions.

3. **Overly permissive CORS on analysis endpoint**
- Evidence: `app/api/analyze/route.ts:19`, `app/api/analyze/route.ts:31`, `app/api/analyze/route.ts:43`, `app/api/analyze/route.ts:57`
- Issue: `Access-Control-Allow-Origin: *` with broad methods/headers allows any site to invoke your backend.
- Impact: Abuse of your compute/bandwidth, easier automated exploitation of SSRF path.
- Recommendation: Restrict origins to trusted domains and apply rate-limiting/auth.

4. **HTML injection/XSS surface in print export**
- Evidence: `components/ExportButtons.tsx:67`, `components/ExportButtons.tsx:182`, `components/ExportButtons.tsx:490`
- Issue: User-derived analysis values are interpolated into raw HTML template and written via `document.write` in a popup.
- Impact: Malicious page content can execute script in export window context.
- Recommendation: Escape all dynamic fields or render print view via React route/component instead of string-template HTML.

### High
5. **Scoring architecture drift: hybrid 6-factor and weighted 7-factor both active**
- Evidence: `lib/analysis-engine.ts:52`, `lib/analysis-engine.ts:54`, `lib/analysis-engine.ts:115`, `lib/analysis-engine.ts:132`
- Issue: Hybrid score is computed/logged and returned, while final score uses separate 7-factor calculation.
- Impact: Confusing behavior, documentation/test mismatch, difficult calibration and trust.
- Recommendation: Choose one canonical scoring model, deprecate the other, and align API schema + docs.

6. **Systematic score bias from hardcoded domain/industry bonuses**
- Evidence: `lib/analyzer.ts:433`, `lib/analyzer.ts:2655`, `lib/analyzer.ts:2938`, `lib/analyzer.ts:3093`
- Issue: Scores are boosted by domain strings (`searchinfluence.com`, `.law`, `.consulting`, etc.) and niche keywords.
- Impact: Non-generalizable grading and biased outputs; weak external credibility.
- Recommendation: Remove domain-specific boosts and use behavior-based, source-agnostic signals.

7. **Validation fallback can incorrectly report HTML as valid**
- Evidence: `lib/performance-apis.ts:63`, `lib/performance-apis.ts:69`
- Issue: W3C failure path returns `isValid: true` with zero errors.
- Impact: Inflated technical/quality scoring during validator outages.
- Recommendation: Mark as unknown/unavailable, not valid; propagate confidence flags into scoring.

8. **No API rate-limiting or abuse controls**
- Evidence: `app/api/analyze/route.ts:4`, `lib/crawler.ts:22`, `lib/performance-apis.ts:507`
- Issue: Endpoint executes expensive crawl + external API calls per request, no throttling.
- Impact: Easy denial-of-service / quota exhaustion.
- Recommendation: Add per-IP and per-origin rate limits, concurrency caps, and request budgets.

9. **Content extraction over-collects `<div>` text causing noisy inputs**
- Evidence: `lib/crawler.ts:223`, `lib/crawler.ts:226`
- Issue: Paragraph extraction includes all `p, div` blocks >20 chars, likely duplicating nav/footer/non-content text.
- Impact: Polluted scoring inputs, false signals, unstable results.
- Recommendation: Restrict to main content selectors and deduplicate text blocks.

10. **Incorrect units in loading score logic**
- Evidence: `lib/crawler.ts:384`, `lib/crawler.ts:393`, `lib/analyzer.ts:2023`, `lib/analyzer.ts:2024`
- Issue: `loadTime` estimated in seconds, but later compared as if milliseconds (`<2000`, `<4000`).
- Impact: Loading experience score is almost always over-rewarded.
- Recommendation: Normalize units (ms vs s) consistently.

11. **Misleading UI claim that API key is configured**
- Evidence: `components/ScoreReport.tsx:549`
- Issue: UI always states PageSpeed key is configured when performance block exists.
- Impact: Operator confusion and false diagnostics.
- Recommendation: Use a real flag from backend response (e.g., `pagespeedSource: "api"|"fallback"`).

12. **Public metadata/scripts mixed with client component in layout**
- Evidence: `app/layout.tsx:4`, `app/layout.tsx:54`, `app/layout.tsx:65`, `components/GoogleSearchConsole.tsx:1`, `components/GoogleSearchConsole.tsx:20`
- Issue: Verification/meta logic is implemented via client component and script logging.
- Impact: Unnecessary client JS and complexity for static metadata concerns.
- Recommendation: Move verification to `metadata.verification` only, remove redundant client script/meta output.

### Medium
13. **Documentation drift and broken references**
- Evidence: `README.md:162`, `README.md:216`, `README.md:9`, `README.md:392`
- Issue: References missing files (`DEPLOYMENT.md`, `WEIGHTING_SYSTEM.md`), outdated badge/version text.
- Impact: Onboarding friction and trust loss.
- Recommendation: Update docs to match repo reality and remove dead links.

14. **UI copy/weights inconsistent with implemented model**
- Evidence: `app/page.tsx:126`, `app/page.tsx:366`, `lib/analysis-engine.ts:159`
- Issue: Page text says "9-category" and mobile weight 20%, while engine uses 7 factors and 12% mobile weight.
- Impact: User confusion and perceived inaccuracy.
- Recommendation: Derive displayed labels/weights from a shared config source.

15. **Monolithic scoring file increases change risk**
- Evidence: `lib/analyzer.ts` (~3506 LOC)
- Issue: Single file contains multiple scoring systems and legacy helpers.
- Impact: High regression risk, hard review/testing.
- Recommendation: Split by domain (`technical.ts`, `content.ts`, `ai.ts`, `schema.ts`) and centralize shared primitives.

16. **Dead/legacy paths increase maintenance cost**
- Evidence: `lib/analysis-engine.ts:180`, `components/GoogleAnalytics.tsx:1`
- Issue: `generateContentImprovements` appears unused; GA component remains while GTM is active.
- Impact: Confusion and stale code paths.
- Recommendation: Remove or explicitly deprecate unused modules.

17. **Accessibility/semantic issues in resource cards**
- Evidence: `components/ResourceCard.tsx:113`, `components/ResourceCard.tsx:122`
- Issue: Interactive nesting (`<a>` wrapping `<button>`) is invalid.
- Impact: Accessibility and keyboard behavior inconsistencies.
- Recommendation: Use one interactive element (`<a>` styled as button).

18. **Heavy inline style usage harms maintainability and render performance**
- Evidence: `components/ScoreReport.tsx`, `components/ExportButtons.tsx`, `app/page.tsx`
- Issue: Large inline style objects recreated on render; difficult to theme/reuse.
- Impact: Performance overhead and high UI maintenance cost.
- Recommendation: Move to CSS modules/Tailwind utility classes with reusable components.

19. **Debug logging noise in production paths**
- Evidence: `components/ScoreReport.tsx:15`, `lib/analysis-engine.ts:52`, `lib/performance-apis.ts:367`, `lib/analyzer.ts:2789`
- Issue: Extensive logs across server/client path.
- Impact: Log volume, noisy debugging, potential accidental leakage.
- Recommendation: Gate logs behind environment-aware logger with levels.

20. **Deployment script has unsafe defaults**
- Evidence: `deploy.sh:18`, `deploy.sh:31`
- Issue: `git add .` + direct push to `main` in one command path.
- Impact: Accidental commits/deploys and reduced change control.
- Recommendation: Separate commit/push/deploy steps or require explicit flags.

## Area-by-Area Review

### 1) Architecture & Code Organization
- Strengths:
  - Clear separation of API route, crawler, analyzer, exporters.
  - Type definitions are extensive and mostly explicit (`types/index.ts`).
- Gaps:
  - Scoring architecture is fragmented between legacy/new/hybrid systems (`lib/analysis-engine.ts:52`, `lib/analysis-engine.ts:115`).
  - `lib/analyzer.ts` is too large and mixes concerns.
  - UI components are oversized (`components/ScoreReport.tsx` is 1000+ lines).

### 2) Code Quality (Anti-patterns, Tech Debt, Bugs)
- High heuristic coupling to specific industries/domains (`lib/analyzer.ts:2655`, `lib/analyzer.ts:2938`).
- Unit mismatch bug in load-time scoring (`lib/crawler.ts:393`, `lib/analyzer.ts:2024`).
- Data-shape bug: synthetic `sources` array from number string (`lib/crawler.ts:1425`).
- Inconsistent status thresholds between backend and UI (`lib/analyzer.ts:1646`, `components/ScoreReport.tsx:34`).

### 3) Performance Bottlenecks
- Expensive network path per request: crawl + validator + PageSpeed (`lib/crawler.ts:280`, `lib/performance-apis.ts:507`).
- Paragraph extraction from all `div` elements inflates parsing/scoring cost (`lib/crawler.ts:223`).
- Very large client render trees with heavy inline styles (`components/ScoreReport.tsx`).

### 4) Security Vulnerabilities
- Public env debug endpoint and wildcard CORS (`app/api/analyze/route.ts:64`, `app/api/analyze/route.ts:57`).
- SSRF exposure through server-side URL fetching (`lib/crawler.ts:22`).
- Dynamic HTML injection in print export (`components/ExportButtons.tsx:490`).

### 5) UX/UI Issues
- Invalid interactive nesting in cards (`components/ResourceCard.tsx:113`).
- Messaging inconsistency with actual scoring model (`app/page.tsx:126`, `app/page.tsx:366`).
- Non-deterministic messaging about API status (`components/ScoreReport.tsx:549`).

### 6) Testing Coverage
- No formal test runner in `package.json` scripts; only manual scripts targeting localhost and live internet (`package.json:5`, `test-calibration-sites.js:20`).
- Tests are non-deterministic and depend on third-party websites/APIs.
- No unit tests for scoring helpers or security-sensitive route behavior.

### 7) Deployment Setup
- `vercel.json` is minimal but lacks security headers/rate controls (`vercel.json:1`).
- `deploy.sh` encourages direct commit/push to `main` (`deploy.sh:18`, `deploy.sh:31`).
- Documentation references missing deployment docs (`README.md:162`).

### 8) Priority Improvements
1. **Lock down API security first**
- Remove `GET /api/analyze` debug response.
- Restrict CORS and add rate-limiting.
- Add SSRF protections for crawl target URLs.

2. **Unify and simplify scoring architecture**
- Pick one canonical scoring model.
- Remove domain-specific bias and stale legacy helpers.
- Publish a single shared weight/config source used by UI + backend.

3. **Stabilize extraction + metrics correctness**
- Fix `p, div` extraction noise.
- Fix load-time unit mismatch.
- Ensure validator/PageSpeed fallback states are explicit (unknown vs valid).

4. **Reduce UI complexity and injection risk**
- Break `ScoreReport` into composable sections.
- Replace `document.write` print HTML with a React print route.
- Move inline styles to maintainable styling system.

5. **Establish real automated testing**
- Add unit tests for scoring functions and edge cases.
- Add integration tests for `/api/analyze` validation and security controls.
- Keep external calibration scripts as optional benchmarking, not primary tests.

## Validation Notes
- Static checks could not run because dependencies are not installed in this environment:
  - `npm run type-check` failed: `tsc: command not found`
  - `npm run lint` failed: `next: command not found`
