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

  const typeScore = clamp(schema.schemaTypes.length * 18);
  const presenceScore = schema.jsonLdCount > 0 ? clamp(55 + schema.validBlocks * 10) : 10;
  const completenessCount = [schema.hasOrganization, schema.hasFaqPage, schema.hasHowTo, schema.hasArticle, schema.hasProductOrService].filter(Boolean).length;
  const completenessScore = clamp(completenessCount * 20);
  const socialMetaScore = hasOpenGraph && hasTwitter ? 95 : hasOpenGraph || hasTwitter ? 65 : 20;
  const richSnippetScore = clamp((schema.hasFaqPage ? 35 : 0) + (schema.hasHowTo ? 25 : 0) + (schema.hasArticle ? 20 : 0) + (schema.hasProductOrService ? 20 : 0));

  const score = clamp(
    presenceScore * 0.3 +
    typeScore * 0.2 +
    completenessScore * 0.2 +
    socialMetaScore * 0.15 +
    richSnippetScore * 0.15
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
      richSnippetEligible: schema.hasFaqPage || schema.hasHowTo || schema.hasArticle || schema.hasProductOrService
    }
  };
}
