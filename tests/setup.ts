import { afterEach, beforeEach, vi } from 'vitest';

// Network isolation: every test starts with `fetch` stubbed to throw a clear
// error. Tests that need a specific response should re-stub fetch in their
// own beforeEach. If you see "FETCH BLOCKED IN TESTS" in a test failure,
// the code under test made a real network call — mock it explicitly.
beforeEach(() => {
  vi.stubGlobal(
    'fetch',
    vi.fn(async (input: unknown) => {
      throw new Error(
        `FETCH BLOCKED IN TESTS: tests must not hit the network. URL=${String(input)}`,
      );
    }),
  );
});

afterEach(() => {
  vi.unstubAllGlobals();
});

// Global mock for the performance APIs so any code path that ends up calling
// them (parseHtmlContent, analyzeWebsite, etc.) gets a deterministic stub
// instead of hitting PageSpeed Insights or the W3C validator.
vi.mock('@/lib/performance-apis', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/lib/performance-apis')>();
  return {
    ...actual,
    analyzePerformanceMetrics: vi.fn(async () => ({
      coreWebVitals: { lcp: 2000, fid: 50, cls: 0.05, score: 85 },
      htmlValidation: {
        errors: 0,
        warnings: 0,
        isValid: true,
        validationState: 'valid' as const,
        messages: [],
      },
      accessibilityScore: 90,
      performanceScore: 85,
    })),
    getPageSpeedInsights: vi.fn(async () => ({
      coreWebVitals: { lcp: 2000, fid: 50, cls: 0.05, score: 85 },
      performanceScore: 85,
      accessibilityScore: 90,
    })),
    validateHTML: vi.fn(async () => ({
      errors: 0,
      warnings: 0,
      isValid: true,
      validationState: 'valid' as const,
      messages: [],
    })),
  };
});

// Mock dns.lookup so any code path that ends up resolving a hostname during
// tests gets a stub instead of doing real DNS. Tests that need specific DNS
// behavior (e.g. ssrf.test.ts) override this with vi.mocked(dns.lookup).
vi.mock('node:dns/promises', () => ({
  default: {
    lookup: vi.fn(async () => [{ address: '93.184.216.34', family: 4 }]),
  },
}));
