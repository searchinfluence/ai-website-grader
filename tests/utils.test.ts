import { describe, expect, it } from 'vitest';
import {
  formatScore,
  getScoreColor,
  getScoreStatus,
  formatDate,
  truncateText,
  validateUrl,
  normalizeUrl,
} from '@/lib/utils';

describe('formatScore', () => {
  it('appends a percent sign', () => {
    expect(formatScore(0)).toBe('0%');
    expect(formatScore(50)).toBe('50%');
    expect(formatScore(100)).toBe('100%');
  });
});

describe('getScoreColor', () => {
  it('maps 80+ to green', () => {
    expect(getScoreColor(100)).toBe('text-green-600');
    expect(getScoreColor(80)).toBe('text-green-600');
  });

  it('maps 70-79 to cyan', () => {
    expect(getScoreColor(79)).toBe('text-cyan-700');
    expect(getScoreColor(70)).toBe('text-cyan-700');
  });

  it('maps 50-69 to blue', () => {
    expect(getScoreColor(69)).toBe('text-blue-700');
    expect(getScoreColor(50)).toBe('text-blue-700');
  });

  it('maps below 50 to orange', () => {
    expect(getScoreColor(49)).toBe('text-orange-600');
    expect(getScoreColor(0)).toBe('text-orange-600');
  });
});

describe('getScoreStatus', () => {
  it('uses 80/70/50 thresholds', () => {
    expect(getScoreStatus(80)).toBe('excellent');
    expect(getScoreStatus(79)).toBe('good');
    expect(getScoreStatus(70)).toBe('good');
    expect(getScoreStatus(69)).toBe('needs-improvement');
    expect(getScoreStatus(50)).toBe('needs-improvement');
    expect(getScoreStatus(49)).toBe('poor');
    expect(getScoreStatus(0)).toBe('poor');
  });
});

describe('formatDate', () => {
  it('returns a non-empty localized string for an ISO timestamp', () => {
    const formatted = formatDate('2026-04-23T15:30:00Z');
    expect(typeof formatted).toBe('string');
    expect(formatted.length).toBeGreaterThan(0);
    expect(formatted).toMatch(/2026/);
  });
});

describe('truncateText', () => {
  it('returns input unchanged when under the limit', () => {
    expect(truncateText('hello', 10)).toBe('hello');
  });

  it('returns input unchanged at exactly the limit', () => {
    expect(truncateText('hello', 5)).toBe('hello');
  });

  it('truncates and appends an ellipsis when over the limit', () => {
    expect(truncateText('hello world', 5)).toBe('hello...');
  });
});

describe('validateUrl', () => {
  it('accepts http and https URLs', () => {
    expect(validateUrl('https://example.com')).toBe(true);
    expect(validateUrl('http://example.com')).toBe(true);
  });

  it('accepts bare hostnames by prepending https://', () => {
    expect(validateUrl('example.com')).toBe(true);
  });

  it('rejects garbage that cannot be parsed', () => {
    expect(validateUrl('not a url with spaces')).toBe(false);
  });
});

describe('normalizeUrl', () => {
  it('returns https:// URLs untouched', () => {
    expect(normalizeUrl('https://example.com')).toBe('https://example.com');
  });

  it('returns http:// URLs untouched', () => {
    expect(normalizeUrl('http://example.com')).toBe('http://example.com');
  });

  it('prepends https:// to bare hostnames', () => {
    expect(normalizeUrl('example.com')).toBe('https://example.com');
  });
});
