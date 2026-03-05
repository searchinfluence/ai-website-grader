import { WebsiteAnalysis } from '@/types';
import { crawlWebsite, parseTextContent } from './crawler';
import { scoreWebsiteV3 } from './scoring/engine';

export async function analyzeWebsite(url: string, textContent?: string): Promise<WebsiteAnalysis> {
  let content;

  try {
    if (textContent) {
      content = await parseTextContent(textContent);
      content.title = content.title || 'Manual Content Analysis';
    } else {
      content = await crawlWebsite(url);
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';

    if (errorMessage.includes('aborted') || errorMessage.includes('timeout') || errorMessage.includes('Failed to crawl')) {
      throw new Error(`Website crawling failed. This can happen due to:

• Website blocking automated requests
• Network connectivity issues
• Website requiring JavaScript

💡 Solution: Please reload the page, then click the "Analyze Text" tab above and paste your website content directly.`);
    }

    throw new Error(`Failed to analyze website: ${errorMessage}`);
  }

  const result = scoreWebsiteV3(content);

  return {
    url,
    title: content.title || 'Website Analysis',
    overallScore: result.overallScore,
    timestamp: new Date().toISOString(),
    analysisScope: 'page',
    factors: result.factors,
    recommendations: result.recommendations,
    rawStats: result.rawStats,
    crawledContent: content
  };
}
