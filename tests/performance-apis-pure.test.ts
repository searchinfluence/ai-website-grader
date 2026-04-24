import { describe, expect, it, vi } from 'vitest';

// Use the real (not globally mocked) module for these pure-helper tests.
// The global mock in tests/setup.ts replaces analyzePerformanceMetrics /
// getPageSpeedInsights / validateHTML; the helpers below are still real.
import {
  analyzeAccessibility,
  performanceCache,
  analysisCache,
  createCacheKey,
  shouldUseCache,
} from '@/lib/performance-apis';

describe('analyzeAccessibility', () => {
  it('returns a baseline score for empty html', () => {
    const score = analyzeAccessibility('');
    expect(score).toBeGreaterThanOrEqual(40);
    expect(score).toBeLessThanOrEqual(100);
  });

  it('rewards alt text on images', () => {
    const noAlt = analyzeAccessibility('<img src="/a.png"><img src="/b.png">');
    const withAlt = analyzeAccessibility('<img src="/a.png" alt="A"><img src="/b.png" alt="B">');
    expect(withAlt).toBeGreaterThan(noAlt);
  });

  it('rewards heading hierarchy presence', () => {
    const none = analyzeAccessibility('<div>plain</div>');
    const withHeadings = analyzeAccessibility('<h1>Title</h1><h2>Sub</h2>');
    expect(withHeadings).toBeGreaterThan(none);
  });

  it('rewards ARIA attributes (capped)', () => {
    const none = analyzeAccessibility('<div></div>');
    const withAria = analyzeAccessibility('<div aria-label="X"></div><div aria-hidden="true"></div>');
    expect(withAria).toBeGreaterThan(none);
  });

  it('rewards form labels paired with inputs', () => {
    const none = analyzeAccessibility('<form><input><input></form>');
    const labeled = analyzeAccessibility('<form><label>Name</label><input><label>Email</label><input></form>');
    expect(labeled).toBeGreaterThan(none);
  });

  it('rewards semantic HTML5 elements', () => {
    const div = analyzeAccessibility('<div>content</div>');
    const semantic = analyzeAccessibility('<header></header><nav></nav><main></main><footer></footer>');
    expect(semantic).toBeGreaterThan(div);
  });

  it('caps the score at 100', () => {
    const huge = analyzeAccessibility(
      '<header></header><nav></nav><main></main><footer></footer><article></article><section></section><aside></aside>' +
      Array.from({ length: 30 }, (_, i) => `<img src="/${i}.png" alt="${i}"><div aria-label="x${i}"></div>`).join('') +
      '<form><label></label><input><label></label><input><label></label><input></form>' +
      '<h1></h1><h2></h2>',
    );
    expect(huge).toBeLessThanOrEqual(100);
  });
});

describe('performanceCache (SimpleCache)', () => {
  it('round-trips a value within its TTL', () => {
    const value = { coreWebVitals: { lcp: 1, fid: 2, cls: 0.1, score: 99 } };
    performanceCache.set('round-trip', value);
    expect(performanceCache.get('round-trip')).toEqual(value);
  });

  it('returns null for an unknown key', () => {
    expect(performanceCache.get('not-set')).toBeNull();
  });

  it('expires entries past their TTL', () => {
    vi.useFakeTimers();
    try {
      performanceCache.set('expiring', { performanceScore: 1 } as never, 100);
      vi.advanceTimersByTime(50);
      expect(performanceCache.get('expiring')).not.toBeNull();
      vi.advanceTimersByTime(200);
      expect(performanceCache.get('expiring')).toBeNull();
    } finally {
      vi.useRealTimers();
    }
  });

  it('clear() removes everything', () => {
    performanceCache.set('a', { performanceScore: 1 } as never);
    performanceCache.set('b', { performanceScore: 2 } as never);
    performanceCache.clear();
    expect(performanceCache.get('a')).toBeNull();
    expect(performanceCache.get('b')).toBeNull();
  });
});

describe('analysisCache', () => {
  it('exists and works as a SimpleCache', () => {
    analysisCache.set('x', { hello: 'world' });
    expect(analysisCache.get('x')).toEqual({ hello: 'world' });
    analysisCache.clear();
    expect(analysisCache.get('x')).toBeNull();
  });
});

describe('createCacheKey', () => {
  it('combines analysis type and URL with non-alphanumerics replaced', () => {
    expect(createCacheKey('https://example.com/path?x=1', 'performance')).toBe(
      'performance:https___example_com_path_x_1',
    );
  });

  it('produces stable keys for the same url + type', () => {
    const a = createCacheKey('https://example.com/x', 'analysis');
    const b = createCacheKey('https://example.com/x', 'analysis');
    expect(a).toBe(b);
  });
});

describe('shouldUseCache', () => {
  it('returns false for localhost-style URLs', () => {
    expect(shouldUseCache('http://localhost:3000/x')).toBe(false);
    expect(shouldUseCache('http://127.0.0.1/x')).toBe(false);
  });

  it('returns true for public URLs', () => {
    expect(shouldUseCache('https://example.com/x')).toBe(true);
  });
});
