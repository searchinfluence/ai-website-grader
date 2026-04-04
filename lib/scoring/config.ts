export type FactorKey = 'contentStructure' | 'structuredData' | 'technicalHealth' | 'pageSEO';

export type ScoringFactorConfig = {
  key: FactorKey;
  label: string;
  weight: number;
  description: string;
};

export const SCORING_FACTORS: ScoringFactorConfig[] = [
  {
    key: 'contentStructure',
    label: 'Content Structure',
    weight: 0.35,
    description: 'Heading hierarchy, content depth, FAQ/Q&A structure, internal linking, alt text, readability, and content-to-code ratio.'
  },
  {
    key: 'structuredData',
    label: 'Structured Data',
    weight: 0.25,
    description: 'JSON-LD presence, schema quality, Open Graph, social metadata, and rich snippet eligibility.'
  },
  {
    key: 'technicalHealth',
    label: 'Technical Health',
    weight: 0.20,
    description: 'HTTPS, Core Web Vitals, crawlability, canonical/hreflang setup, viewport, responsiveness, and speed.'
  },
  {
    key: 'pageSEO',
    label: 'Page SEO',
    weight: 0.20,
    description: 'Title/meta quality, H1 usage, URL quality, and image optimization.'
  }
];
