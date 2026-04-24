import { describe, expect, it } from 'vitest';
import { normalizeWebsiteAnalysis } from '@/lib/normalize-analysis';

describe('normalizeWebsiteAnalysis', () => {
  it('returns null for non-object input', () => {
    expect(normalizeWebsiteAnalysis(null)).toBeNull();
    expect(normalizeWebsiteAnalysis(undefined)).toBeNull();
    expect(normalizeWebsiteAnalysis('string')).toBeNull();
    expect(normalizeWebsiteAnalysis(42)).toBeNull();
  });

  it('fills defaults for an empty object', () => {
    const out = normalizeWebsiteAnalysis({});
    expect(out).not.toBeNull();
    expect(out!.url).toBe('Unknown URL');
    expect(out!.title).toBe('Untitled page');
    expect(out!.overallScore).toBe(0);
    expect(out!.timestamp).toBe(new Date(0).toISOString());
    expect(out!.analysisScope).toBe('page');
    expect(Object.keys(out!.factors).sort()).toEqual([
      'contentStructure',
      'pageSEO',
      'structuredData',
      'technicalHealth',
    ]);
    expect(out!.recommendations).toEqual([]);
    expect(out!.contentImprovements).toEqual([]);
  });

  it('clamps overall score into [0, 100] and rounds', () => {
    expect(normalizeWebsiteAnalysis({ overallScore: 150 })!.overallScore).toBe(100);
    expect(normalizeWebsiteAnalysis({ overallScore: -50 })!.overallScore).toBe(0);
    expect(normalizeWebsiteAnalysis({ overallScore: 67.6 })!.overallScore).toBe(68);
    expect(normalizeWebsiteAnalysis({ overallScore: Number.NaN })!.overallScore).toBe(0);
  });

  it('preserves valid url, title, timestamp, analysisScope', () => {
    const out = normalizeWebsiteAnalysis({
      url: 'https://example.com',
      title: 'Hello',
      timestamp: '2026-04-23T10:00:00Z',
      analysisScope: 'page',
    });
    expect(out!.url).toBe('https://example.com');
    expect(out!.title).toBe('Hello');
    expect(out!.timestamp).toBe('2026-04-23T10:00:00Z');
    expect(out!.analysisScope).toBe('page');
  });

  it('coerces unknown analysisScope back to "page"', () => {
    // @ts-expect-error - intentional bad input
    const out = normalizeWebsiteAnalysis({ analysisScope: 'site' });
    expect(out!.analysisScope).toBe('page');
  });

  it('normalizes string recommendations to objects with default priority', () => {
    const out = normalizeWebsiteAnalysis({
      recommendations: ['Plain text rec'],
    });
    expect(out!.recommendations).toHaveLength(1);
    expect(out!.recommendations[0]).toMatchObject({
      text: 'Plain text rec',
      priority: 'medium',
      category: 'general',
    });
  });

  it('passes through valid recommendation objects and validates priority', () => {
    const out = normalizeWebsiteAnalysis({
      recommendations: [
        { text: 'Add H1', priority: 'high', category: 'content' },
        { text: 'Use alt', priority: 'bogus', category: 'a11y' },
      ],
    });
    expect(out!.recommendations[0].priority).toBe('high');
    expect(out!.recommendations[1].priority).toBe('medium');
  });

  it('falls back when a recommendation object is missing text', () => {
    const out = normalizeWebsiteAnalysis({
      recommendations: [{ priority: 'low' }],
    });
    expect(out!.recommendations[0].text).toBe('Recommendation unavailable.');
  });

  it('uses legacy factor sources when factors[key] is missing', () => {
    const out = normalizeWebsiteAnalysis({
      contentQuality: { score: 72, status: 'good', findings: ['ok'], recommendations: [] },
      schemaAnalysis: { score: 41 },
    });
    expect(out!.factors.contentStructure.score).toBe(72);
    expect(out!.factors.contentStructure.status).toBe('good');
    expect(out!.factors.contentStructure.findings).toContain('ok');
    expect(out!.factors.structuredData.score).toBe(41);
  });

  it('clamps factor score and applies default status when missing', () => {
    const out = normalizeWebsiteAnalysis({
      factors: {
        contentStructure: { score: 200 },
      },
    });
    expect(out!.factors.contentStructure.score).toBe(100);
    expect(out!.factors.contentStructure.status).toBe('needs-improvement');
  });

  it('normalizes contentImprovements with defaults for missing fields', () => {
    const out = normalizeWebsiteAnalysis({
      contentImprovements: [
        { section: 'Hero', current: 'a', improved: 'b' },
        { },
      ],
    });
    expect(out!.contentImprovements).toHaveLength(2);
    expect(out!.contentImprovements[0].section).toBe('Hero');
    expect(out!.contentImprovements[0].current).toBe('a');
    expect(out!.contentImprovements[0].improved).toBe('b');
    expect(out!.contentImprovements[1].section).toBe('Improvement');
    expect(out!.contentImprovements[1].current).toBe('Current content needs improvement.');
  });

  it('drops non-object items from contentImprovements', () => {
    const out = normalizeWebsiteAnalysis({
      contentImprovements: ['not an object', null, { section: 'Body' }],
    });
    expect(out!.contentImprovements).toHaveLength(1);
    expect(out!.contentImprovements[0].section).toBe('Body');
  });

  it('preserves all optional recommendation fields when provided', () => {
    const out = normalizeWebsiteAnalysis({
      recommendations: [{
        text: 'Do thing',
        priority: 'high',
        category: 'a',
        implementation: 'Step by step',
        codeExample: '<code/>',
        tools: ['tool1', 'tool2'],
        expectedImpact: 'high',
        timeToImplement: '~1h',
        testingInstructions: 'click here',
        resources: ['https://docs.example.com'],
      }],
    });
    const rec = out!.recommendations[0];
    expect(rec.implementation).toBe('Step by step');
    expect(rec.codeExample).toBe('<code/>');
    expect(rec.tools).toEqual(['tool1', 'tool2']);
    expect(rec.expectedImpact).toBe('high');
    expect(rec.timeToImplement).toBe('~1h');
    expect(rec.testingInstructions).toBe('click here');
    expect(rec.resources).toEqual(['https://docs.example.com']);
  });

  it('drops non-string entries from tools and resources arrays', () => {
    const out = normalizeWebsiteAnalysis({
      recommendations: [{
        text: 't',
        priority: 'low',
        category: 'c',
        tools: ['ok', 123, null] as unknown as string[],
        resources: [false, 'http://x'] as unknown as string[],
      }],
    });
    expect(out!.recommendations[0].tools).toEqual(['ok']);
    expect(out!.recommendations[0].resources).toEqual(['http://x']);
  });

  it('handles array-of-recommendations with non-object items by mapping defaults', () => {
    const out = normalizeWebsiteAnalysis({
      recommendations: [null as unknown as never, 'Plain string'],
    });
    expect(out!.recommendations).toHaveLength(2);
    expect(out!.recommendations[0].text).toBe('Recommendation unavailable.');
    expect(out!.recommendations[1].text).toBe('Plain string');
  });

  it('preserves contentImprovement implementation and estimatedImpact', () => {
    const out = normalizeWebsiteAnalysis({
      contentImprovements: [{
        section: 'CTA',
        current: 'old',
        improved: 'new',
        reasoning: 'reason',
        priority: 'medium',
        implementation: 'how to',
        estimatedImpact: 'high',
      }],
    });
    expect(out!.contentImprovements[0].implementation).toBe('how to');
    expect(out!.contentImprovements[0].estimatedImpact).toBe('high');
  });
});
