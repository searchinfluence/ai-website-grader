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
  const hasResponsiveImages = Boolean(content.mobileInfo?.usesResponsiveImages);
  const hasTouchableElements = Boolean(content.mobileInfo?.hasTouchableElements);

  const webVitals = content.aiAnalysisData?.performanceMetrics?.coreWebVitals?.score;
  const speedFromVitals = typeof webVitals === 'number'
    ? clamp(
        webVitals >= 95 ? 92 :
        webVitals >= 90 ? 84 :
        webVitals >= 80 ? 68 :
        webVitals >= 70 ? 52 :
        webVitals >= 50 ? 30 :
        8
      )
    : 45;
  const loadTimeMs = content.loadTime ?? 3000;
  const speedFromLoadTime = clamp(loadTimeMs <= 1800 ? 90 : loadTimeMs <= 2500 ? 74 : loadTimeMs <= 3500 ? 56 : loadTimeMs <= 5000 ? 34 : 12);
  const htmlValidation = content.aiAnalysisData?.performanceMetrics?.htmlValidation;
  const htmlErrors = htmlValidation?.errors ?? 0;
  const htmlWarnings = htmlValidation?.warnings ?? 0;
  const htmlValidationScore = clamp(
    htmlErrors === 0
      ? htmlWarnings === 0
        ? 100
        : htmlWarnings <= 3
          ? 90
          : htmlWarnings <= 8
            ? 76
            : 64
      : htmlErrors === 1
        ? 64
        : htmlErrors <= 3
          ? 42
          : htmlErrors <= 6
            ? 22
            : 6
  );
  const accessibilityScore = content.aiAnalysisData?.performanceMetrics?.accessibilityScore;
  const normalizedAccessibilityScore = typeof accessibilityScore === 'number'
    ? clamp(
        accessibilityScore >= 95 ? 96 :
        accessibilityScore >= 90 ? 88 :
        accessibilityScore >= 80 ? 66 :
        accessibilityScore >= 70 ? 46 :
        accessibilityScore >= 60 ? 24 :
        8
      )
    : 55;
  const mobileChecks = [hasViewport, hasResponsiveCss, hasResponsiveImages, hasTouchableElements].filter(Boolean).length;
  const mobileScore = clamp(
    mobileChecks === 4 ? 100 :
    mobileChecks === 3 ? 66 :
    mobileChecks === 2 ? 38 :
    mobileChecks === 1 ? 18 :
    0
  );

  let score = clamp(
    (isHttps ? 100 : 10) * 0.1 +
    (robotsPresent ? (allowsBots ? 92 : 52) : 28) * 0.12 +
    (hasSitemapHint ? 82 : 34) * 0.08 +
    (hasCanonical ? 90 : 28) * 0.12 +
    (hasHreflang ? 72 : 60) * 0.03 +
    mobileScore * 0.18 +
    speedFromVitals * 0.17 +
    speedFromLoadTime * 0.08 +
    htmlValidationScore * 0.07 +
    normalizedAccessibilityScore * 0.05
  );

  if (!isHttps) score = clamp(score - 10);
  if (typeof webVitals === 'number' && webVitals < 50) score = clamp(score - 10);
  if (htmlErrors > 0) score = clamp(score - Math.min(12, htmlErrors * 2));
  if (typeof accessibilityScore === 'number' && accessibilityScore < 90) score = clamp(score - 6);

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

  if (mobileChecks < 4) {
    findings.push(`Mobile setup gap: viewport=${hasViewport ? 'present' : 'missing'}, responsive CSS=${hasResponsiveCss ? 'present' : 'missing'}, responsive images=${hasResponsiveImages ? 'present' : 'missing'}, touch targets=${hasTouchableElements ? 'present' : 'missing'}.`);
    recommendations.push({
      text: `Add missing mobile foundations on ${hostLabel} (viewport: ${hasViewport ? 'present' : 'missing'}, responsive CSS: ${hasResponsiveCss ? 'present' : 'missing'}, responsive images: ${hasResponsiveImages ? 'present' : 'missing'}, touch targets: ${hasTouchableElements ? 'present' : 'missing'}).`,
      priority: 'high',
      category: 'mobile-tech',
      timeToImplement: '~1 hour'
    });
  }

  if (htmlErrors > 0) {
    findings.push(`HTML validation found ${htmlErrors} error(s) and ${htmlWarnings} warning(s).`);
    recommendations.push({
      text: `Resolve HTML validation errors on ${hostLabel}; zero HTML errors is now required for a strong technical score (current errors: ${htmlErrors}, warnings: ${htmlWarnings}).`,
      priority: htmlErrors > 2 ? 'high' : 'medium',
      category: 'html-validation',
      timeToImplement: '~1 hour'
    });
  }

  if (typeof accessibilityScore === 'number' && accessibilityScore < 90) {
    findings.push(`Accessibility score is ${accessibilityScore}/100.`);
    recommendations.push({
      text: `Raise the accessibility score on ${hostLabel} above 90 by addressing semantic labels, contrast, and interactive control issues (current score: ${accessibilityScore}/100).`,
      priority: accessibilityScore < 75 ? 'high' : 'medium',
      category: 'accessibility',
      timeToImplement: '~half day'
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
      hasResponsiveImages,
      hasTouchableElements,
      mobileScore,
      pageSpeedScore: speedFromVitals,
      loadTimeMs,
      htmlErrors,
      htmlWarnings,
      htmlValidationScore,
      accessibilityScore: accessibilityScore ?? null,
      normalizedAccessibilityScore
    }
  };
}
