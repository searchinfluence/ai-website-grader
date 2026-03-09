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
  const microdataTypesLabel = schema.microdataTypes.join(', ');
  const rdfaTypesLabel = schema.rdfaTypes.join(', ');
  const detectedNonJsonLdTypes = Array.from(new Set([...schema.microdataTypes, ...schema.rdfaTypes])).join(', ');

  const score = clamp(
    (schemaPresence + schemaValidation + richSnippetPotential + structuredDataCompleteness + jsonLdImplementation) / 5
  );

  if (schema.microdataTypes.length > 0) {
    findings.push(`Structured data detected via microdata (itemscope/itemtype): ${microdataTypesLabel}`);
  }

  if (schema.rdfaTypes.length > 0) {
    findings.push(`Structured data detected via RDFa markup: ${rdfaTypesLabel}`);
  }

  if (schema.jsonLdCount === 0) {
    findings.push('No JSON-LD schema blocks detected.');

    if (detectedNonJsonLdTypes.length > 0) {
      recommendations.push({
        text: `Consider migrating existing microdata/RDFa to JSON-LD format for better maintainability (currently detected types: ${detectedNonJsonLdTypes}).`,
        priority: 'high',
        category: 'schema',
        timeToImplement: '~30 min'
      });
    } else {
      recommendations.push({
        text: `Add an Organization JSON-LD script on ${hostLabel} (currently 0 JSON-LD blocks).`,
        priority: 'high',
        category: 'schema',
        timeToImplement: '~30 min',
        codeExample: `<script type="application/ld+json">{"@context":"https://schema.org","@type":"Organization","name":"Your Organization","url":"https://example.com"}</script>`
      });
    }
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
      microdataTypes: schema.microdataTypes,
      rdfaTypes: schema.rdfaTypes,
      hasGraph: schema.hasGraph,
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
  { type: 'organization', points: 3 },
  { type: 'service', points: 3 },
  { type: 'faqpage', points: 3 },
  { type: 'localbusiness', points: 3 },
  { type: 'webpage', points: 2 },
  { type: 'breadcrumblist', points: 2 },
  { type: 'article', points: 2 },
  { type: 'website', points: 2 },
  { type: 'person', points: 2 },
  { type: 'review', points: 2 },
  { type: 'howto', points: 2 }
] as const;

const escapeRegex = (value: string): string => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

function hasSchemaTypeInAnyFormat(
  html: string,
  schema: ReturnType<typeof summarizeSchema>,
  schemaType: string
): boolean {
  const normalizedType = schemaType.toLowerCase();
  if (schema.schemaTypes.some((type) => type.toLowerCase().includes(normalizedType))) {
    return true;
  }

  const escapedType = escapeRegex(schemaType);
  const jsonLdPattern = new RegExp(`"@type"\\s*:\\s*"${escapedType}"`, 'i');
  const microdataPattern = new RegExp(`itemtype\\s*=\\s*["'][^"']*schema\\.org\\/${escapedType}(?:[^"']*)["']`, 'i');
  const rdfaPattern = new RegExp(`typeof\\s*=\\s*["'][^"']*(?:schema:)?${escapedType}(?:\\s|["'])`, 'i');
  return jsonLdPattern.test(html) || microdataPattern.test(html) || rdfaPattern.test(html);
}

function analyzeSchemaPresence(
  content: CrawledContent,
  schema: ReturnType<typeof summarizeSchema>,
  hasOpenGraph: boolean,
  hasTwitter: boolean
): number {
  let score = 0;
  const html = content.html.toLowerCase();
  const hasMicrodata = schema.microdataTypes.length > 0 || html.includes('itemtype=') || html.includes('itemscope');
  const hasRdfa = schema.rdfaTypes.length > 0 || html.includes('typeof=') || html.includes('property=');

  SCHEMA_PRESENCE_PATTERNS.forEach((schemaType) => {
    if (hasSchemaTypeInAnyFormat(html, schema, schemaType.type)) {
      score += schemaType.points;
    }
  });

  if (html.includes('application/ld+json')) score += 3;
  if (hasMicrodata) score += 2;
  if (hasRdfa) score += 2;

  if (schema.jsonLdCount > 0) score += 2;
  if (schema.jsonLdCount > 2) score += 2;
  if (schema.jsonLdCount > 4) score += 1;

  if (hasOpenGraph) score += 2;
  if (hasTwitter) score += 2;

  return clamp(score);
}

function analyzeSchemaValidation(content: CrawledContent): number {
  let score = 72;
  const validationErrors = content.enhancedSchemaInfo?.validationErrors ?? [];

  if (validationErrors.length > 0) {
    score -= Math.min(50, validationErrors.length * 6);
  }

  let validJsonLd = 0;
  content.schemaMarkup.forEach((schemaBlock) => {
    try {
      JSON.parse(schemaBlock);
      validJsonLd += 1;
    } catch {
      score -= 12;
    }
  });

  if (validJsonLd > 0) {
    score += Math.min(12, validJsonLd * 3);
  }

  const html = content.html.toLowerCase();
  if (/"@type":\s*"organization"/i.test(html)) {
    if (/"name"\s*:/i.test(html)) score += 3;
    if (/"url"\s*:/i.test(html)) score += 3;
  }
  if (/"@type":\s*"service"/i.test(html)) {
    if (/"name"\s*:/i.test(html)) score += 3;
    if (/"description"\s*:/i.test(html)) score += 3;
  }

  return clamp(score);
}

