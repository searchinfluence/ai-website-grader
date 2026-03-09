#!/usr/bin/env node

function clamp(value, min = 0, max = 100) {
  return Math.max(min, Math.min(max, Math.round(value)));
}

const FACTOR_WEIGHTS = {
  contentStructure: 0.15,
  structuredData: 0.22,
  technicalHealth: 0.45,
  pageSEO: 0.18,
};

function analyzeContentStructure(content) {
  const words = content.wordCount;
  const h1Count = content.headings.filter((heading) => heading.level === 1).length;
  const headingJumps = content.headings.reduce((count, heading, index) => {
    if (index === 0) return count;
    return heading.level - content.headings[index - 1].level > 1 ? count + 1 : count;
  }, 0);
  const questionHeadings = content.headings.filter((heading) => heading.text.includes('?')).length;
  const faqIndicators = content.headings.filter((heading) => /faq|frequently asked/i.test(heading.text)).length;
  const totalLinks = content.links.length;
  const internalLinks = content.links.filter((link) => link.internal).length;
  const totalImages = content.images.length;
  const imagesMissingAlt = content.images.filter((image) => !image.alt || !image.alt.trim()).length;
  const altCoverage = totalImages === 0 ? 100 : ((totalImages - imagesMissingAlt) / totalImages) * 100;
  const sentenceCount = Math.max(1, (content.text.match(/[.!?]+/g) || []).length);
  const wordsPerSentence = words / sentenceCount;
  const readabilityScore = clamp(100 - Math.max(0, Math.abs(wordsPerSentence - 18) * 4));
  const contentToCodeRatio = content.htmlLength > 0 ? content.text.length / content.htmlLength : 0;

  const headingScore = clamp((h1Count === 1 ? 80 : h1Count === 0 ? 30 : 45) - headingJumps * 10 + Math.min(content.headings.length, 6) * 3);
  const wordScore = clamp(words >= 1200 ? 95 : words >= 900 ? 85 : words >= 600 ? 70 : words >= 400 ? 55 : words >= 250 ? 40 : 25);
  const faqScore = clamp((questionHeadings >= 3 ? 55 : questionHeadings * 12) + (faqIndicators > 0 ? 30 : 0));
  const internalLinkScore = clamp(internalLinks >= 15 ? 100 : internalLinks >= 12 ? 88 : internalLinks >= 8 ? 72 : internalLinks >= 5 ? 52 : internalLinks >= 2 ? 32 : 15);
  const altTextScore = clamp(altCoverage >= 98 ? 100 : altCoverage >= 95 ? 86 : altCoverage >= 90 ? 64 : altCoverage >= 80 ? 38 : 15);
  const ratioScore = clamp(contentToCodeRatio >= 0.2 ? 95 : contentToCodeRatio >= 0.15 ? 80 : contentToCodeRatio >= 0.1 ? 60 : contentToCodeRatio >= 0.06 ? 40 : 20);

  return clamp(
    headingScore * 0.2 +
    wordScore * 0.2 +
    faqScore * 0.12 +
    internalLinkScore * 0.16 +
    altTextScore * 0.16 +
    readabilityScore * 0.1 +
    ratioScore * 0.06
  );
}

function analyzeStructuredData(content) {
  const schema = content.schema;
  const typeScore = schema.schemaTypes.length > 0 ? clamp(52 + Math.min(schema.schemaTypes.length, 6) * 3) : 10;
  const presenceScore = schema.jsonLdCount > 0 ? clamp(60 + schema.validBlocks * 3) : 10;
  const completenessCount = [schema.hasOrganization, schema.hasFaqPage, schema.hasHowTo, schema.hasArticle, schema.hasProductOrService].filter(Boolean).length;
  const completenessScore = completenessCount > 0 ? clamp(46 + completenessCount * 3) : 12;
  const socialMetaScore = content.hasOpenGraph && content.hasTwitter ? 95 : content.hasOpenGraph || content.hasTwitter ? 65 : 20;
  const richSnippetScore = clamp(
    42 +
    (schema.hasFaqPage ? 3 : 0) +
    (schema.hasHowTo ? 3 : 0) +
    (schema.hasArticle ? 2 : 0) +
    (schema.hasProductOrService ? 2 : 0)
  );

  return clamp(
    presenceScore * 0.34 +
    typeScore * 0.16 +
    completenessScore * 0.16 +
    socialMetaScore * 0.2 +
    richSnippetScore * 0.14
  );
}

