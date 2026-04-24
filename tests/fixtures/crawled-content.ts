import { CrawledContent } from '@/types';

export function buildCrawledContent(overrides: Partial<CrawledContent> = {}): CrawledContent {
  const base: CrawledContent = {
    title: 'Example Page Title — A Solid Default Length',
    metaDescription:
      'A sensible meta description that is between fifty and one hundred and sixty characters in length to satisfy SEO defaults.',
    headings: [
      { level: 1, text: 'Welcome to the Example' },
      { level: 2, text: 'Why this works' },
      { level: 2, text: 'How does it work?' },
      { level: 3, text: 'Implementation details' },
    ],
    paragraphs: Array.from({ length: 6 }, (_, i) =>
      `This is paragraph number ${i + 1}. It contains a useful sentence that scores reasonably for readability and adds words to the body.`,
    ),
    images: [
      { src: '/img/hero.jpg', alt: 'Hero image describing the page topic' },
      { src: '/img/diagram.png', alt: 'Diagram showing the workflow' },
    ],
    links: [
      { href: '/about', text: 'About', internal: true },
      { href: '/pricing', text: 'Pricing', internal: true },
      { href: 'https://external.example.com/study', text: 'External study', internal: false },
    ],
    wordCount: 600,
    html: '<!doctype html><html><head><title>Example</title></head><body><h1>Welcome</h1><p>Example body.</p></body></html>',
    url: 'https://example.com/path/page',
    schemaMarkup: [
      JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'Organization',
        name: 'Example',
      }),
    ],
    hasJavaScriptDependency: false,
    mobileInfo: {
      hasViewportMeta: true,
      viewportContent: 'width=device-width, initial-scale=1',
      hasTouchableElements: true,
      usesResponsiveImages: true,
      mobileOptimizedCSS: true,
    },
    enhancedSchemaInfo: {
      jsonLdCount: 1,
      microdataCount: 0,
      rdfaCount: 0,
      schemaTypes: ['Organization'],
      validationErrors: [],
      aiFriendlySchemas: [],
      conversationalElements: 0,
    },
    robotsInfo: {
      hasRobotsTxt: true,
      allowsAllBots: true,
      hasSpecificBotRules: false,
      content: 'User-agent: *\nAllow: /',
    },
    loadTime: 1500,
  };

  return { ...base, ...overrides };
}
