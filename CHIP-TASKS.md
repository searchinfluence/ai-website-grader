# AI Website Grader — Chip Tasks

**Repo:** `~/clawd/repos/ai-website-grader-si`
**Branch:** `main`
**Deploy URL:** https://ai-website-grader-si.vercel.app/
**Stack:** Next.js 15, TypeScript, Tailwind CSS, Supabase

---

## No Active Tasks

All previous task rounds are complete. See git history for details.

### Completed Rounds

**Round 2 (March 8-9, 2026):**
- [x] Scoring revert — pre-calibration weights restored (meca.edu back to ~65-75)
- [x] Modal input fields — light backgrounds, dark text, proper contrast
- [x] CTA panel consistency — matching styles
- [x] PDF = print format — jsPDF removed, uses print-report page
- [x] Markdown export email gate — verified gating flow

**Round 1 (March 7-8, 2026):**
- [x] V3 scoring engine (4-factor)
- [x] Security hardening
- [x] Supabase integration (analyses, leads, shared_reports)
- [x] Recommendations overhaul
- [x] UI alignment + monolith split
- [x] Calibration & testing
- [x] Email gate, share links, print report, PDF export
- [x] SI branding
- [x] Mobile responsive
- [x] UI review (11 issues)

---

## Rules (for future tasks)
- `npm run build` before every commit
- Commit each task separately with descriptive messages
- **DO NOT DEPLOY** unless explicitly told — commit only
- When ALL tasks done, notify: `openclaw system event --text "Done: [description]" --mode now`