function analyzeTechnicalHealth(content) {
  const metrics = content.performanceMetrics;
  const speedFromVitals = clamp(metrics.coreWebVitals.score);
  const loadTimeMs = content.loadTime;
  const speedFromLoadTime = clamp(loadTimeMs <= 1800 ? 95 : loadTimeMs <= 2500 ? 80 : loadTimeMs <= 4000 ? 60 : loadTimeMs <= 5500 ? 45 : 30);
  const accessibilityScore = metrics.accessibilityScore;
  const normalizedAccessibilityScore = clamp(accessibilityScore >= 90 ? 100 : accessibilityScore >= 85 ? 85 : accessibilityScore >= 80 ? 72 : accessibilityScore >= 70 ? 55 : accessibilityScore >= 60 ? 35 : 15);
  const htmlValidation = metrics.htmlValidation;
  const htmlValidationScore = clamp(
    (htmlValidation.errors === 0
      ? 100
      : htmlValidation.errors <= 2
        ? 78
        : htmlValidation.errors <= 5
          ? 52
          : htmlValidation.errors <= 10
            ? 30
            : 10) - Math.min(16, htmlValidation.warnings * 2)
  );
  const coreWebVitals = metrics.coreWebVitals;
  const lcpScore = clamp(coreWebVitals.lcp <= 2500 ? 100 : coreWebVitals.lcp <= 4000 ? 70 : coreWebVitals.lcp <= 5000 ? 42 : 18);
  const fidScore = clamp(coreWebVitals.fid <= 100 ? 100 : coreWebVitals.fid <= 200 ? 72 : coreWebVitals.fid <= 300 ? 48 : 20);
  const clsScore = clamp(coreWebVitals.cls <= 0.1 ? 100 : coreWebVitals.cls <= 0.2 ? 68 : coreWebVitals.cls <= 0.25 ? 44 : 18);
  const coreWebVitalsPenalty =
    (coreWebVitals.lcp > 4000 ? 8 : 0) +
    (coreWebVitals.fid > 200 ? 8 : 0) +
    (coreWebVitals.cls > 0.1 ? 6 : 0) +
    (speedFromVitals < 75 ? 6 : 0);
  const adjustedCoreWebVitalsScore = clamp(
    speedFromVitals * 0.4 +
    lcpScore * 0.25 +
    fidScore * 0.2 +
    clsScore * 0.15 -
    coreWebVitalsPenalty
  );

  return clamp(
    (content.isHttps ? 100 : 20) * 0.1 +
    (content.robotsPresent ? (content.allowsBots ? 95 : 60) : 40) * 0.13 +
    (content.hasSitemapHint ? 90 : 45) * 0.09 +
    (content.hasCanonical ? 95 : 40) * 0.1 +
    (content.hasHreflang ? 75 : 60) * 0.03 +
    (content.hasViewport ? 95 : 35) * 0.12 +
    (content.hasResponsiveCss ? 85 : 40) * 0.08 +
    adjustedCoreWebVitalsScore * 0.14 +
    speedFromLoadTime * 0.07 +
    htmlValidationScore * 0.07 +
    normalizedAccessibilityScore * 0.07
  );
}

