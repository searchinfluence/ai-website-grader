import { CrawledContent } from '@/types';
import { SchemaSummary } from './types';

export const clamp = (value: number, min = 0, max = 100) => Math.max(min, Math.min(max, Math.round(value)));

export function toStatus(score: number): 'excellent' | 'good' | 'needs-improvement' | 'poor' | 'critical' {
  if (score >= 85) return 'excellent';
  if (score >= 70) return 'good';
  if (score >= 50) return 'needs-improvement';
  if (score >= 30) return 'poor';
  return 'critical';
}

export function getMainContentText(content: CrawledContent): string {
  if (content.paragraphs.length > 0) {
    return content.paragraphs.join(' ');
  }

  return content.html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
}

export function summarizeSchema(content: CrawledContent): SchemaSummary {
  const types = new Set<string>();
  let validBlocks = 0;

  const addTypes = (value: unknown): void => {
    if (!value || typeof value !== 'object') return;

    const record = value as Record<string, unknown>;
    const typeValue = record['@type'];

    if (typeof typeValue === 'string') {
      types.add(typeValue);
    } else if (Array.isArray(typeValue)) {
      typeValue.filter((entry): entry is string => typeof entry === 'string').forEach((entry) => types.add(entry));
    }

    Object.values(record).forEach((child) => {
      if (Array.isArray(child)) {
        child.forEach(addTypes);
      } else if (child && typeof child === 'object') {
        addTypes(child);
      }
    });
  };

  for (const block of content.schemaMarkup) {
    try {
      const parsed = JSON.parse(block) as Record<string, unknown>;
      validBlocks += 1;
      addTypes(parsed);

      if (Array.isArray(parsed['@graph'])) {
        parsed['@graph'].forEach(addTypes);
      }
    } catch {
      // no-op: invalid JSON-LD remains represented in validBlocks/totalBlocks
    }
  }

  const schemaTypes = Array.from(types);
  const hasType = (needle: string) => schemaTypes.some((type) => type.toLowerCase().includes(needle));

  return {
    jsonLdCount: content.schemaMarkup.length,
    schemaTypes,
    validBlocks,
    totalBlocks: content.schemaMarkup.length,
    hasOrganization: hasType('organization') || hasType('localbusiness'),
    hasFaqPage: hasType('faqpage') || hasType('qapage'),
    hasHowTo: hasType('howto'),
    hasArticle: hasType('article') || hasType('blogposting') || hasType('newsarticle'),
    hasProductOrService: hasType('product') || hasType('service')
  };
}
