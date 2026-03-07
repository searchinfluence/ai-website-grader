import { CrawledContent, RecommendationItem } from '@/types';
import { SCORING_FACTORS } from '@/lib/scoring/config';
import { FactorResult } from './types';
import { clamp, summarizeSchema, toStatus } from './shared';

export function analyzeStructuredData(content: CrawledContent): FactorResult {
  const findings: string[] = [];
  const recommendations: RecommendationItem[] = [];
  const hostLabel = content.url === 'manual-input' ? 'this content input' : new URL(content.url).hostname;

  const schema = summarizeSchema(content);
  const html = content.html.toLowerCase();
  const hasOpenGraph = html.includes('property="og:') || html.includes("property='og:");
  const hasTwitter = html.includes('name="twitter:') || html.includes("name='twitter:");
  const schemaPresence = analyzeSchemaPresence(content, schema, hasOpenGraph, hasTwitter);
  const schemaValidation = analyzeSchemaValidation(content);
  const richSnippetPotential = analyzeRichSnippetPotential(content, schema);
  const structuredDataCompleteness = analyzeStructuredDataCompleteness(content, schema);
  const jsonLdImplementation = analyzeJsonLdImplementation(content, schema, hasOpenGraph, hasTwitter);

  const score = clamp(
    (schemaPresence + schemaValidation + richSnippetPotential + structuredDataCompleteness + jsonLdImplementation) / 5
  );

  if (schema.jsonLdCount === 0) {
    findings.push('No JSON-LD schema blocks detected.');
    recommendations.push({
      text: `Add an Organization JSON-LD script on ${hostLabel} (currently 0 JSON-LD blocks).`,
      priority: 'high',
      category: 'schema',
      timeToImplement: '~30 min',
      codeExample: `<script type="application/ld+json">{"@context":"https://schema.org","@type":"Organization","name":"Your Organization","url":"https://example.com"}</script>`
    });
  }

  if (content.gtmSchemaDetected) {
    findings.push('Structured data detected via Google Tag Manager (injected at runtime).');
  }

  if (!schema.hasFaqPage) {
    findings.push('FAQPage/QAPage schema not detected for FAQ-style content eligibility.');
    recommendations.push({
      text: `Add FAQPage schema on ${hostLabel} for question-and-answer sections to improve rich-result eligibility (currently 0 FAQPage schemas detected).`,
      priority: 'medium',
      category: 'schema-faq',
      timeToImplement: '~1 hour',
      codeExample: `<script type="application/ld+json">{"@context":"https://schema.org","@type":"FAQPage","mainEntity":[{"@type":"Question","name":"Question?","acceptedAnswer":{"@type":"Answer","text":"Answer."}}]}</script>`
    });
  }

  if (!hasOpenGraph || !hasTwitter) {
    findings.push(`Social metadata is incomplete (Open Graph: ${hasOpenGraph ? 'present' : 'missing'}, Twitter cards: ${hasTwitter ? 'present' : 'missing'}).`);
    recommendations.push({
      text: `Add missing social tags on ${hostLabel}: ${hasOpenGraph ? '' : 'og:title, og:description, og:image'}${!hasOpenGraph && !hasTwitter ? ' and ' : ''}${hasTwitter ? '' : 'twitter:card, twitter:title, twitter:description'}.`,
      priority: 'medium',
      category: 'social-meta',
      timeToImplement: '~30 min'
    });
  }

  if (schema.validBlocks < schema.totalBlocks) {
    findings.push(`${schema.totalBlocks - schema.validBlocks} of ${schema.totalBlocks} JSON-LD blocks failed JSON parsing.`);
    recommendations.push({
      text: `Fix ${schema.totalBlocks - schema.validBlocks} invalid JSON-LD block(s) on ${hostLabel} so all structured data parses cleanly.`,
      priority: 'high',
      category: 'schema-validation',
      timeToImplement: '~1 hour'
    });
  }

  return {
    key: 'structuredData',
    label: 'Structured Data',
    weight: SCORING_FACTORS.find((factor) => factor.key === 'structuredData')!.weight,
    score,
    status: toStatus(score),
    findings,
    recommendations,
    stats: {
      jsonLdCount: schema.jsonLdCount,
      validSchemaBlocks: schema.validBlocks,
      schemaTypeCount: schema.schemaTypes.length,
      schemaTypes: schema.schemaTypes,
      hasOpenGraph,
      hasTwitter,
      richSnippetEligible: schema.hasFaqPage || schema.hasHowTo || schema.hasArticle || schema.hasProductOrService,
      schemaPresence,
      schemaValidation,
      richSnippetPotential,
      structuredDataCompleteness,
      jsonLdImplementation
    }
  };
}

