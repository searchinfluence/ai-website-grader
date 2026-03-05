import { CrawledContent, RecommendationItem } from '@/types';
import { SCORING_FACTORS } from '@/lib/scoring/config';
import { FactorResult } from './types';
import { clamp, toStatus } from './shared';

export function analyzeTechnicalHealth(content: CrawledContent): FactorResult {
  const findings: string[] = [];
  const recommendations: RecommendationItem[] = [];
  const hostLabel = content.url === 'manual-input' ? 'this content input' : new URL(content.url).hostname;

  const isHttps = content.url.startsWith('https://');
  const robotsPresent = Boolean(content.robotsInfo?.hasRobotsTxt);
  const allowsBots = Boolean(content.robotsInfo?.allowsAllBots);
  const hasSitemapHint = Boolean(content.robotsInfo?.content?.toLowerCase().includes('sitemap:') || content.html.toLowerCase().includes('sitemap.xml'));

  const html = content.html.toLowerCase();
  const hasCanonical = html.includes('rel="canonical"') || html.includes("rel='canonical'");
  const hasHreflang = html.includes('hreflang=');
  const hasViewport = Boolean(content.mobileInfo?.hasViewportMeta);
  const hasResponsiveCss = Boolean(content.mobileInfo?.mobileOptimizedCSS);

  const webVitals = content.aiAnalysisData?.performanceMetrics?.coreWebVitals?.score;
  const speedFromVitals = typeof webVitals === 'number' ? clamp(webVitals) : 65;
  const loadTimeMs = content.loadTime ?? 3000;
  const speedFromLoadTime = clamp(loadTimeMs <= 1800 ? 95 : loadTimeMs <= 2500 ? 80 : loadTimeMs <= 4000 ? 60 : loadTimeMs <= 5500 ? 45 : 30);

  const score = clamp(
    (isHttps ? 100 : 20) * 0.12 +
    (robotsPresent ? (allowsBots ? 95 : 60) : 40) * 0.14 +
    (hasSitemapHint ? 90 : 45) * 0.12 +
    (hasCanonical ? 95 : 40) * 0.12 +
    (hasHreflang ? 75 : 60) * 0.05 +
    (hasViewport ? 95 : 35) * 0.15 +
    (hasResponsiveCss ? 85 : 40) * 0.1 +
    speedFromVitals * 0.12 +
    speedFromLoadTime * 0.08
  );

  if (!isHttps) {
    findings.push('Page is not served via HTTPS.');
    recommendations.push({
      text: `Redirect all traffic on ${hostLabel} to HTTPS and update canonicals/internal links to the https:// URL.`,
      priority: 'high',
      category: 'security',
      timeToImplement: '~1 hour'
    });
  }

  if (!robotsPresent || !allowsBots) {
    findings.push(`robots.txt status: present=${robotsPresent ? 'yes' : 'no'}, allows all bots=${allowsBots ? 'yes' : 'no'}.`);
    recommendations.push({
      text: `Update robots.txt on ${hostLabel} to allow key crawlers (current state: robots present ${robotsPresent ? 'yes' : 'no'}, allows bots ${allowsBots ? 'yes' : 'no'}).`,
      priority: 'high',
      category: 'crawlability',
      timeToImplement: '~30 min'
    });
  }

  if (!hasSitemapHint) {
    findings.push('Sitemap reference was not found in robots.txt or page HTML checks.');
    recommendations.push({
      text: `Publish sitemap.xml for ${hostLabel} and add a Sitemap: directive in robots.txt (currently no sitemap reference detected).`,
      priority: 'medium',
      category: 'sitemap',
      timeToImplement: '~30 min'
    });
  }

  if (!hasCanonical) {
    findings.push('Canonical tag is missing.');
    recommendations.push({
      text: `Add a canonical tag on ${hostLabel} to prevent duplicate URL indexing conflicts (currently missing from page head).`,
      priority: 'medium',
      category: 'canonical',
      timeToImplement: '~30 min'
    });
  }

  if (!hasViewport || !hasResponsiveCss) {
    findings.push(`Mobile setup gap: viewport=${hasViewport ? 'present' : 'missing'}, responsive CSS=${hasResponsiveCss ? 'present' : 'missing'}.`);
    recommendations.push({
      text: `Add missing mobile foundations on ${hostLabel} (viewport: ${hasViewport ? 'present' : 'missing'}, responsive CSS: ${hasResponsiveCss ? 'present' : 'missing'}).`,
      priority: 'high',
      category: 'mobile-tech',
      timeToImplement: '~1 hour'
    });
  }

  if (loadTimeMs > 3000) {
    findings.push(`Estimated load time is ${loadTimeMs}ms.`);
    recommendations.push({
      text: `Reduce ${hostLabel} load time from ${loadTimeMs}ms to below 2500ms by compressing images and deferring non-critical JS.`,
      priority: 'medium',
      category: 'performance',
      timeToImplement: '~half day'
    });
  }

  return {
    key: 'technicalHealth',
    label: 'Technical Health',
    weight: SCORING_FACTORS.find((factor) => factor.key === 'technicalHealth')!.weight,
    score,
    status: toStatus(score),
    findings,
    recommendations,
    stats: {
      https: isHttps,
      robotsPresent,
      allowsBots,
      hasSitemapHint,
      hasCanonical,
      hasHreflang,
      hasViewport,
      hasResponsiveCss,
      pageSpeedScore: speedFromVitals,
      loadTimeMs
    }
  };
}
