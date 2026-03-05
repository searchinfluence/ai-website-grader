import { FactorKey } from '@/lib/scoring/config';
import { RecommendationItem } from '@/types';

export type FactorResult = {
  key: FactorKey;
  label: string;
  weight: number;
  score: number;
  status: 'excellent' | 'good' | 'needs-improvement' | 'poor' | 'critical';
  findings: string[];
  recommendations: RecommendationItem[];
  stats: Record<string, unknown>;
};

export type SchemaSummary = {
  jsonLdCount: number;
  schemaTypes: string[];
  validBlocks: number;
  totalBlocks: number;
  hasOrganization: boolean;
  hasFaqPage: boolean;
  hasHowTo: boolean;
  hasArticle: boolean;
  hasProductOrService: boolean;
};
