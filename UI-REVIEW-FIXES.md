# UI Review Fixes — V3 vs V2

These are the issues identified by comparing V3 against the original V2 codebase. Fix all of them.

## What V3 Does Well (KEEP these)
- Circular score gauge
- 4-factor cards with color-coded left borders, progress bars, weight labels
- Priority recommendation cards with code examples + copy buttons
- Score interpretation paragraph with lightbulb icon
- Two CTA banners
- FAQ accordion on landing page

## Issues to Fix

### 1. Factor details all collapsed by default (HIGH PRIORITY)
In V2, all 6 ScoreCards were fully visible with scores, status badges, findings, recommendations, and sub-detail metrics shown upfront. V3 hides everything behind closed `<details>` accordions — the report feels like a summary instead of a comprehensive analysis.

**Fix:** Default-open at least the lowest-scoring factor. Show a preview snippet in each accordion header (score + status + key finding count).

### 2. Missing "Priority Content Improvements" section (HIGH PRIORITY)
V2 had a beautiful side-by-side layout showing "Current Issue" (red left border) next to "Recommended Action" (green left border) with numbered orange circles. This was the most graphically distinctive section. V3 has nothing equivalent.

**Fix:** Add back a "Priority Content Improvements" section with side-by-side current issue / recommended action cards. Use red left border for issues, green for recommendations, numbered orange circles.

### 3. Missing "Next Steps" section (HIGH PRIORITY)
V2 had a gradient background card with "Immediate Actions" and "Long-term Strategy" in two columns. This gave the report a professional, consulting-quality feel. V3 replaces this with just CTA banners.

**Fix:** Add a "Next Steps" section with a gradient background card, two columns: "Immediate Actions" and "Long-term Strategy". Keep the CTA banners too.

### 4. Report header too plain
V2 had a centered title "AI Website Grader Report" with "Powered by Search Influence — AI SEO Experts" subtitle. V3 has the title but lost the branding subtitle.

**Fix:** Add "Powered by Search Influence — AI SEO Experts" subtitle below the report title.

### 5. Less color diversity
V2 used 6 distinct colors across ScoreCards. V3 uses only 4 colors for factor cards; the rest is mostly monochrome with green CTAs.

**Fix:** Expand the color palette — use 6 distinct colors for factor-related elements. Reference SI brand colors: Dark Navy #012c3a, Navy #014a61, Medium Blue #3490b5, Light Blue #4eb1cd, Green #91c364, Orange #df5926.

### 6. No sub-detail scores visible
V2 showed individual metric scores within each card (e.g., chunkability, qaFormat, semanticClarity as separate sub-scores). V3 has these in the accordion but they're hidden.

**Fix:** Show sub-detail scores as compact inline badges or a mini progress bar row visible in the accordion header or as a preview before expanding.

### 7. "Detailed Factor Analysis" label is small and bland
Just an `<h3>` with no visual weight.

**Fix:** Make it a major section header with visual weight — larger font, maybe a subtle background or left border accent.

### 8. Export buttons look like afterthoughts
They sit at the bottom with no visual distinction.

**Fix:** Move them up or add visual treatment. Consider placing near the report header or giving them a more prominent card-style container.

### 9. Mixed heading hierarchy
"Analysis Score Breakdown" is `<h2>`, "Priority Recommendations" and "Detailed Factor Analysis" are `<h3>`, bottom CTA heading is `<h3>`. Should be consistent.

**Fix:** Make all major section headers the same level and visual weight.

### 10. Green gradient disconnected from design system
The results header green gradient feels disconnected from the dark blue/orange design system.

**Fix:** Align the gradient with the SI brand color scheme — use navy/blue tones instead of green, or integrate the green more cohesively.

### 11. Accordion status labels unpolished
Factor accordion summaries show "good performance" / "excellent performance" in lowercase — looks unpolished compared to the FactorCard's uppercase status badges.

**Fix:** Capitalize and style these to match the FactorCard status badges.

## SI Brand Colors Reference
- Dark Navy: #012c3a
- Navy: #014a61
- Medium Blue: #3490b5
- Light Blue: #4eb1cd
- Green: #91c364
- Orange: #df5926
- Font: Open Sans (Extra Bold for headers, Light/Regular for body)
