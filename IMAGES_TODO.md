# Resource Images - Quick Setup Guide

You have the actual images! You shared them in the conversation:
1. AI Search Research Study (light background with robot and student)
2. SEO Fundamentals Workbook (orange background with open book)
3. Custom SEO Roadmap (dark teal background with mobile device)

## Quick Setup (2 minutes):

### Option 1: Extract from PDF
1. Open: `/Users/willscott/Downloads/MEMS_ AI Website Grader Page Content Updates.pdf`
2. Take screenshots of pages 2, 3, and 4 (just the image portions)
3. Save as:
   - `public/images/ai-search-research-study.png`
   - `public/images/seo-fundamentals-workbook.png`
   - `public/images/custom-seo-roadmap.png`

### Option 2: Request from Marketing
Ask your marketing team for the three individual image files they showed in the PDF.

### Option 3: Use Composite Image
The file `/Users/willscott/Downloads/AI Website Grader CTA.png` shows all three cards together.
You could:
1. Open it in Preview/Photoshop
2. Crop each card individually
3. Save as the three separate files above

## After Saving Images:

Update `components/ResourcesSection.tsx` line 8, 16, 24:

```typescript
// Change from data URIs to:
image: '/images/ai-search-research-study.png',
image: '/images/seo-fundamentals-workbook.png',
image: '/images/custom-seo-roadmap.png',
```

## Current Status:
✅ Code is implemented with SVG placeholders
✅ Components are fully functional
✅ Just need to swap in real images

The placeholders look professional, so you can launch with them if needed!