function analyzeRichSnippetPotential(content: CrawledContent, schema: ReturnType<typeof summarizeSchema>): number {
  let score = 30;
  const html = content.html.toLowerCase();
  const richSnippetPatterns = [
    { pattern: /"@type":\s*"faqpage"/i, points: 10 },
    { pattern: /"@type":\s*"review"/i, points: 8 },
    { pattern: /"@type":\s*"howto"/i, points: 8 },
    { pattern: /"@type":\s*"recipe"/i, points: 8 },
    { pattern: /"@type":\s*"event"/i, points: 8 },
    { pattern: /"@type":\s*"product"/i, points: 8 },
    { pattern: /"@type":\s*"article"/i, points: 5 },
    { pattern: /"@type":\s*"organization"/i, points: 3 },
    { pattern: /"@type":\s*"service"/i, points: 3 }
  ];

  richSnippetPatterns.forEach((item) => {
    if (item.pattern.test(html)) score += item.points;
  });

  if (schema.hasFaqPage) score += 6;
  if (schema.hasHowTo) score += 5;
  if (schema.hasArticle) score += 4;
  if (schema.hasProductOrService) score += 4;

  if (html.includes('faq') || html.includes('question')) score += 5;
  if (html.includes('review') || html.includes('rating')) score += 5;
  if (html.includes('how to') || html.includes('step')) score += 5;
  if (html.includes('price') || html.includes('cost')) score += 2;
  if (html.includes('contact') || html.includes('phone')) score += 2;

  return clamp(score);
}

function analyzeStructuredDataCompleteness(content: CrawledContent, schema: ReturnType<typeof summarizeSchema>): number {
  let score = 38;
  const html = content.html.toLowerCase();
  const essentialSchemas = [
    { type: 'organization', points: 10 },
    { type: 'website', points: 8 },
    { type: 'webpage', points: 8 },
    { type: 'breadcrumblist', points: 8 },
    { type: 'service', points: 8 },
    { type: 'person', points: 4 },
    { type: 'article', points: 4 }
  ];

  essentialSchemas.forEach((item) => {
    if (hasSchemaTypeInAnyFormat(html, schema, item.type)) score += item.points;
  });

  if (schema.hasOrganization) score += 6;
  if (schema.hasFaqPage) score += 3;
  if (schema.hasHowTo) score += 3;
  if (schema.hasArticle) score += 3;
  if (schema.hasProductOrService) score += 3;

  if (hasSchemaTypeInAnyFormat(html, schema, 'organization')) {
    if (/"name"\s*:/i.test(html)) score += 3;
    if (/"url"\s*:/i.test(html)) score += 3;
    if (/"logo"\s*:/i.test(html)) score += 2;
  }

  if (hasSchemaTypeInAnyFormat(html, schema, 'service')) {
    if (/"name"\s*:/i.test(html)) score += 3;
    if (/"description"\s*:/i.test(html)) score += 3;
  }

  if (schema.jsonLdCount > 0) score += 2;
  if (schema.jsonLdCount > 2) score += 2;

  return clamp(score);
}

function analyzeJsonLdImplementation(
  content: CrawledContent,
  schema: ReturnType<typeof summarizeSchema>,
  hasOpenGraph: boolean,
  hasTwitter: boolean
): number {
  let score = 42;
  const html = content.html.toLowerCase();
  const hasSchemaVocab = /vocab\s*=\s*["']\s*(?:https?:)?\/\/schema\.org\/?\s*["']/i.test(content.html);
  const hasTypeof = /typeof\s*=\s*["'][^"']+["']/i.test(content.html);

  if (html.includes('application/ld+json')) score += 16;

  const headEndIndex = html.indexOf('</head>');
  const headSection = headEndIndex >= 0 ? html.substring(0, headEndIndex + 7) : html;
  if (headSection.includes('application/ld+json')) score += 10;

  if (schema.validBlocks > 0) {
    score += Math.min(12, schema.validBlocks * 3);
  }

  const microdataCount = content.enhancedSchemaInfo?.microdataCount || 0;
  const rdfaCount = content.enhancedSchemaInfo?.rdfaCount || 0;
  if (schema.validBlocks > microdataCount + rdfaCount) {
    score += 6;
  }
  if (schema.microdataTypes.length > 0) {
    score += schema.microdataTypes.length > 1 ? 6 : 3;
  }
  if (schema.rdfaTypes.length > 0) {
    score += hasSchemaVocab && hasTypeof ? 6 : 3;
  }

  if (hasOpenGraph && hasTwitter) {
    score += 6;
  } else if (hasOpenGraph || hasTwitter) {
    score += 3;
  }

  return clamp(score);
}
