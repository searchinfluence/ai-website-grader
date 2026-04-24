import { describe, expect, it } from 'vitest';
import { buildPrioritizedRecommendations } from '@/lib/analyzer/recommendations';
import { FactorResult } from '@/lib/analyzer/types';
import { RecommendationItem } from '@/types';

const rec = (
  text: string,
  priority: RecommendationItem['priority'],
  category = 'cat',
): RecommendationItem => ({ text, priority, category });

const factor = (
  key: FactorResult['key'],
  score: number,
  recommendations: RecommendationItem[],
  label?: string,
): FactorResult => ({
  key,
  label: label ?? key,
  weight: 0.25,
  score,
  status: 'good',
  findings: [],
  recommendations,
  stats: {},
});

describe('buildPrioritizedRecommendations', () => {
  it('flattens recommendations across factors and dedupes by text', () => {
    const factors: FactorResult[] = [
      factor('contentStructure', 60, [rec('Add H1', 'high'), rec('Add alt text', 'medium')]),
      factor('structuredData', 60, [rec('Add H1', 'low'), rec('Add JSON-LD', 'high')]),
    ];
    const out = buildPrioritizedRecommendations(factors);
    const texts = out.map((r) => r.text);

    expect(texts).toContain('Add H1');
    expect(texts.filter((t) => t === 'Add H1').length).toBe(1);
    expect(texts).toContain('Add alt text');
    expect(texts).toContain('Add JSON-LD');
  });

  it('sorts by priority high → medium → low', () => {
    const factors: FactorResult[] = [
      factor('contentStructure', 60, [
        rec('low item', 'low'),
        rec('high item', 'high'),
        rec('medium item', 'medium'),
      ]),
    ];
    const out = buildPrioritizedRecommendations(factors);
    expect(out.map((r) => r.priority)).toEqual(['high', 'medium', 'low']);
  });

  it('caps the result at 12 items when 3+ deduped recs exist', () => {
    const many: RecommendationItem[] = Array.from({ length: 20 }, (_, i) =>
      rec(`item ${i}`, 'medium'),
    );
    const factors: FactorResult[] = [factor('contentStructure', 60, many)];
    const out = buildPrioritizedRecommendations(factors);
    expect(out.length).toBe(12);
  });

  it('falls back to per-factor reviews when fewer than 3 recs exist', () => {
    const factors: FactorResult[] = [
      factor('contentStructure', 30, [], 'Content Structure'),
      factor('structuredData', 65, [], 'Structured Data'),
      factor('technicalHealth', 80, [], 'Technical Health'),
      factor('pageSEO', 90, [], 'Page SEO'),
    ];
    const out = buildPrioritizedRecommendations(factors);

    expect(out.length).toBeGreaterThanOrEqual(3);
    expect(out.some((r) => r.text.includes('Content Structure'))).toBe(true);
    expect(out.find((r) => r.text.includes('Content Structure'))?.priority).toBe('high');
    expect(out.find((r) => r.text.includes('Structured Data'))?.priority).toBe('medium');
    expect(out.find((r) => r.text.includes('Technical Health'))?.priority).toBe('low');
  });

  it('returns up to 12 items even in the fallback path', () => {
    const factors: FactorResult[] = [
      factor('contentStructure', 60, [rec('only one', 'high')]),
    ];
    const out = buildPrioritizedRecommendations(factors);
    expect(out.length).toBeLessThanOrEqual(12);
    expect(out.map((r) => r.text)).toContain('only one');
  });
});
