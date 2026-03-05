import { CrawledContent } from '@/types';
import { FactorKey } from '@/lib/scoring/config';
import { analyzeContentStructure } from './content-structure';
import { analyzeStructuredData } from './structured-data';
import { analyzeTechnicalHealth } from './technical-health';
import { analyzePageSeo } from './page-seo';
import { buildPrioritizedRecommendations } from './recommendations';
import { clamp } from './shared';
import { FactorResult } from './types';

export type WebsiteFactorAnalysis = {
  overallScore: number;
  factors: Record<FactorKey, FactorResult>;
  recommendations: ReturnType<typeof buildPrioritizedRecommendations>;
  rawStats: Record<string, unknown>;
};

export function analyzeWebsiteFactors(content: CrawledContent): WebsiteFactorAnalysis {
  const factorResults: FactorResult[] = [
    analyzeContentStructure(content),
    analyzeStructuredData(content),
    analyzeTechnicalHealth(content),
    analyzePageSeo(content)
  ];

  const factors = factorResults.reduce((acc, factor) => {
    acc[factor.key] = factor;
    return acc;
  }, {} as Record<FactorKey, FactorResult>);

  const overallScore = clamp(factorResults.reduce((sum, factor) => sum + factor.score * factor.weight, 0));

  return {
    overallScore,
    factors,
    recommendations: buildPrioritizedRecommendations(factorResults),
    rawStats: {
      generatedAt: new Date().toISOString(),
      factorCount: factorResults.length,
      factorStats: factorResults.map((factor) => ({
        key: factor.key,
        score: factor.score,
        stats: factor.stats
      }))
    }
  };
}