const SCHEMA_PRESENCE_PATTERNS = [
  { pattern: /"@type":\s*"organization"/i, points: 25 },
  { pattern: /"@type":\s*"service"/i, points: 20 },
  { pattern: /"@type":\s*"faqpage"/i, points: 20 },
  { pattern: /"@type":\s*"localbusiness"/i, points: 20 },
  { pattern: /"@type":\s*"webpage"/i, points: 15 },
  { pattern: /"@type":\s*"breadcrumblist"/i, points: 15 },
  { pattern: /"@type":\s*"article"/i, points: 15 },
  { pattern: /"@type":\s*"website"/i, points: 15 },
  { pattern: /"@type":\s*"person"/i, points: 10 },
  { pattern: /"@type":\s*"review"/i, points: 10 },
  { pattern: /"@type":\s*"howto"/i, points: 10 }
] as const;

function analyzeSchemaPresence(
  content: CrawledContent,
  schema: ReturnType<typeof summarizeSchema>,
  hasOpenGraph: boolean,
  hasTwitter: boolean
): number {
  let score = 0;
  const html = content.html.toLowerCase();

  SCHEMA_PRESENCE_PATTERNS.forEach((schemaType) => {
    if (schemaType.pattern.test(html)) {
      score += schemaType.points;
    }
  });

  if (html.includes('application/ld+json')) score += 20;
  if (html.includes('itemtype=') || html.includes('itemscope')) score += 10;

  if (schema.jsonLdCount > 0) score += 10;
  if (schema.jsonLdCount > 2) score += 10;
  if (schema.jsonLdCount > 4) score += 10;

  if (hasOpenGraph) score += 7;
  if (hasTwitter) score += 7;

  return clamp(score);
}

function analyzeSchemaValidation(content: CrawledContent): number {
  let score = 80;
  const validationErrors = content.enhancedSchemaInfo?.validationErrors ?? [];

  if (validationErrors.length > 0) {
    score -= Math.min(60, validationErrors.length * 5);
  }

  let validJsonLd = 0;
  content.schemaMarkup.forEach((schemaBlock) => {
    try {
      JSON.parse(schemaBlock);
      validJsonLd += 1;
    } catch {
      score -= 10;
    }
  });

  if (validJsonLd > 0) {
    score += Math.min(20, validJsonLd * 5);
  }

  const html = content.html.toLowerCase();
  if (/"@type":\s*"organization"/i.test(html)) {
    if (/"name"\s*:/i.test(html)) score += 5;
    if (/"url"\s*:/i.test(html)) score += 5;
  }
  if (/"@type":\s*"service"/i.test(html)) {
    if (/"name"\s*:/i.test(html)) score += 5;
    if (/"description"\s*:/i.test(html)) score += 5;
  }

  return clamp(score);
}

