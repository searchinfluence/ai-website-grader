# AI Website Grader — Chip Tasks (Round 2)

**Repo:** `~/clawd/repos/ai-website-grader-si`
**Branch:** `main`
**Deploy URL:** https://ai-website-grader-si.vercel.app/
**Stack:** Next.js 15, TypeScript, Tailwind CSS, Supabase

## How This Works
Chip picks up the **highest priority unchecked task**, completes it, commits, and moves on. Each task is self-contained with clear acceptance criteria.

**⚠️ DO NOT DEPLOY.** Commit to `main` only. No `vercel --prod`.

---

## Tasks (Priority Order)

### 1. [x] Scoring Too Harsh — Revert to Pre-Calibration Weights ⚡ HIGHEST PRIORITY
The V3 scoring recalibration made scores too harsh. meca.edu dropped from 69→45.

**What to do:**
- Check git history for the pre-calibration scoring weights (before the "Scoring Recalibration" task was done)
- The old 4-factor weights were likely more generous in `lib/scoring/config.ts` AND in the individual analyzers: `lib/analyzer/content-structure.ts`, `lib/analyzer/technical-health.ts`, `lib/analyzer/page-seo.ts`, `lib/analyzer/structured-data.ts`
- Revert the point values and thresholds in those analyzer files to pre-calibration levels
- The factor weights in `lib/scoring/config.ts` (0.15, 0.22, 0.45, 0.18) may be fine — the issue is the individual scoring thresholds within each analyzer being too strict

**Acceptance:** Run a test scan of meca.edu — score should be back in the ~65-75 range, not 45. Well-optimized sites should score 75-90%.

### 2. [x] Modal Input Fields Too Dark
The email gate modal (`components/EmailGateModal.tsx`) input fields look like dark blobs — hard to read.

**What to do:**
- The modal currently uses inline styles with `background: '#ffffff'` and `color: '#1e293b'` on inputs, which should be fine on a white container
- The container is `background: '#ffffff'` — check if CSS variables or `globals.css` dark theme overrides are clobbering these inline styles
- The error message styles still reference dark theme colors (`background: 'rgba(127, 29, 29, 0.3)'`, `color: '#fca5a5'`) — these are left over from when the modal was dark-themed
- Fix: ensure input fields have white/light backgrounds with dark text, clearly visible borders, and proper contrast. The modal container is white, so inputs should look clean and readable.

**Acceptance:** Open the email gate modal — fields should be clearly visible with light backgrounds, dark text, and visible borders. No "dark blob" appearance.

### 3. [x] Inconsistent CTA Panels
The report has two CTA banners — the first one is white/light, the second is blue. They should be visually consistent.

**What to do:**
- Find both CTA sections in `components/ScoreReport.tsx`
- Make them visually consistent — either both use the SI brand gradient (navy → blue) or both use the same card style
- They can have different copy but should look like they belong to the same design system

**Acceptance:** Both CTAs use the same color scheme/style. They should feel like matching components.

### 4. [x] PDF Should Match Print Format
Currently PDF export uses `jsPDF` or a separate generation path. It should just use the print-report page.

**What to do:**
- Look at `lib/exporters.ts` — `generatePDFReport()` already opens the print-report URL. Verify it actually uses `/print-report` (it appears to already do this based on current code)
- If there's any remaining jsPDF dependency, remove it
- The PDF export should open the print-report page and trigger the browser's print-to-PDF flow
- Make sure the print-report page renders identically for both print and PDF modes

**Acceptance:** "Export PDF" button opens the print-report page and triggers print dialog (which allows Save as PDF). No jsPDF dependency in the project.

### 5. [x] Markdown Export Needs Email Gate
Currently the markdown export button calls `onExportMarkdown` directly, bypassing the email gate.

**What to do:**
- In `components/ExportButtons.tsx`, the markdown export already goes through `startGatedAction('markdown')` — verify this actually works
- Trace the flow: `startGatedAction` should check `savedLead` and show the gate if no lead exists
- If there's a code path where markdown bypasses the gate, fix it

**Acceptance:** Click "Export Markdown" with no saved lead — email gate modal appears. After submitting, markdown downloads. If lead already saved, it exports directly.

---

## Completed (Previous Rounds) ✅
Schema scoring fix, enhanced schema detection, email gate, print report, share link, PDF export w/ SI branding, lead gen CTAs, mobile optimization, calibration suite, V3 UI review (11 issues), share link, mobile layout, print format, branding fixes — all shipped.

## Rules
- `npm run build` before every commit
- Commit each task separately with descriptive messages
- When finished with a task, check it off and commit this file too
- **DO NOT DEPLOY** — commit only, no `vercel --prod`
- When ALL tasks done, notify: `openclaw system event --text "Done: AI Grader Round 2 tasks complete" --mode now`
