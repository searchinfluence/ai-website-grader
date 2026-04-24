/**
 * @vitest-environment jsdom
 */
import { describe, expect, it, vi } from 'vitest';
import { WebsiteAnalysis } from '@/types';
import {
  createPrintReportUrl,
  generateMarkdownReport,
  downloadMarkdown,
  generatePDFReport,
} from '@/lib/exporters';

const buildAnalysis = (overrides: Partial<WebsiteAnalysis> = {}): WebsiteAnalysis => ({
  url: 'https://example.com',
  title: 'Hello',
  overallScore: 75,
  timestamp: '2026-04-23T10:00:00.000Z',
  analysisScope: 'page',
  factors: {
    contentStructure: { key: 'contentStructure', label: 'Content Structure', weight: 0.35, score: 80, status: 'good', findings: ['Looks good'], recommendations: [{ text: 'Keep H1 unique', priority: 'high', category: 'content-structure', timeToImplement: '~30 min' }], stats: {} },
    structuredData: { key: 'structuredData', label: 'Structured Data', weight: 0.25, score: 60, status: 'needs-improvement', findings: [], recommendations: [], stats: {} },
    technicalHealth: { key: 'technicalHealth', label: 'Technical Health', weight: 0.20, score: 75, status: 'good', findings: [], recommendations: [], stats: {} },
    pageSEO: { key: 'pageSEO', label: 'Page SEO', weight: 0.20, score: 80, status: 'good', findings: [], recommendations: [], stats: {} },
  },
  recommendations: [{ text: 'Top thing to do', priority: 'high', category: 'top', timeToImplement: '~1 hour' }],
  rawStats: {},
  contentImprovements: [],
  ...overrides,
});

describe('createPrintReportUrl', () => {
  it('writes the analysis to localStorage and returns a /print-report URL', () => {
    const url = createPrintReportUrl(buildAnalysis(), 'print');
    expect(url.startsWith('/print-report?key=')).toBe(true);
    expect(url).toContain('mode=print');
    expect(url).not.toContain('autoPrint');
    const key = decodeURIComponent(url.split('key=')[1].split('&')[0]);
    const stored = JSON.parse(localStorage.getItem(key)!);
    expect(stored.url).toBe('https://example.com');
  });

  it('appends autoPrint=true when requested and includes mode=pdf', () => {
    const url = createPrintReportUrl(buildAnalysis(), 'pdf', true);
    expect(url).toContain('mode=pdf');
    expect(url).toContain('autoPrint=true');
  });
});