function analyzeRichSnippetPotential(content: CrawledContent, schema: ReturnType<typeof summarizeSchema>): number {
  let score = 40;
  const html = content.html.toLowerCase();
  const richSnippetPatterns = [
    { pattern: /"@type":\s*"faqpage"/i, points: 20 },
    { pattern: /"@type":\s*"review"/i, points: 15 },
    { pattern: /"@type":\s*"howto"/i, points: 15 },
    { pattern: /"@type":\s*"recipe"/i, points: 15 },
    { pattern: /"@type":\s*"event"/i, points: 15 },
    { pattern: /"@type":\s*"product"/i, points: 15 },
    { pattern: /"@type":\s*"article"/i, points: 10 },
    { pattern: /"@type":\s*"organization"/i, points: 10 },
    { pattern: /"@type":\s*"service"/i, points: 10 }
  ];

  richSnippetPatterns.forEach((item) => {
    if (item.pattern.test(html)) score += item.points;
  });

  if (schema.hasFaqPage) score += 12;
  if (schema.hasHowTo) score += 10;
  if (schema.hasArticle) score += 8;
  if (schema.hasProductOrService) score += 8;

  if (html.includes('faq') || html.includes('question')) score += 10;
  if (html.includes('review') || html.includes('rating')) score += 10;
  if (html.includes('how to') || html.includes('step')) score += 10;
  if (html.includes('price') || html.includes('cost')) score += 5;
  if (html.includes('contact') || html.includes('phone')) score += 5;

  return clamp(score);
}

function analyzeStructuredDataCompleteness(content: CrawledContent, schema: ReturnType<typeof summarizeSchema>): number {
  let score = 50;
  const html = content.html.toLowerCase();
  const essentialSchemas = [
    { pattern: /"@type":\s*"organization"/i, points: 20 },
    { pattern: /"@type":\s*"website"/i, points: 15 },
    { pattern: /"@type":\s*"webpage"/i, points: 15 },
    { pattern: /"@type":\s*"breadcrumblist"/i, points: 15 },
    { pattern: /"@type":\s*"service"/i, points: 15 },
    { pattern: /"@type":\s*"person"/i, points: 10 },
    { pattern: /"@type":\s*"article"/i, points: 10 }
  ];

  essentialSchemas.forEach((item) => {
    if (item.pattern.test(html)) score += item.points;
  });

  if (schema.hasOrganization) score += 10;
  if (schema.hasFaqPage) score += 8;
  if (schema.hasHowTo) score += 8;
  if (schema.hasArticle) score += 8;
  if (schema.hasProductOrService) score += 8;

  if (/"@type":\s*"organization"/i.test(html)) {
    if (/"name"\s*:/i.test(html)) score += 5;
    if (/"url"\s*:/i.test(html)) score += 5;
    if (/"logo"\s*:/i.test(html)) score += 5;
  }

  if (/"@type":\s*"service"/i.test(html)) {
    if (/"name"\s*:/i.test(html)) score += 5;
    if (/"description"\s*:/i.test(html)) score += 5;
  }

  if (schema.jsonLdCount > 0) score += 5;
  if (schema.jsonLdCount > 2) score += 5;

  return clamp(score);
}

function analyzeJsonLdImplementation(
  content: CrawledContent,
  schema: ReturnType<typeof summarizeSchema>,
  hasOpenGraph: boolean,
  hasTwitter: boolean
): number {
  let score = 50;
  const html = content.html.toLowerCase();

  if (html.includes('application/ld+json')) score += 30;

  const headEndIndex = html.indexOf('</head>');
  const headSection = headEndIndex >= 0 ? html.substring(0, headEndIndex + 7) : html;
  if (headSection.includes('application/ld+json')) score += 20;

  if (schema.validBlocks > 0) {
    score += Math.min(20, schema.validBlocks * 5);
  }

  const microdataCount = content.enhancedSchemaInfo?.microdataCount || 0;
  if (schema.validBlocks > microdataCount) {
    score += 10;
  }

  if (hasOpenGraph && hasTwitter) {
    score += 10;
  } else if (hasOpenGraph || hasTwitter) {
    score += 5;
  }

  return clamp(score);
}
