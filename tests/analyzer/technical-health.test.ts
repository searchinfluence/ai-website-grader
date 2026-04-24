import { describe, expect, it } from 'vitest';
import { analyzeTechnicalHealth } from '@/lib/analyzer/technical-health';
import { buildCrawledContent } from '../fixtures/crawled-content';

const aiData = (overrides: Record<string, unknown> = {}) => ({
  detectedEntities: { persons: [], organizations: [], locations: [], brands: [] },
  answerFormats: { qaCount: 0, listCount: 0, stepByStepCount: 0, definitionCount: 0 },
  authoritySignals: { authorBylines: [], publicationDates: [], credentialMentions: [], authorityLinks: [] },
  factualIndicators: { citations: 0, statistics: 0, dates: [], sources: [], externalLinks: 0 },
  botAccessibility: {
    aiBotDirectives: {
      gptBot: 'unspecified', googleExtended: 'unspecified', chatgptUser: 'unspecified',
      claudeWeb: 'unspecified', bingBot: 'unspecified', ccBot: 'unspecified', perplexityBot: 'unspecified',
    },
    metaRobotsAI: [],
    contentAvailability: 'full',
    botSimulation: { contentExtracted: 0, priorityContentFound: false, structuredDataPresent: false, accessibilityScore: 0 },
  },
  voiceSearchOptimization: { naturalLanguagePatterns: 0, conversationalContent: 0, questionFormats: 0, speakableContent: false },
  ...overrides,
});

