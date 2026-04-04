# V3 Calibration — April 4, 2026

## Round 5 (Final): CS 35% | SD 25% | TH 20% | SEO 20%
## Deploy: ai-website-grader-si.vercel.app (commit 943ea71)

### Weight Validation
Weights were validated against independent assessments from GPT-4.1 and Claude (Opus):

| Factor            | Ours   | GPT-4.1 | Claude | Consensus |
|-------------------|--------|---------|--------|-----------|
| Content Structure | 35%    | 40%     | 35%    | 35-40% ✅ |
| Structured Data   | 25%    | 25%     | 20%    | 20-25% ✅ |
| Technical Health  | 20%    | 15%     | 20%    | 15-20% ✅ |
| Page SEO          | 20%    | 20%     | 25%    | 20-25% ✅ |

### Scoring Changes (Round 4 → Round 5)
1. **Weights rebalanced**: CS 30→35%, SD 20→25%, TH 30→20%, SEO 20→20%
2. **CS analyzer fixes**:
   - Heading jump penalty capped at 3 (was unlimited — Moz was losing 48pts)
   - Educational structure bonus (ordered lists, definition lists)
   - Internal link score capped at 25 to prevent nav inflation
   - Heading depth/variety bonus (H2-H3 count)
   - Nav-inflated word count penalty (low ratio + low extraction = penalty)
   - Content-to-code ratio uses markdownContent when available
3. **TH analyzer fixes**:
   - Performance signals now 65% of TH (was ~35%)
   - CWV 22%, HTML validation 16%, accessibility 14%, speed 13%
   - Hygiene checks reduced to 35% (was ~65%)
   - Score spread: 70-90 (was 82-84 flat)

### Test Results

| Site | Overall | CS | SD | TH | SEO | Notes |
|------|---------|----|----|----|----|-------|
| searchinfluence.com | 85% | 77 | 85 | 88 | 96 | SI benchmark — best-in-class |
| moz.com/beginners-guide-to-seo | 78% | 76 | 58 | 90 | 93 | Fixed: was 70 CS (heading jumps) |
| ahrefs.com/blog/seo-basics/ | 77% | 79 | 58 | 88 | 87 | Fixed: word count no longer nav-penalized |
| harvard.edu | 74% | 86 | 52 | 73 | 83 | Strong CS, weak SD |
| meca.edu/academics/animation-and-game-art/ | 72% | 74 | 59 | 90 | 65 | Fixed: was 60 CS. GTM schema detected ✅ |
| mayoclinic.org | 62% | 69 | 42 | 70 | 66 | Appropriate — weak SD, generic homepage |
| lsu.edu | 61% | 78 | 6 | 90 | 73 | Zero JSON-LD. CS still slightly generous |

### Score Changes (Round 4 → Round 5)

| Site | Old Overall | New Overall | Δ | Key CS Change |
|------|-------------|-------------|---|--------------|
| searchinfluence.com | 85% | 85% | 0 | 81→77 (ratio penalty, fair) |
| moz.com/seo | 76% | 78% | +2 | 70→76 ✅ (heading cap fixed) |
| ahrefs.com/seo | 77% | 77% | 0 | 75→79 ✅ (educational bonus) |
| harvard.edu | 76% | 74% | -2 | 81→86 ✅ (heading depth rewarded) |
| meca.edu | 68% | 72% | +4 | 60→74 ✅ (biggest improvement) |
| mayoclinic.org | 67% | 62% | -5 | 68→69 (TH dropped appropriately) |
| lsu.edu | 64% | 61% | -3 | 80→78 (slight nav correction) |

### Ranking Comparison (Grader vs Claude Blind)

| Rank | Grader | Claude Blind | Agreement |
|------|--------|-------------|-----------|
| 1 | SI (85%) | SI (80%) | ✅ |
| 2 | Moz (78%) | Ahrefs (82%) | Close — within 1 rank |
| 3 | Ahrefs (77%) | Moz (79%) | Close — within 1 rank |
| 4 | Harvard (74%) | Harvard (74%) | ✅ Exact match |
| 5 | MECA (72%) | MECA (63%) | ✅ Same rank, score gap |
| 6 | Mayo (62%) | Mayo (62%) | ✅ Exact match |
| 7 | LSU (61%) | LSU (55%) | ✅ Same rank |

### Known Remaining Issues
- **LSU CS (78)**: Still somewhat generous vs Claude blind (65). Root cause is paragraph extraction including nav text. Fix requires crawler-level change to `getMainContentText`.
- **TH variance**: CWV data from PageSpeed Insights fluctuates per-request (±5-8 points between runs). This is expected behavior, not a bug.

### Permanent Test URLs
Run these for every scoring change:

1. https://searchinfluence.com — SI benchmark (should be 80+)
2. https://harvard.edu — major university, moderate optimization
3. https://moz.com/beginners-guide-to-seo — well-structured educational content
4. https://ahrefs.com/blog/seo-basics/ — well-structured educational content
5. https://meca.edu/academics/animation-and-game-art/ — GTM-injected schema test
6. https://mayoclinic.org — high authority, weak structured data
7. https://lsu.edu — zero JSON-LD baseline
