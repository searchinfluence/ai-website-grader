# AI Website Grader — Executed Test Plan

**Date:** April 5, 2026  
**Environment:** Local app at `http://localhost:3000` plus Vercel preview deployment  
**Purpose:** Validate current app behavior after SI visual updates, HubSpot modal replacement, preview deployment fixes, GTM presence, and core dependency wiring.

## Scope

This execution pass covered:

- dependency installation and required env presence
- static validation (`build`, `type-check`)
- GTM presence in rendered HTML
- URL analysis API against real reference sites
- share-link create/read flow through Supabase
- text analysis API smoke test

This pass did **not** fully automate:

- browser-driven PDF/print/share UI actions
- HubSpot modal rendering assertions in headless browser
- GTM event firing verification in Tag Assistant / GA debug tools
- cross-browser visual QA

## Preconditions Checked

| Check | Method | Result |
|---|---|---|
| Core runtime dependencies installed | `npm ls ... --depth=0` | Pass |
| Required local env vars present | `.env.local` key presence check | Pass |
| TypeScript compile | `npm run type-check` | Pass |
| Production build | `npm run build` | Pass with warnings |
| GTM snippet present | `curl http://localhost:3000 \| rg ...` | Pass |

## Commands Executed

### 1. Type-check

```bash
npm run type-check
```

**Result:** Pass

### 2. Dependency presence

```bash
npm ls @sparticuz/chromium @supabase/supabase-js puppeteer-core next react react-dom --depth=0
```

**Result:** Pass

Installed versions observed:

- `@sparticuz/chromium@143.0.4`
- `@supabase/supabase-js@2.98.0`
- `puppeteer-core@24.38.0`
- `next@15.4.8`
- `react@19.1.2`
- `react-dom@19.1.2`

### 3. Env presence

```bash
for k in NEXT_PUBLIC_SUPABASE_URL SUPABASE_SERVICE_ROLE_KEY NEXT_PUBLIC_SUPABASE_ANON_KEY NEXT_PUBLIC_HUBSPOT_PORTAL_ID NEXT_PUBLIC_HUBSPOT_EXPORT_FORM_ID NEXT_PUBLIC_HUBSPOT_CTA_FORM_ID NEXT_PUBLIC_GTM_ID; do
  if rg -q "^${k}=" .env.local; then
    echo "$k=present"
  else
    echo "$k=missing"
  fi
done
```

**Result:** Pass

Verified present:

- `NEXT_PUBLIC_SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `NEXT_PUBLIC_HUBSPOT_PORTAL_ID`
- `NEXT_PUBLIC_HUBSPOT_EXPORT_FORM_ID`
- `NEXT_PUBLIC_HUBSPOT_CTA_FORM_ID`
- `NEXT_PUBLIC_GTM_ID`

### 4. GTM presence in rendered HTML

```bash
curl -s http://localhost:3000 | rg -n "GTM-4G43|googletagmanager|ns.html|dataLayer"
```

**Result:** Pass

Observed:

- GTM `noscript` iframe present with `ns.html?id=GTM-4G43`
- GTM script payload present in streamed Next output with `dataLayer` and `googletagmanager.com/gtm.js`

### 5. URL analysis smoke tests

```bash
node - <<'NODE'
const urls = [
  'https://www.searchinfluence.com/services/higher-education-seo/',
  'https://diviner.agency/',
  'https://www.grossmanlaw.net/'
];
(async () => {
  for (const url of urls) {
    const res = await fetch('http://localhost:3000/api/analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url })
    });
    const data = await res.json();
    console.log({ url, status: res.status, overallScore: data.overallScore });
  }
})();
NODE
```

**Result:** Pass

Observed results:

| URL | Status | Overall | Notes |
|---|---:|---:|---|
| `https://www.searchinfluence.com/services/higher-education-seo/` | 200 | 85 | Strong result, 6 recommendations |
| `https://diviner.agency/` | 200 | 72 | Mid-high result, 8 recommendations |
| `https://www.grossmanlaw.net/` | 200 | 65 | Lower bound good, 10 recommendations |

### 6. Share-link create/read

```bash
node - <<'NODE'
(async () => {
  const analyzeRes = await fetch('http://localhost:3000/api/analyze', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ url: 'https://www.searchinfluence.com/services/higher-education-seo/' })
  });
  const analysis = await analyzeRes.json();
  const shareRes = await fetch('http://localhost:3000/api/share', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ analysis })
  });
  const share = await shareRes.json();
  console.log({ createStatus: shareRes.status, share });
})();
NODE
```

**Result:** Pass

Observed:

- share creation returned `200`
- share URL returned in expected format: `http://localhost:3000/report/{uuid}`
- subsequent `GET /api/share?id={uuid}` returned `200`
- returned report matched expected URL and overall score

### 7. Text analysis mode API smoke test

```bash
node - <<'NODE'
(async () => {
  const textContent = 'AI Website Grader helps marketing teams evaluate content structure, structured data, technical health, and page SEO. This sample content includes headings, descriptive copy, and enough text to exceed the minimum character threshold for text analysis mode.';
  const res = await fetch('http://localhost:3000/api/analyze', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ textContent })
  });
  const data = await res.json();
  console.log({ status: res.status, error: data.error });
})();
NODE
```

**Result:** Pass

Observed:

- status `200`
- returned full analysis payload with `url: "manual-input"`
- factor scoring completed without URL parsing errors

Interpretation:

- manual text input is now safe to sign off for basic API execution
- the manual-input code path no longer breaks on URL-dependent parsing

### 8. Build

```bash
npm run build
```

**Result:** Pass with warnings

Warnings observed:

- `components/HubSpotFormModal.tsx`: missing `useEffect` dependency warning
- `lib/performance-apis.ts`: unused `_jsonError`
- Next warning about multiple lockfiles and preferring `/Users/willscott/Development/package-lock.json`

## Findings

### 1. Build is clean enough to deploy, but not warning-free

Severity: Low

The production build passes, but there are still:

- one hook dependency warning
- one unused variable warning
- one lockfile-selection warning

These are not blocking for preview, but they should be cleaned up before production hardening.

## Summary

### Passed

- dependency installation
- env presence
- type-check
- build
- GTM snippet presence
- URL analysis against real sites
- share-link create/read flow
- text analysis mode API smoke test

### Overall Assessment

The current app is in good shape for preview review of the main URL-based analysis flow, text analysis flow, HubSpot-gated exports, GTM presence, and share-link behavior.  
The main remaining issues from this executed pass are low-severity build warnings rather than a blocking user flow.
