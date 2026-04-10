# AI Website Grader — Human QA Plan

**Date:** April 5, 2026  
**Goal:** Manual signoff plan for preview and production-readiness review.

## Test Environments

- Preview: `https://ai-website-grader-59krfi0cu-will-scotts-projects.vercel.app`
- Browsers:
  - Chrome
  - Safari
- Devices:
  - Desktop
  - iPhone-width mobile viewport

## Reference URLs

Use these during QA:

- `https://www.searchinfluence.com/services/higher-education-seo/`
- `https://diviner.agency/`
- `https://www.grossmanlaw.net/`
- `https://highereducationseo.com/higher-ed-seo-why-it-matters-now-how-to-nail-it/`
- `https://freeman.tulane.edu/`
- `https://upcea.edu/digital-marketing-strategy-higher-education-seo-paid-ads/`

## 1. Landing Page QA

### Visual review

- Confirm header matches approved SI look:
  - background tone
  - orange rule
  - tagline weight
  - attribution text
- Confirm analyzer card matches the older visual treatment
- Confirm resource cards, About section, and lower page sections stay in the same visual family

### Functionality

- `Analyze URL` tab is active by default
- `Analyze Text` tab switches correctly
- URL field accepts normal URLs
- empty URL shows inline validation

## 2. Loading Overlay QA

- Start analysis on at least 2 real URLs
- Confirm loading overlay appears once
- Confirm step labels rotate normally
- Confirm overlay disappears after analysis completes
- Confirm app does not get stuck spinning

## 3. Report QA

- Confirm report renders after successful analysis
- Confirm overall score, factor cards, and recommendations appear
- Confirm `Back to Analysis` returns to the landing state
- Confirm lowest factor section opens as expected

## 4. Export / HubSpot QA

Use a fresh browser profile or clear `localStorage` first.

### Export PDF

- Click `Export PDF`
- Confirm HubSpot form modal opens
- Submit form
- Confirm print/PDF page opens
- Confirm browser print dialog appears
- Confirm this is acceptable UX for “Export PDF”

### Export Markdown

- Click `Export Markdown`
- Confirm HubSpot form modal opens if no saved lead exists
- Submit form
- Confirm markdown file downloads
- Open file and confirm it includes:
  - score summary
  - factor sections
  - priority recommendations
  - performance section
  - page markdown section when available

### Share Report

- Click `Share Report`
- Submit form if prompted
- Confirm success state and copied link
- Paste link into a new tab
- Confirm shared report loads successfully

### Print Report

- Click `Print Report`
- Submit form if prompted
- Confirm print page opens
- Confirm print dialog appears

### Returning-user behavior

- After one successful submission, confirm subsequent export actions no longer require form completion
- Confirm unlocked state reads naturally

## 5. HubSpot QA

- Confirm the same HubSpot form appears in:
  - export modal
  - CTA modal
- Confirm no leftover placeholder copy from HubSpot appears
- Confirm form fields are visible and submit normally
- Confirm CTA modal is not blank

## 6. GTM QA

Use browser tools or Tag Assistant.

- Confirm GTM container loads on page load
- Confirm GTM container ID is the expected one
- Confirm no hydration error appears related to GTM/HubSpot head scripts
- Confirm key user actions produce expected tracking behavior:
  - analysis start
  - analysis complete
  - export click
  - CTA click

## 7. Supabase / Share QA

- Confirm share creation works from analyzed report
- Confirm shared report lookup works from generated URL
- Confirm there is no user-facing Supabase error during normal flow

## 8. Mobile QA

Check in responsive mode or on device:

- landing header layout
- analyzer form layout
- report header layout
- export button stack
- HubSpot modal usability
- print/share/export flows remain usable

## 9. Cross-Browser QA

Run the core flow in both Chrome and Safari:

- analyze URL
- open report
- submit HubSpot form
- export PDF
- export Markdown
- share report

## 10. Known Risk To Recheck

- `Analyze Text` mode has passed engineering API testing and should be included in manual QA like the URL flow.

## Signoff Criteria

Manual signoff should require:

- no looping or stuck analysis overlay
- no blank HubSpot modals
- all export paths complete after form submit
- share links work
- GTM present
- visuals match approved SI direction
- no console errors that indicate broken user flow