function analyzePageSeo(content) {
  const titleLength = content.title.length;
  const descriptionLength = content.metaDescription.length;
  const h1Count = content.headings.filter((heading) => heading.level === 1).length;
  const pathDepth = content.path.split('/').filter(Boolean).length;
  const hasQuery = content.path.includes('?');
  const pathIsClean = /^\/[a-z0-9\-\/]*$/.test(content.path);
  const totalImages = content.images.length;
  const webpImages = content.images.filter((image) => image.src.endsWith('.webp')).length;
  const optimizedImageRatio = totalImages === 0 ? 1 : webpImages / totalImages;
  const imagesMissingAlt = content.images.filter((image) => !image.alt || !image.alt.trim()).length;

  const titleScore = clamp(titleLength >= 30 && titleLength <= 60 ? 100 : titleLength >= 20 && titleLength <= 70 ? 74 : titleLength > 0 ? 38 : 8);
  const descriptionScore = clamp(descriptionLength >= 120 && descriptionLength <= 160 ? 100 : descriptionLength >= 90 && descriptionLength <= 175 ? 72 : descriptionLength > 0 ? 35 : 8);
  const h1Score = clamp(h1Count === 1 ? 100 : h1Count === 0 ? 5 : 18);
  const urlScore = clamp((pathIsClean ? 70 : 40) + (pathDepth <= 3 ? 20 : 10) + (hasQuery ? 0 : 10));
  const imageScore = clamp(totalImages === 0 ? 80 : (100 - (imagesMissingAlt / totalImages) * 100) * 0.7 + optimizedImageRatio * 30);

  return clamp(
    titleScore * 0.21 +
    descriptionScore * 0.21 +
    h1Score * 0.18 +
    urlScore * 0.2 +
    imageScore * 0.2
  );
}

function overallScore(scores) {
  return clamp(
    scores.contentStructure * FACTOR_WEIGHTS.contentStructure +
    scores.structuredData * FACTOR_WEIGHTS.structuredData +
    scores.technicalHealth * FACTOR_WEIGHTS.technicalHealth +
    scores.pageSEO * FACTOR_WEIGHTS.pageSEO
  );
}

function repeatSentence(sentence, count) {
  return Array.from({ length: count }, () => sentence).join(' ');
}

