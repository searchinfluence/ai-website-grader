import { RecommendationItem } from '@/types';
import { FactorResult } from './types';

const priorityOrder = { high: 0, medium: 1, low: 2 } as const;

export function buildPrioritizedRecommendations(factors: FactorResult[]): RecommendationItem[] {
  const all = factors.flatMap((factor) => factor.recommendations);

  const deduped = all.filter((item, index) => {
    return all.findIndex((candidate) => candidate.text === item.text) === index;
  });

  deduped.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);

  if (deduped.length >= 3) {
    return deduped.slice(0, 12);
  }

  const fallback: RecommendationItem[] = factors.slice(0, 3).map((factor) => ({
    text: `Review and improve ${factor.label} based on measured gaps in this report (current score: ${factor.score}%).`,
    priority: factor.score < 50 ? 'high' : factor.score < 70 ? 'medium' : 'low',
    category: `${factor.key}-review`,
    timeToImplement: '~1 hour'
  }));

  return [...deduped, ...fallback].slice(0, 12);
}
