# Resource Images

This directory contains images for the "Get More AI Search Insights" resource cards.

## Current Status

The ResourcesSection component currently uses **inline SVG placeholders** with gradient backgrounds. These placeholders match the color scheme from the marketing PDF:
- Card 1 (AI Search Research): Blue gradient
- Card 2 (SEO Workbook): Orange gradient
- Card 3 (Custom Roadmap): Teal gradient

## How to Replace with Real Images

### Option 1: Add Image Files Here

1. Get the actual images from your marketing team (from the PDF on pages 2-4)
2. Save them in this directory with these names:
   - `ai-search-research-study.jpg` (or .png)
   - `seo-fundamentals-workbook.jpg` (or .png)
   - `custom-seo-roadmap.jpg` (or .png)

3. Update `components/ResourcesSection.tsx` to use file paths instead of data URIs:

```typescript
const resources = [
  {
    image: '/images/ai-search-research-study.jpg',  // Change this
    title: '2025 AI Search in Higher Education Research Study',
    // ... rest stays the same
  },
  // ... etc
];
```

### Option 2: Extract from PDF

1. Open `/Users/willscott/Downloads/MEMS_ AI Website Grader Page Content Updates.pdf`
2. Take screenshots of the images on pages 2, 3, and 4
3. Crop to approximately 360x240px (or any 3:2 aspect ratio)
4. Save as described in Option 1 above

### Option 3: Keep Placeholders

The current SVG placeholders look professional and match your design system. You can keep them if you prefer a more minimalist look!

## Image Specifications

- **Recommended size**: 720x480px (2x for retina displays)
- **Aspect ratio**: 3:2
- **Format**: JPG or PNG
- **Optimization**: Use tools like TinyPNG to keep file size under 100KB each

## Next.js Image Optimization

The `ResourceCard` component uses Next.js `<Image>` component which automatically:
- Optimizes images on-demand
- Serves WebP format when supported
- Lazy loads images as users scroll
- Prevents layout shift with proper sizing