const fixtures = [
  {
    key: 'searchinfluence.com',
    target: '70-85',
    notes: 'Representative service page fixture: long-form content, strong internal linking, valid schema, good technical setup.',
    title: 'Higher Education SEO Services | Search Influence',
    metaDescription: 'Search Influence helps higher education teams improve SEO visibility with technical audits, content strategy, schema guidance, and enrollment-focused reporting.',
    path: '/services/higher-education-seo/',
    headings: [
      { level: 1, text: 'Higher Education SEO' },
      { level: 2, text: 'Why higher ed SEO matters' },
      { level: 2, text: 'What students search for' },
      { level: 2, text: 'How we build enrollment-focused content' },
      { level: 3, text: 'Technical audits' },
      { level: 3, text: 'Content production' },
      { level: 2, text: 'Reporting and measurement' },
    ],
    links: Array.from({ length: 28 }, (_, index) => ({ internal: true, href: `/internal-${index}`, text: `Internal ${index}` }))
      .concat(Array.from({ length: 4 }, (_, index) => ({ internal: false, href: `https://external-${index}.test`, text: `External ${index}` }))),
    images: [
      { src: '/hero.webp', alt: 'Students reviewing search performance data' },
      { src: '/team.webp', alt: 'Search Influence strategy workshop' },
      { src: '/chart.jpg', alt: 'Higher education organic traffic growth chart' },
      { src: '/audit.jpg', alt: 'SEO audit presentation slide' },
    ],
    wordCount: 1680,
    text: repeatSentence('Search Influence builds higher education SEO programs with detailed audits, content strategy, schema implementation, and reporting for enrollment teams.', 90),
    htmlLength: 21000,
    schema: {
      jsonLdCount: 2,
      validBlocks: 2,
      schemaTypes: ['Organization', 'Service', 'Article'],
      hasOrganization: true,
      hasFaqPage: false,
      hasHowTo: false,
      hasArticle: true,
      hasProductOrService: true,
    },
    hasOpenGraph: true,
    hasTwitter: true,
    isHttps: true,
    robotsPresent: true,
    allowsBots: true,
    hasSitemapHint: true,
    hasCanonical: true,
    hasHreflang: false,
    hasViewport: true,
    hasResponsiveCss: true,
    loadTime: 2600,
    performanceMetrics: {
      accessibilityScore: 88,
      htmlValidation: { errors: 1, warnings: 3 },
      coreWebVitals: { lcp: 3100, fid: 110, cls: 0.11, score: 76 },
    },
  },
  {
    key: 'google.com',
    target: '60-75',
    notes: 'Representative homepage fixture: thin content and weak on-page SEO, but exceptional technical quality and strong crawlability.',
    title: 'Google',
    metaDescription: '',
    path: '/',
    headings: [],
    links: Array.from({ length: 9 }, (_, index) => ({ internal: true, href: `/nav-${index}`, text: `Nav ${index}` })),
    images: [{ src: '/googlelogo_color_272x92dp.png', alt: 'Google' }],
    wordCount: 110,
    text: repeatSentence('Google makes search, maps, and productivity tools available through a very lightweight homepage experience.', 8),
    htmlLength: 12000,
    schema: {
      jsonLdCount: 1,
      validBlocks: 1,
      schemaTypes: ['WebSite'],
      hasOrganization: false,
      hasFaqPage: false,
      hasHowTo: false,
      hasArticle: false,
      hasProductOrService: false,
    },
    hasOpenGraph: false,
    hasTwitter: false,
    isHttps: true,
    robotsPresent: true,
    allowsBots: true,
    hasSitemapHint: true,
    hasCanonical: true,
    hasHreflang: false,
    hasViewport: true,
    hasResponsiveCss: true,
    loadTime: 1200,
    performanceMetrics: {
      accessibilityScore: 94,
      htmlValidation: { errors: 0, warnings: 1 },
      coreWebVitals: { lcp: 1100, fid: 20, cls: 0.01, score: 98 },
    },
  },
  {
    key: 'example.com',
    target: '<50',
    notes: 'Representative minimal brochure page fixture: almost no content depth, no schema, and barebones technical implementation.',
    title: 'Example Domain',
    metaDescription: '',
    path: '/',
    headings: [{ level: 1, text: 'Example Domain' }],
    links: [{ internal: false, href: 'https://iana.org/domains/example', text: 'Learn more' }],
    images: [],
    wordCount: 18,
    text: 'This domain is reserved for illustrative examples in documents.',
    htmlLength: 4200,
    schema: {
      jsonLdCount: 0,
      validBlocks: 0,
      schemaTypes: [],
      hasOrganization: false,
      hasFaqPage: false,
      hasHowTo: false,
      hasArticle: false,
      hasProductOrService: false,
    },
    hasOpenGraph: false,
    hasTwitter: false,
    isHttps: true,
    robotsPresent: false,
    allowsBots: true,
    hasSitemapHint: false,
    hasCanonical: false,
    hasHreflang: false,
    hasViewport: false,
    hasResponsiveCss: false,
    loadTime: 2200,
    performanceMetrics: {
      accessibilityScore: 68,
      htmlValidation: { errors: 4, warnings: 1 },
      coreWebVitals: { lcp: 1800, fid: 45, cls: 0.04, score: 82 },
    },
  },
];

let hasFailure = false;

for (const fixture of fixtures) {
  const scores = {
    contentStructure: analyzeContentStructure(fixture),
    structuredData: analyzeStructuredData(fixture),
    technicalHealth: analyzeTechnicalHealth(fixture),
    pageSEO: analyzePageSeo(fixture),
  };
  const total = overallScore(scores);
  const inRange =
    fixture.key === 'searchinfluence.com' ? total >= 70 && total <= 85 :
    fixture.key === 'google.com' ? total >= 60 && total <= 75 :
    total < 50;

  if (!inRange) hasFailure = true;

  console.log(`\n${fixture.key}`);
  console.log(`  target: ${fixture.target}`);
  console.log(`  score:  ${total}`);
  console.log(`  factors: ${Object.entries(scores).map(([key, value]) => `${key}=${value}`).join(', ')}`);
  console.log(`  status: ${inRange ? 'PASS' : 'FAIL'}`);
  console.log(`  notes:  ${fixture.notes}`);
}

if (hasFailure) {
  process.exitCode = 1;
}
