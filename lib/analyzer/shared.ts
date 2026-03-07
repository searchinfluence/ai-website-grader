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
  const microdataTypes = new Set<string>();
  const rdfaTypes = new Set<string>();
  let validBlocks = 0;
  let hasGraph = false;

  const extractType = (value: string): string | null => {
    const raw = value.trim();
    if (!raw) return null;

    if (/^schema:/i.test(raw)) {
      return raw.replace(/^schema:/i, '').trim() || null;
    }

    const schemaMatch = raw.match(/^(?:https?:)?\/\/schema\.org\/(.+)$/i);
    if (schemaMatch) {
      const trimmed = schemaMatch[1].split(/[?#]/)[0].replace(/\/+$/, '');
      if (!trimmed) return null;
      const parts = trimmed.split('/').filter(Boolean);
      return parts.length > 0 ? parts[parts.length - 1] : null;
    }

    return raw;
  };

  const addTypes = (value: unknown): void => {
    if (!value || typeof value !== 'object') return;

    const record = value as Record<string, unknown>;
    const typeValue = record['@type'];

    if (typeof typeValue === 'string') {
      types.add(typeValue);
    } else if (Array.isArray(typeValue)) {
      typeValue.filter((entry): entry is string => typeof entry === 'string').forEach((entry) => types.add(entry));
    }

    const graphValue = record['@graph'];
    if (Array.isArray(graphValue)) {
      hasGraph = true;
      graphValue.forEach(addTypes);
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
    } catch {
      // no-op: invalid JSON-LD remains represented in validBlocks/totalBlocks
    }
  }

  const itemtypeMatches = content.html.matchAll(/itemtype\s*=\s*["']([^"']+)["']/gi);
  for (const match of itemtypeMatches) {
    match[1]
      .split(/\s+/)
      .map((token) => ({ token, type: extractType(token) }))
      .filter((entry): entry is { token: string; type: string } => Boolean(entry.type))
      .forEach((entry) => {
        if (/schema\.org\//i.test(entry.token)) {
          const { type } = entry;
          microdataTypes.add(type);
          types.add(type);
        }
      });
  }

  const hasSchemaVocab = /vocab\s*=\s*["']\s*(?:https?:)?\/\/schema\.org\/?\s*["']/i.test(content.html);
  const typeofMatches = content.html.matchAll(/typeof\s*=\s*["']([^"']+)["']/gi);
  for (const match of typeofMatches) {
    match[1]
      .split(/\s+/)
      .map((token) => token.trim())
      .filter(Boolean)
      .forEach((token) => {
        const type = extractType(token);
        if (!type) return;

        const tokenIsSchemaType = /^schema:/i.test(token) || /schema\.org\//i.test(token) || hasSchemaVocab || !token.includes(':');
        if (tokenIsSchemaType) {
          rdfaTypes.add(type);
          types.add(type);
        }
      });
  }

  const schemaTypes = Array.from(types);
  const hasType = (needle: string) => schemaTypes.some((type) => type.toLowerCase().includes(needle));

  return {
    jsonLdCount: content.schemaMarkup.length,
    schemaTypes,
    microdataTypes: Array.from(microdataTypes),
    rdfaTypes: Array.from(rdfaTypes),
    validBlocks,
    totalBlocks: content.schemaMarkup.length,
    hasGraph,
    hasOrganization: hasType('organization') || hasType('localbusiness'),
    hasFaqPage: hasType('faqpage') || hasType('qapage'),
    hasHowTo: hasType('howto'),
    hasArticle: hasType('article') || hasType('blogposting') || hasType('newsarticle'),
    hasProductOrService: hasType('product') || hasType('service')
  };
}
