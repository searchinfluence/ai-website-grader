import { CrawledContent } from '@/types';
import { analyzeWebsiteFactors } from '@/lib/analyzer';

export function scoreWebsiteV3(content: CrawledContent) {
  return analyzeWebsiteFactors(content);
}
