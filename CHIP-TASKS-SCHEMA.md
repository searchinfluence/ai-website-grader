# Enhanced Schema Detection — Task for Chip

**Repo:** ~/clawd/repos/ai-website-grader-si
**Branch:** v3-fixes
**Deploy URL:** https://ai-website-grader-si.vercel.app/

## Goal
Enhance the structured data analyzer to properly detect and score @graph arrays, microdata (itemscope/itemtype), and RDFa (typeof/property) markup — not just JSON-LD.

## Current State
- `lib/analyzer/shared.ts` → `summarizeSchema()` already handles @graph inside parsed JSON-LD blocks ✅
- `lib/analyzer/structured-data.ts` → scoring functions use regex patterns like `/"@type":\s*"organization"/i` which only match JSON-LD text, NOT microdata or RDFa
- The `analyzeSchemaPresence()` function checks for `itemtype=` and `itemscope` but only gives 10 bonus points — it doesn't extract actual microdata types
- No RDFa detection at all

## What to Build

### 1. Enhanced Type Extraction in `summarizeSchema()` (shared.ts)

Add two new extraction passes after the existing JSON-LD parsing:

**Microdata extraction:**
- Parse HTML for `itemtype="https://schema.org/..."` attributes
- Extract the schema type from the URL (e.g., `itemtype="https://schema.org/Organization"` → "Organization")
- Add these to the `types` Set just like JSON-LD types

**RDFa extraction:**
- Parse HTML for `typeof="schema:Organization"` or `typeof="Organization"` patterns
- Also check for `vocab="https://schema.org/"` context
- Extract types and add to the `types` Set

**Add new fields to SchemaSummary (types.ts):**
```typescript
microdataTypes: string[];   // Types found via microdata
rdfaTypes: string[];        // Types found via RDFa
hasGraph: boolean;          // Whether any @graph arrays were found
```

### 2. Update Scoring Functions (structured-data.ts)

**`analyzeSchemaPresence()`:**
- The existing regex patterns like `/"@type":\s*"organization"/i` should ALSO match microdata patterns: `itemtype="https://schema.org/Organization"` and RDFa patterns: `typeof="Organization"`
- Create a helper that checks all three formats for a given schema type
- Keep the same point values

**`analyzeStructuredDataCompleteness()`:**
- Same approach — check all three formats when looking for essential schemas

**`analyzeJsonLdImplementation()`:**
- Add points for microdata presence (if itemscope found, +5-10)
- Add points for RDFa presence (if typeof + vocab found, +5-10)
- Rename or add a comment that this function now covers all implementation formats

### 3. Update Findings & Recommendations

When microdata or RDFa is detected, add appropriate findings:
- "Structured data detected via microdata (itemscope/itemtype): Organization, LocalBusiness"
- "Structured data detected via RDFa markup: Organization"

If a site has microdata/RDFa but no JSON-LD, adjust the recommendation:
- Instead of "Add an Organization JSON-LD script" → "Consider migrating existing microdata to JSON-LD format for better maintainability (microdata currently detected: Organization, LocalBusiness)"

### 4. Update Stats Output

Add to the stats object in the return value:
- `microdataTypes`: array of types found via microdata
- `rdfaTypes`: array of types found via RDFa  
- `hasGraph`: boolean

## Testing

After making changes:
1. `npm run build` — must pass with no errors
2. Test mentally that a site with only microdata (e.g., `itemtype="https://schema.org/Organization"`) would now score higher than before
3. Make sure existing JSON-LD detection still works exactly the same

## Rules
- Keep changes minimal and focused
- Don't touch any other analyzers (page-seo, content-structure, technical-health)
- Commit with a clear message like "feat: enhanced schema detection — microdata, RDFa, @graph support"
- Run `npm run build` before committing

When completely finished, run this command to notify me:
openclaw system event --text "Done: Enhanced schema detection with microdata, RDFa, and @graph support" --mode now
