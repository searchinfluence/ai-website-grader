import { SCORING_FACTORS } from '@/lib/scoring/config';
import {
  RecommendationItem,
  ScoringFactorKey,
  ScoringFactorResult,
  WebsiteAnalysis
} from '@/types';

const DEFAULT_FACTOR_STATUS: ScoringFactorResult['status'] = 'needs-improvement';

const LEGACY_FACTOR_FALLBACKS: Record<ScoringFactorKey, Array<keyof WebsiteAnalysis>> = {
  contentStructure: ['contentQuality', 'aiOptimization'],
  structuredData: ['schemaAnalysis'],
  technicalHealth: ['technicalSEO', 'mobileOptimization'],
  pageSEO: ['technicalSEO', 'contentQuality']
};

function normalizePriority(value: unknown): RecommendationItem['priority'] {
  return value === 'high' || value === 'medium' || value === 'low' ? value : 'medium';
}

function normalizeRecommendation(
  value: unknown,
  fallbackCategory = 'general'
): RecommendationItem {
  if (typeof value === 'string') {
    return {
      text: value,
      priority: 'medium',
      category: fallbackCategory
    };
  }

  if (!value || typeof value !== 'object') {
    return {
      text: 'Recommendation unavailable.',
      priority: 'medium',
      category: fallbackCategory
    };
  }

  const candidate = value as Partial<RecommendationItem>;
  return {
    text: typeof candidate.text === 'string' && candidate.text.trim().length > 0
      ? candidate.text
      : 'Recommendation unavailable.',
    priority: normalizePriority(candidate.priority),
    category: typeof candidate.category === 'string' && candidate.category.trim().length > 0
      ? candidate.category
      : fallbackCategory,
    implementation: typeof candidate.implementation === 'string' ? candidate.implementation : undefined,
    codeExample: typeof candidate.codeExample === 'string' ? candidate.codeExample : undefined,
    tools: Array.isArray(candidate.tools) ? candidate.tools.filter((item): item is string => typeof item === 'string') : undefined,
    expectedImpact: candidate.expectedImpact === 'high' || candidate.expectedImpact === 'medium' || candidate.expectedImpact === 'low'
      ? candidate.expectedImpact
      : undefined,
    timeToImplement: typeof candidate.timeToImplement === 'string' ? candidate.timeToImplement : undefined,
    testingInstructions: typeof candidate.testingInstructions === 'string' ? candidate.testingInstructions : undefined,
    resources: Array.isArray(candidate.resources) ? candidate.resources.filter((item): item is string => typeof item === 'string') : undefined
  };
}

function normalizeFactor(
  key: ScoringFactorKey,
  analysis: Partial<WebsiteAnalysis>,
  fallbackScore: number
): ScoringFactorResult {
  const config = SCORING_FACTORS.find((factor) => factor.key === key)!;
  const fallbackSource = LEGACY_FACTOR_FALLBACKS[key]
    .map((legacyKey) => analysis[legacyKey])
    .find((value) => value && typeof value === 'object');
  const candidate = (
    analysis.factors?.[key] ||
    fallbackSource ||
    {}
  ) as Partial<ScoringFactorResult>;

  const score = typeof candidate.score === 'number' && Number.isFinite(candidate.score)
    ? Math.max(0, Math.min(100, Math.round(candidate.score)))
    : fallbackScore;

  return {
    key,
    label: typeof candidate.label === 'string' && candidate.label.trim().length > 0 ? candidate.label : config.label,
    weight: typeof candidate.weight === 'number' && Number.isFinite(candidate.weight) ? candidate.weight : config.weight,
    score,
    status: candidate.status === 'excellent'
      || candidate.status === 'good'
      || candidate.status === 'needs-improvement'
      || candidate.status === 'poor'
      || candidate.status === 'critical'
      ? candidate.status
      : DEFAULT_FACTOR_STATUS,
    findings: Array.isArray(candidate.findings)
      ? candidate.findings.filter((item): item is string => typeof item === 'string' && item.trim().length > 0)
      : [],
    recommendations: Array.isArray(candidate.recommendations)
      ? candidate.recommendations.map((item) => normalizeRecommendation(item, config.label))
      : [],
    stats: candidate.stats && typeof candidate.stats === 'object' ? candidate.stats : {}
  };
}