describe('generateMarkdownReport', () => {
  it('includes the 4-factor table with each factor row', () => {
    const md = generateMarkdownReport(buildAnalysis());
    expect(md).toContain('# AI Website Grader Report');
    expect(md).toContain('**Website:** https://example.com');
    expect(md).toContain('**Overall Score:** 75%');
    expect(md).toContain('| **Content Structure** | 80%');
    expect(md).toContain('| **Structured Data** | 60%');
    expect(md).toContain('| **Technical Health** | 75%');
    expect(md).toContain('| **Page SEO** | 80%');
  });

  it('includes priority recommendations and per-factor sections', () => {
    const md = generateMarkdownReport(buildAnalysis());
    expect(md).toContain('## Priority Recommendations');
    expect(md).toContain('Top thing to do');
    expect(md).toContain('## Content Structure (80%)');
    expect(md).toContain('Keep H1 unique');
  });

  it('renders the performance section when crawledContent has performanceMetrics', () => {
    const analysis = buildAnalysis({
      crawledContent: {
        title: 'x', metaDescription: '', headings: [], paragraphs: [], images: [], links: [],
        wordCount: 0, html: '', url: 'https://example.com', schemaMarkup: [],
        hasJavaScriptDependency: false,
        aiAnalysisData: {
          detectedEntities: { persons: [], organizations: [], locations: [], brands: [] },
          answerFormats: { qaCount: 0, listCount: 0, stepByStepCount: 0, definitionCount: 0 },
          authoritySignals: { authorBylines: [], publicationDates: [], credentialMentions: [], authorityLinks: [] },
          factualIndicators: { citations: 0, statistics: 0, dates: [], sources: [], externalLinks: 0 },
          botAccessibility: {
            aiBotDirectives: { gptBot: 'unspecified', googleExtended: 'unspecified', chatgptUser: 'unspecified', claudeWeb: 'unspecified', bingBot: 'unspecified', ccBot: 'unspecified', perplexityBot: 'unspecified' },
            metaRobotsAI: [],
            contentAvailability: 'full',
            botSimulation: { contentExtracted: 0, priorityContentFound: false, structuredDataPresent: false, accessibilityScore: 0 },
          },
          voiceSearchOptimization: { naturalLanguagePatterns: 0, conversationalContent: 0, questionFormats: 0, speakableContent: false },
          performanceMetrics: {
            coreWebVitals: { lcp: 1800, fid: 75, cls: 0.05, score: 90 },
            htmlValidation: { errors: 0, warnings: 0, isValid: true, validationState: 'valid', messages: [] },
            accessibilityScore: 92,
            performanceScore: 88,
          },
        },
      },
    });
    const md = generateMarkdownReport(analysis);
    expect(md).toContain('## Performance Analysis');
    expect(md).toContain('Core Web Vitals score: 90/100');
    expect(md).toContain('Accessibility score: 92/100');
  });

  it('synthesizes content improvements from top recommendations when none provided', () => {
    const md = generateMarkdownReport(buildAnalysis());
    expect(md).toContain('## Priority Content Improvements');
    expect(md).toContain('Top thing to do');
  });

  it('uses provided contentImprovements when present', () => {
    const md = generateMarkdownReport(buildAnalysis({
      contentImprovements: [
        {
          section: 'Hero copy',
          current: 'Old hero text',
          improved: 'New hero text',
          reasoning: 'It will help with click-through.',
          priority: 'high',
        },
      ],
    }));
    expect(md).toContain('### 1. Hero copy');
    expect(md).toContain('New hero text');
  });

  it('embeds the markdown page content section when present', () => {
    const md = generateMarkdownReport(buildAnalysis({
      crawledContent: {
        title: 'x', metaDescription: '', headings: [], paragraphs: [], images: [], links: [],
        wordCount: 0, html: '', url: '', schemaMarkup: [], hasJavaScriptDependency: false,
        markdownContent: '# Page\n\nBody.',
      },
    }));
    expect(md).toContain('## Page Content Structure (Markdown)');
    expect(md).toContain('# Page');
  });
});

describe('downloadMarkdown', () => {
  it('creates a blob, anchors a download, and revokes the URL', () => {
    const createObjectURL = vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:fake');
    const revokeObjectURL = vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => {});
    const clickSpy = vi.fn();

    const originalCreateElement = document.createElement.bind(document);
    vi.spyOn(document, 'createElement').mockImplementation((tag: string) => {
      const el = originalCreateElement(tag);
      if (tag === 'a') (el as HTMLAnchorElement).click = clickSpy;
      return el as HTMLElement;
    });

    downloadMarkdown('# hi', 'report.md');

    expect(createObjectURL).toHaveBeenCalled();
    expect(clickSpy).toHaveBeenCalled();
    expect(revokeObjectURL).toHaveBeenCalledWith('blob:fake');
  });
});

describe('generatePDFReport', () => {
  it('opens the print URL in a new window when window.open succeeds', async () => {
    const openSpy = vi.spyOn(window, 'open').mockReturnValue({} as Window);
    await generatePDFReport(buildAnalysis());
    expect(openSpy).toHaveBeenCalledWith(
      expect.stringContaining('/print-report?'),
      '_blank',
    );
  });

  it('falls back to navigating the current window when popup is blocked', async () => {
    vi.spyOn(window, 'open').mockReturnValue(null);
    const setItem = vi.spyOn(Storage.prototype, 'setItem');
    const original = window.location;
    Object.defineProperty(window, 'location', {
      writable: true,
      value: { ...original, href: '' },
    });
    await generatePDFReport(buildAnalysis());
    expect(setItem).toHaveBeenCalledWith('ai-grader-analysis-backup', expect.any(String));
    expect(window.location.href).toContain('/print-report?');
  });
});
