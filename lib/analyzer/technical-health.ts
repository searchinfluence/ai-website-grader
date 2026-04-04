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

  const performanceMetrics = content.aiAnalysisData?.performanceMetrics;
  const htmlValidationState = performanceMetrics?.htmlValidation?.validationState ?? 'unknown';
  const loadTimeMs = content.loadTime ?? 3000;
  const speedFromLoadTime = clamp(loadTimeMs <= 1800 ? 95 : loadTimeMs <= 2500 ? 80 : loadTimeMs <= 4000 ? 60 : loadTimeMs <= 5500 ? 45 : 30);

  // ── Accessibility: tiered thresholds (90+ for full points) ──────────────────
  const rawAccessibilityScore = typeof performanceMetrics?.accessibilityScore === 'number'
    ? clamp(performanceMetrics.accessibilityScore)
    : 65; // conservative fallback
  const normalizedAccessibilityScore = clamp(
    rawAccessibilityScore >= 90 ? 100 :
    rawAccessibilityScore >= 85 ? 85 :
    rawAccessibilityScore >= 80 ? 72 :
    rawAccessibilityScore >= 70 ? 55 :
    rawAccessibilityScore >= 60 ? 35 : 15
  );

  // ── HTML Validation: errors penalize heavily, warnings add smaller penalty ──
  const htmlErrors = performanceMetrics?.htmlValidation?.errors ?? 0;
  const htmlWarnings = performanceMetrics?.htmlValidation?.warnings ?? 0;
  // When the W3C validator is unavailable, use a neutral score (60) instead
  // of pretending HTML is perfect. Unknown ≠ valid.
  const htmlValidationScore = htmlValidationState === 'unknown'
    ? 60
    : clamp(
        (htmlErrors === 0
          ? 100
          : htmlErrors <= 2
            ? 78
            : htmlErrors <= 5
              ? 52
              : htmlErrors <= 10
                ? 30
                : 10) - Math.min(16, htmlWarnings * 2)
      );

  // ── Core Web Vitals: individual metric scores + penalty system ───────────────
  const coreWebVitals = performanceMetrics?.coreWebVitals;
  const speedFromVitals = typeof coreWebVitals?.score === 'number' ? clamp(coreWebVitals.score) : 65;

  const lcp = coreWebVitals?.lcp ?? 2500;
  const fid = coreWebVitals?.fid ?? 100;
  const cls = coreWebVitals?.cls ?? 0.1;

  const lcpScore = clamp(lcp <= 2500 ? 100 : lcp <= 4000 ? 70 : lcp <= 5000 ? 42 : 18);
  const fidScore = clamp(fid <= 100 ? 100 : fid <= 200 ? 72 : fid <= 300 ? 48 : 20);
  const clsScore = clamp(cls <= 0.1 ? 100 : cls <= 0.2 ? 68 : cls <= 0.25 ? 44 : 18);

  // Explicit penalties for failing CWV thresholds
  const coreWebVitalsPenalty =
    (lcp > 4000 ? 8 : 0) +
    (fid > 200 ? 8 : 0) +
    (cls > 0.1 ? 6 : 0) +
    (speedFromVitals < 75 ? 6 : 0);

  const adjustedCoreWebVitalsScore = clamp(
    speedFromVitals * 0.4 +
    lcpScore * 0.25 +
    fidScore * 0.2 +
    clsScore * 0.15 -
    coreWebVitalsPenalty
  );

  // ── Overall TH score ─────────────────────────────────────────────────────────
  // Shift weight toward performance signals (CWV, HTML, a11y, speed) and reduce
  // hygiene-check weight so TH scores differentiate more across sites.
  // Hygiene (HTTPS, robots, sitemap, canonical, viewport, responsive) = 0.35
  // Performance (CWV, speed, HTML validation, accessibility) = 0.65
  const score = clamp(
    (isHttps ? 100 : 20) * 0.06 +
    (robotsPresent ? (allowsBots ? 95 : 60) : 40) * 0.07 +
    (hasSitemapHint ? 90 : 45) * 0.05 +
    (hasCanonical ? 95 : 40) * 0.06 +
    (hasHreflang ? 75 : 60) * 0.02 +
    (hasViewport ? 95 : 35) * 0.05 +
    (hasResponsiveCss ? 85 : 40) * 0.04 +
    adjustedCoreWebVitalsScore * 0.22 +
    speedFromLoadTime * 0.13 +
    htmlValidationScore * 0.16 +
    normalizedAccessibilityScore * 0.14
  );

  // ── Findings & recommendations ───────────────────────────────────────────────

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

  // CWV penalty-based findings
  if (lcp > 4000) {
    findings.push(`LCP is ${lcp}ms — above the 4000ms poor threshold.`);
    recommendations.push({
      text: `Reduce Largest Contentful Paint on ${hostLabel} from ${lcp}ms to under 2500ms by optimizing hero images, preloading key assets, and reducing server response time.`,
      priority: 'high',
      category: 'core-web-vitals',
      timeToImplement: '~half day'
    });
  } else if (lcp > 2500) {
    findings.push(`LCP is ${lcp}ms — above the 2500ms good threshold.`);
    recommendations.push({
      text: `Improve Largest Contentful Paint on ${hostLabel} from ${lcp}ms to under 2500ms by optimizing image delivery and reducing render-blocking resources.`,
      priority: 'medium',
      category: 'core-web-vitals',
      timeToImplement: '~half day'
    });
  }

  if (fid > 200) {
    findings.push(`FID is ${fid}ms — above the 200ms poor threshold.`);
    recommendations.push({
      text: `Reduce First Input Delay on ${hostLabel} from ${fid}ms to under 100ms by splitting long JavaScript tasks and deferring non-critical scripts.`,
      priority: fid > 300 ? 'high' : 'medium',
      category: 'core-web-vitals',
      timeToImplement: '~half day'
    });
  }

  if (cls > 0.1) {
    findings.push(`CLS is ${cls} — above the 0.1 good threshold.`);
    recommendations.push({
      text: `Fix Cumulative Layout Shift on ${hostLabel} (current: ${cls}) by setting explicit dimensions on images/embeds and avoiding dynamically injected content above the fold.`,
      priority: cls > 0.25 ? 'high' : 'medium',
      category: 'core-web-vitals',
      timeToImplement: '~half day'
    });
  }

  if (htmlValidationState === 'invalid') {
    findings.push(`HTML validation failed with ${htmlErrors} error(s) and ${htmlWarnings} warning(s).`);
    recommendations.push({
      text: `Fix HTML validation issues on ${hostLabel} to reduce parser ambiguity for crawlers and browsers (current validator output: ${htmlErrors} errors, ${htmlWarnings} warnings).`,
      priority: htmlErrors > 10 ? 'high' : 'medium',
      category: 'html-validation',
      timeToImplement: '~half day'
    });
  } else if (htmlWarnings > 5) {
    findings.push(`HTML has ${htmlWarnings} warnings that could affect parser behavior.`);
    recommendations.push({
      text: `Address HTML warnings on ${hostLabel} to improve cross-browser consistency (current: ${htmlWarnings} warnings).`,
      priority: 'low',
      category: 'html-validation',
      timeToImplement: '~half day'
    });
  }

  if (rawAccessibilityScore < 70) {
    findings.push(`Accessibility score is ${rawAccessibilityScore}/100.`);
    recommendations.push({
      text: `Improve accessibility on ${hostLabel} to at least 90/100 by fixing semantic structure, labeling, and input/media accessibility issues (current score: ${rawAccessibilityScore}/100).`,
      priority: rawAccessibilityScore < 50 ? 'high' : 'medium',
      category: 'accessibility',
      timeToImplement: '~half day'
    });
  } else if (rawAccessibilityScore < 90) {
    findings.push(`Accessibility score is ${rawAccessibilityScore}/100 — below the 90 excellent threshold.`);
    recommendations.push({
      text: `Push accessibility on ${hostLabel} above 90/100 by addressing remaining ARIA, labeling, and semantic structure gaps (current score: ${rawAccessibilityScore}/100).`,
      priority: 'low',
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
      pageSpeedScore: speedFromVitals,
      adjustedCoreWebVitalsScore,
      lcpScore,
      fidScore,
      clsScore,
      coreWebVitalsPenalty,
      htmlValidationScore,
      htmlErrors,
      htmlWarnings,
      htmlValidationState,
      normalizedAccessibilityScore,
      rawAccessibilityScore,
      loadTimeMs,
      speedFromLoadTime
    }
  };
}