function normalizeContentImprovements(analysis: Partial<WebsiteAnalysis>) {
  if (!Array.isArray(analysis.contentImprovements)) {
    return [];
  }

  return analysis.contentImprovements
    .filter((item): item is NonNullable<WebsiteAnalysis['contentImprovements']>[number] => !!item && typeof item === 'object')
    .map((item) => ({
      section: typeof item.section === 'string' ? item.section : 'Improvement',
      current: typeof item.current === 'string' ? item.current : 'Current content needs improvement.',
      improved: typeof item.improved === 'string' ? item.improved : 'Recommended improvement unavailable.',
      reasoning: typeof item.reasoning === 'string' ? item.reasoning : 'Improving this section will strengthen AI visibility.',
      priority: normalizePriority(item.priority),
      implementation: typeof item.implementation === 'string' ? item.implementation : undefined,
      estimatedImpact: item.estimatedImpact === 'high' || item.estimatedImpact === 'medium' || item.estimatedImpact === 'low'
        ? item.estimatedImpact
        : undefined
    }));
}

export function normalizeWebsiteAnalysis(value: unknown): WebsiteAnalysis | null {
  if (!value || typeof value !== 'object') {
    return null;
  }

  const analysis = value as Partial<WebsiteAnalysis>;
  const overallScore = typeof analysis.overallScore === 'number' && Number.isFinite(analysis.overallScore)
    ? Math.max(0, Math.min(100, Math.round(analysis.overallScore)))
    : 0;

  const factors = Object.fromEntries(
    SCORING_FACTORS.map((factor) => [factor.key, normalizeFactor(factor.key, analysis, overallScore)])
  ) as WebsiteAnalysis['factors'];

  return {
    url: typeof analysis.url === 'string' && analysis.url.trim().length > 0 ? analysis.url : 'Unknown URL',
    title: typeof analysis.title === 'string' ? analysis.title : 'Untitled page',
    overallScore,
    timestamp: typeof analysis.timestamp === 'string' && analysis.timestamp.trim().length > 0
      ? analysis.timestamp
      : new Date(0).toISOString(),
    analysisScope: analysis.analysisScope === 'page' ? analysis.analysisScope : 'page',
    factors,
    recommendations: Array.isArray(analysis.recommendations)
      ? analysis.recommendations.map((item) => normalizeRecommendation(item))
      : [],
    rawStats: analysis.rawStats && typeof analysis.rawStats === 'object' ? analysis.rawStats : {},
    contentImprovements: normalizeContentImprovements(analysis),
    crawledContent: analysis.crawledContent && typeof analysis.crawledContent === 'object' ? analysis.crawledContent : undefined,
    debugInfo: analysis.debugInfo && typeof analysis.debugInfo === 'object' ? analysis.debugInfo : undefined,
    hybridAnalysis: analysis.hybridAnalysis && typeof analysis.hybridAnalysis === 'object' ? analysis.hybridAnalysis : undefined,
    technicalSEO: analysis.technicalSEO && typeof analysis.technicalSEO === 'object' ? analysis.technicalSEO : undefined,
    technicalCrawlability: analysis.technicalCrawlability && typeof analysis.technicalCrawlability === 'object' ? analysis.technicalCrawlability : undefined,
    contentQuality: analysis.contentQuality && typeof analysis.contentQuality === 'object' ? analysis.contentQuality : undefined,
    aiOptimization: analysis.aiOptimization && typeof analysis.aiOptimization === 'object' ? analysis.aiOptimization : undefined,
    mobileOptimization: analysis.mobileOptimization && typeof analysis.mobileOptimization === 'object' ? analysis.mobileOptimization : undefined,
    schemaAnalysis: analysis.schemaAnalysis && typeof analysis.schemaAnalysis === 'object' ? analysis.schemaAnalysis : undefined,
    eeatSignals: analysis.eeatSignals && typeof analysis.eeatSignals === 'object' ? analysis.eeatSignals : undefined
  };
}
