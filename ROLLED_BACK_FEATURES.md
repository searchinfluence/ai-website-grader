# Rolled Back Features (Nov 9, 2025)

These features were implemented but rolled back from commit `8f8930d` to `43deb05` for further development and testing.

## ✅ IMPLEMENTED (Commit 535deda)

### Analytics Migration
- **Google Tag Manager Integration**
  - Migrated from Google Analytics 4 (gtag.js) to GTM (GTM-4G43)
  - Added dataLayer event tracking for user interactions
  - Implemented GTM noscript fallback
  - Created `useGoogleTagManager` hook for event tracking
  - **Status**: ✅ Implemented and deployed

### Critical Bug Fixes
- **User-Agent Fix**
  - Added professional User-Agent header: `AI-Website-Grader/2.0 (+https://ai-grader.searchinfluence.com/; contact@searchinfluence.com)`
  - Prevents sites from blocking the crawler
  - Applied to all HTTP requests (page fetch + robots.txt)
  - Includes contact information for transparency
  - **Status**: ✅ Implemented and deployed

## 🔄 STILL ROLLED BACK

### User Experience Improvements
- **Call-to-Action Placeholders**
  - Added CTA sections in 3 strategic locations (landing page, results page top, results page bottom)
  - Integrated GTM tracking for CTAs
  - Removed generic "Next Steps" section based on user feedback
  - **Status**: 🔄 Not yet implemented

### UI Bug Fixes
- **CTA Display Issues**
  - Fixed duplicate CTAs appearing on results page
  - Fixed CTA overflow causing horizontal scrollbar
  - **Status**: 🔄 Not yet implemented (no CTAs currently present)

### Technical Enhancements
- **Enhanced Schema Detection**
  - Added support for @graph structure in JSON-LD
  - Added microdata detection (itemscope, itemtype)
  - Added RDFa detection (typeof, property)
  - Improved recursion through nested schema structures
  - **Status**: 🔄 Not yet implemented

### Scoring System Overhaul
- **Traditional SEO Scoring Recalibration**
  - Drastically reduced point values across all metrics
  - Implemented stricter thresholds for optimal scores
  - Added penalties for poor practices
  - Title tags: Reduced from 35 to 12 points (optimal)
  - Meta descriptions: Reduced from 30 to 12 points
  - H1 structure: Added heavy penalties for 0 or multiple H1s
  - Internal linking: Now requires 15+ links for full points (was 5+)
  - Alt text: Now requires 98%+ coverage for full points (was 90%+)
  - Schema bonuses: Reduced from 8 to 2-3 points
  - **Status**: 🔄 Not yet implemented

- **Technical Performance Scoring Recalibration**
  - HTTPS: Reduced from 15 to 10 points (baseline requirement)
  - Core Web Vitals: Added penalties for poor performance
  - HTML errors: Stricter thresholds (zero errors = full points)
  - Mobile optimization: All indicators required for full points
  - Accessibility: Stricter thresholds (90+ for full points)
  - **Status**: 🔄 Not yet implemented

- **Expected Score Ranges After Recalibration**
  - Well-optimized pages: 70-80% (was 90-100%)
  - Excellent pages: 80-90% (was 95-100%)
  - Pages with issues: 50-70% (was 75-90%)
  - **Status**: 🔄 Not yet implemented

---

## Implementation Notes

**Implemented Features (Commit 535deda)**
The GTM migration and User-Agent fix have been successfully implemented and deployed. These changes address critical feedback about analytics tracking and crawler identification.

**Remaining Features**
The scoring system overhaul, enhanced schema detection, and CTA features remain rolled back pending further testing and calibration. The scoring changes in particular require validation against a broader set of test URLs to ensure accuracy and appropriate difficulty levels.
