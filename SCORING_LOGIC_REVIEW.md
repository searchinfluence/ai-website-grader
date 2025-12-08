# Scoring Logic Review - AI Website Grader
**Date**: November 9, 2025
**Purpose**: Review all scoring logic before implementing calibration fixes

---

## 🚨 CRITICAL ISSUES IDENTIFIED

### 1. **Entity Recognition** (100% on 9/9 test sites)
**Current Logic:**
```typescript
const capitalizedWords = text.match(/\b[A-Z][a-z]+\b/g) || [];
const uniqueEntities = new Set(capitalizedWords.filter(word => word.length > 2));
return Math.min(100, uniqueEntities.size * 5);
```

**Problem**: Multiply by 5 means only 20 capitalized words = 100%
**Reality**: ANY page with normal text will have 20+ capitalized words
**Assessment**: ❌ TOO GENEROUS - Not meaningful measurement

**Recommendation**:
- Increase threshold (multiply by 1 or 2 instead of 5)
- OR: Add NLP-based entity detection (people, orgs, locations only)
- Target: Only exceptional content should score >80%

---

### 2. **Link Quality** (100% on 8/9 test sites)
**Current Logic:**
```typescript
let score = 50; // baseline
if (internalLinks > 0) score += 20;  // ANY internal link
if (externalLinks > 0) score += 10; // ANY external link
if (descriptiveLinks / links.length > 0.8) score += 20;
return Math.min(100, score);
```

**Problem**: Starts at 50%, gets to 100% with just:
- 1+ internal links (+20 = 70%)
- 1+ external links (+10 = 80%)
- 80% descriptive text (+20 = 100%)

**Reality**: Almost every page has some links
**Assessment**: ❌ TOO GENEROUS - Trivial to achieve 100%

**Recommendation**:
- Require meaningful link counts (5+ internal, 2+ external)
- Check link distribution and relevance
- Penalize excessive links or poor anchor text
- Target: Average sites 60-70%, excellent sites 85-90%

---

### 3. **Q&A Format** (100% on 7/9 test sites)
**Current Logic:**
```typescript
let score = 0;
if (questionMarkers > 0) score += 40;  // ANY question mark
if (headingQuestions > 0) score += 40; // ANY heading with ?
if (questionMarkers > 3) score += 20;  // 4+ questions total
return Math.min(100, score);
```

**Problem**:
- 1 question mark in body = 40%
- 1 heading with ? = 80%
- 4+ questions anywhere = 100%

**Reality**: Many pages have rhetorical questions
**Assessment**: ⚠️ TOO LENIENT - Not actually Q&A format

**Recommendation**:
- Require clear Q&A structure (question immediately followed by answer)
- Check for FAQ schema or dedicated Q&A sections
- Penalize scattered questions without answers
- Target: Only true Q&A pages should score >70%

---

### 4. **Factual Density** (100% on 2/9 sites, but suspicious)
**Current Logic:**
```typescript
const factualWords = [
  'percent', '%', 'study', 'research', 'data', 'statistics', 'according to',
  'survey', 'report', 'analysis', 'found', 'shows', 'indicates', 'reveals'
];
const factualCount = factualWords.filter(word => text.includes(word)).length;
return Math.min(100, factualCount * 15);
```

**Problem**: Only 7 matches needed for 100% (7 × 15 = 105)
**Reality**: Any research-oriented page easily has these words
**Assessment**: ⚠️ GENEROUS - Should be rate-based not count-based

**Recommendation**:
- Calculate density as factual markers per 100 words
- Require actual data/numbers, not just words about data
- Look for specific statistics (numbers + % or units)
- Target: Only heavily data-driven content >80%

---

### 5. **Schema Markup** (87-95% on sites WITH schema, but hasSchema = undefined!)
**Current Logic:**
```typescript
let score = 0;
if (schemaCount > 0) score += 50;
if (schemaCount > 2) score += 20;
if (schemaCount > 4) score += 20;

// Check content for schema types
if (schemaContent.includes('organization')) score += 10;
if (schemaContent.includes('article')) score += 10;
// ... etc
```

**Problems**:
1. Schema IS being crawled but NOT parsed (@graph not handled)
2. Still giving 50-90% scores despite hasSchema = undefined
3. String matching on raw JSON instead of parsing types

**Assessment**: 🔴 BROKEN - Complete disconnect between crawl and analysis

**Recommendation**:
- Fix @graph parsing in analyzeSchemaAnalysis()
- Extract actual @type values from parsed JSON
- Score based on parsed types, not string matching
- 0% if no schema, progressive scores for valuable types
- Target: Clear 0% vs 60%+ distinction

---

### 6. **Alt Text** (100% on multiple sites)
**Current Logic:** (need to check)

**Assessment**: ⚠️ LIKELY TOO GENEROUS based on test results

---

## ✅ LOGIC THAT SEEMS REASONABLE

### Content Quality Scores (Generally Low: 10-35%)
- These appear properly calibrated
- Low scores match reality of most sites
- ✅ Keep current thresholds

### E-E-A-T Signals (Varied: 3-90%)
- Good range across different site types
- Law firm scored low (3%) - appropriate
- Agency scored high (64-67%) - reasonable
- ✅ Appears well-calibrated

### Mobile Optimization (88-94% range)
- Most modern sites ARE mobile-optimized
- High scores are justified
- ✅ Reasonable for 2025 web

---

## 📊 OVERALL SCORE CALCULATION

Currently averaging components:
- Problem: Broken/overly generous sub-scores inflate total
- With fixed sub-scores, overall should naturally decrease

**Current**: 84.4% average
**Target**: 70-75% average
**Gap**: ~12% reduction needed

**Will likely achieve through**:
1. Fix schema (will drop many sites 10-20%)
2. Fix entity recognition (will drop 15-20%)
3. Fix link quality (will drop 10-15%)
4. Fix Q&A format (will drop 10-20%)

Cumulative effect should bring average down ~10-15%.

---

## 🎯 PROPOSED FIX PRIORITIES

### Priority 1: CRITICAL (Must Fix)
1. **Schema @graph parsing** - Completely broken
2. **Entity Recognition** - 100% on every site
3. **Link Quality** - 100% on 89% of sites

### Priority 2: HIGH (Should Fix)
4. **Q&A Format** - 100% on 78% of sites
5. **Factual Density** - Logic is count-based not rate-based

### Priority 3: MEDIUM (Review)
6. **Alt Text** - Check if too generous
7. **Semantic Clarity** - Review formula

---

## ❓ QUESTIONS FOR REVIEW

1. **Entity Recognition**: Do we even want this metric? Or should we replace with something more meaningful?

2. **Link Quality**: What's the right balance? Internal linking is important for SEO, but how much is "good"?

3. **Q&A Format**: Should this be binary (has FAQ/doesn't have FAQ) or graduated?

4. **Overall Weighting**: Are the 6 categories weighted appropriately?
   - AI Optimization: Current weight in overall?
   - Content Quality: Current weight?
   - etc.

5. **Grade Distribution Philosophy**: What % of sites should score:
   - 90-100%: __% (currently 33%)
   - 80-89%: __% (currently ?)
   - 70-79%: __% (currently ?)
   - Below 70%: __% (currently ?)

---

## 📝 NEXT STEPS

1. **Review & Approve**: Confirm these assessments are correct
2. **Set Target Distribution**: Agree on grade curve
3. **Implement Fixes**: Make calibration adjustments
4. **Test**: Rerun calibration suite
5. **Iterate**: Adjust until distribution matches targets

