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
  const visitedNodes = new WeakSet<object>();

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

  const addTypeValue = (value: unknown): void => {
    if (typeof value === 'string') {
      const type = extractType(value);
      if (type) types.add(type);
      return;
    }

    if (Array.isArray(value)) {
      value.forEach(addTypeValue);
    }
  };

  const addTypes = (value: unknown): void => {
    if (!value) return;

    if (Array.isArray(value)) {
      value.forEach(addTypes);
      return;
    }

    if (typeof value !== 'object') return;

    const record = value as Record<string, unknown>;
    if (visitedNodes.has(record)) return;
    visitedNodes.add(record);

    const typeValue = record['@type'];
    addTypeValue(typeValue);

    const graphValue = record['@graph'];
    if (Array.isArray(graphValue)) {
      hasGraph = true;
      graphValue.forEach(addTypes);
    } else if (graphValue && typeof graphValue === 'object') {
      hasGraph = true;
      addTypes(graphValue);
    }

    Object.values(record).forEach((child) => addTypes(child));
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

  const schemaPrefixes = new Set<string>(['schema']);
  const prefixMatches = content.html.matchAll(/prefix\s*=\s*["']([^"']+)["']/gi);
  for (const match of prefixMatches) {
    const tokens = match[1].trim().split(/\s+/);
    for (let index = 0; index < tokens.length - 1; index += 2) {
      const prefixToken = tokens[index];
      const uriToken = tokens[index + 1];
      if (/(?:https?:)?\/\/schema\.org\/?/i.test(uriToken)) {
        schemaPrefixes.add(prefixToken.replace(/:$/, '').toLowerCase());
      }
    }
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

        const tokenPrefix = token.includes(':') ? token.split(':', 1)[0].toLowerCase() : null;
        const tokenIsSchemaType = /^schema:/i.test(token) || /schema\.org\//i.test(token) || hasSchemaVocab || (tokenPrefix ? schemaPrefixes.has(tokenPrefix) : !token.includes(':'));
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