describe('analyzeTechnicalHealth', () => {
  it('returns the technicalHealth factor', () => {
    const result = analyzeTechnicalHealth(buildCrawledContent());
    expect(result.key).toBe('technicalHealth');
    expect(result.label).toBe('Technical Health');
    expect(result.weight).toBeCloseTo(0.20, 5);
    expect(result.score).toBeGreaterThanOrEqual(0);
    expect(result.score).toBeLessThanOrEqual(100);
  });

  it('flags non-HTTPS URLs', () => {
    const result = analyzeTechnicalHealth(buildCrawledContent({ url: 'http://example.com/path' }));
    expect(result.stats.https).toBe(false);
    expect(result.recommendations.some((r) => r.priority === 'high' && r.category === 'security')).toBe(true);
  });

  it('flags missing robots.txt and missing bot allowance', () => {
    const noRobots = analyzeTechnicalHealth(buildCrawledContent({ robotsInfo: undefined }));
    expect(noRobots.recommendations.some((r) => r.category === 'crawlability')).toBe(true);

    const blocked = analyzeTechnicalHealth(buildCrawledContent({
      robotsInfo: { hasRobotsTxt: true, allowsAllBots: false, hasSpecificBotRules: true, content: 'User-agent: *\nDisallow: /' },
    }));
    expect(blocked.recommendations.some((r) => r.category === 'crawlability')).toBe(true);
  });

  it('flags missing sitemap reference in robots.txt and html', () => {
    const result = analyzeTechnicalHealth(buildCrawledContent({
      robotsInfo: { hasRobotsTxt: true, allowsAllBots: true, hasSpecificBotRules: false, content: 'User-agent: *\nAllow: /' },
      html: '<html><head></head><body></body></html>',
    }));
    expect(result.stats.hasSitemapHint).toBe(false);
    expect(result.recommendations.some((r) => r.category === 'sitemap')).toBe(true);
  });

  it('flags missing canonical', () => {
    const result = analyzeTechnicalHealth(buildCrawledContent({ html: '<html><head></head><body></body></html>' }));
    expect(result.stats.hasCanonical).toBe(false);
    expect(result.recommendations.some((r) => r.category === 'canonical')).toBe(true);
  });

  it('detects canonical and hreflang tags', () => {
    const result = analyzeTechnicalHealth(buildCrawledContent({
      html: `<html><head><link rel="canonical" href="https://example.com/x"/><link rel="alternate" hreflang="en" href="/en"/></head></html>`,
    }));
    expect(result.stats.hasCanonical).toBe(true);
    expect(result.stats.hasHreflang).toBe(true);
  });

  it('flags missing viewport or responsive CSS', () => {
    const result = analyzeTechnicalHealth(buildCrawledContent({
      mobileInfo: {
        hasViewportMeta: false,
        hasTouchableElements: false,
        usesResponsiveImages: false,
        mobileOptimizedCSS: false,
      },
    }));
    expect(result.recommendations.some((r) => r.priority === 'high' && r.category === 'mobile-tech')).toBe(true);
  });

  it('flags slow LCP with high priority above 4000ms', () => {
    const result = analyzeTechnicalHealth(buildCrawledContent({
      aiAnalysisData: aiData({
        performanceMetrics: { coreWebVitals: { lcp: 5000, fid: 50, cls: 0.05, score: 60 } },
      }) as never,
    }));
    expect(result.recommendations.some((r) => r.priority === 'high' && r.category === 'core-web-vitals')).toBe(true);
  });

  it('flags moderate LCP between 2500ms and 4000ms with medium priority', () => {
    const result = analyzeTechnicalHealth(buildCrawledContent({
      aiAnalysisData: aiData({
        performanceMetrics: { coreWebVitals: { lcp: 3500, fid: 50, cls: 0.05, score: 70 } },
      }) as never,
    }));
    const cwvRecs = result.recommendations.filter((r) => r.category === 'core-web-vitals');
    expect(cwvRecs.some((r) => /Largest Contentful Paint/.test(r.text))).toBe(true);
  });

  it('flags FID and CLS over their thresholds', () => {
    const result = analyzeTechnicalHealth(buildCrawledContent({
      aiAnalysisData: aiData({
        performanceMetrics: { coreWebVitals: { lcp: 2000, fid: 350, cls: 0.3, score: 40 } },
      }) as never,
    }));
    expect(result.recommendations.some((r) => r.priority === 'high' && /First Input Delay/.test(r.text))).toBe(true);
    expect(result.recommendations.some((r) => r.priority === 'high' && /Cumulative Layout Shift/.test(r.text))).toBe(true);
  });

  it('flags HTML validation errors', () => {
    const invalid = analyzeTechnicalHealth(buildCrawledContent({
      aiAnalysisData: aiData({
        performanceMetrics: {
          htmlValidation: { errors: 15, warnings: 4, isValid: false, validationState: 'invalid', messages: [] },
        },
      }) as never,
    }));
    expect(invalid.recommendations.some((r) => r.priority === 'high' && r.category === 'html-validation')).toBe(true);

    const warnings = analyzeTechnicalHealth(buildCrawledContent({
      aiAnalysisData: aiData({
        performanceMetrics: {
          htmlValidation: { errors: 0, warnings: 10, isValid: true, validationState: 'valid', messages: [] },
        },
      }) as never,
    }));
    expect(warnings.recommendations.some((r) => r.priority === 'low' && r.category === 'html-validation')).toBe(true);
  });

  it('flags low accessibility score and escalates to high under 50', () => {
    const low = analyzeTechnicalHealth(buildCrawledContent({
      aiAnalysisData: aiData({ performanceMetrics: { accessibilityScore: 40 } }) as never,
    }));
    expect(low.recommendations.some((r) => r.priority === 'high' && r.category === 'accessibility')).toBe(true);

    const moderate = analyzeTechnicalHealth(buildCrawledContent({
      aiAnalysisData: aiData({ performanceMetrics: { accessibilityScore: 60 } }) as never,
    }));
    expect(moderate.recommendations.some((r) => r.priority === 'medium' && r.category === 'accessibility')).toBe(true);

    const nearTop = analyzeTechnicalHealth(buildCrawledContent({
      aiAnalysisData: aiData({ performanceMetrics: { accessibilityScore: 85 } }) as never,
    }));
    expect(nearTop.recommendations.some((r) => r.priority === 'low' && r.category === 'accessibility')).toBe(true);
  });

  it('flags slow load time over 3000ms', () => {
    const result = analyzeTechnicalHealth(buildCrawledContent({ loadTime: 4500 }));
    expect(result.recommendations.some((r) => r.category === 'performance')).toBe(true);
  });

  it('keeps a high score for an excellent site (HTTPS, robots, canonical, viewport, fast)', () => {
    const result = analyzeTechnicalHealth(buildCrawledContent({
      html: '<html><head><link rel="canonical" href="x"/><link href="/sitemap.xml" rel="sitemap"/></head></html>',
      robotsInfo: {
        hasRobotsTxt: true,
        allowsAllBots: true,
        hasSpecificBotRules: false,
        content: 'User-agent: *\nAllow: /\nSitemap: https://example.com/sitemap.xml',
      },
      loadTime: 1000,
      aiAnalysisData: aiData({
        performanceMetrics: {
          coreWebVitals: { lcp: 1500, fid: 50, cls: 0.05, score: 95 },
          htmlValidation: { errors: 0, warnings: 0, isValid: true, validationState: 'valid', messages: [] },
          accessibilityScore: 95,
        },
      }) as never,
    }));
    expect(result.score).toBeGreaterThanOrEqual(80);
  });
});
