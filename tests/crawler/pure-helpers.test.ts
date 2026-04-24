import { describe, expect, it } from 'vitest';
import {
  normalizeUrl,
  isPrivateOrLocalIp,
  extractBalancedJsonObjects,
  extractGtmContainerId,
  parseTextContent,
} from '@/lib/crawler';

describe('crawler.normalizeUrl', () => {
  it('passes through https URLs', () => {
    expect(normalizeUrl('https://example.com/path')).toBe('https://example.com/path');
  });

  it('passes through http URLs', () => {
    expect(normalizeUrl('http://example.com/path')).toBe('http://example.com/path');
  });

  it('prepends https:// to bare hostnames', () => {
    expect(normalizeUrl('example.com')).toBe('https://example.com/');
  });

  it('throws on garbage that cannot be parsed as a URL', () => {
    expect(() => normalizeUrl('http://not a url')).toThrow(/Invalid URL/);
  });

  it('auto-prefixes https:// when input lacks an http/https scheme', () => {
    // The function doesn't reject other-protocol-looking input — it treats
    // the whole string as a hostname and prepends https://. SSRF protection
    // happens later in assertSafeTargetUrl, not here.
    const out = normalizeUrl('subdomain.example.com');
    expect(out.startsWith('https://')).toBe(true);
  });
});

describe('crawler.isPrivateOrLocalIp', () => {
  it('detects IPv4 loopback', () => {
    expect(isPrivateOrLocalIp('127.0.0.1')).toBe(true);
    expect(isPrivateOrLocalIp('127.255.0.1')).toBe(true);
  });

  it('detects 0.x.x.x', () => {
    expect(isPrivateOrLocalIp('0.0.0.0')).toBe(true);
  });

  it('detects RFC1918 private blocks', () => {
    expect(isPrivateOrLocalIp('10.0.0.1')).toBe(true);
    expect(isPrivateOrLocalIp('172.16.0.1')).toBe(true);
    expect(isPrivateOrLocalIp('172.31.255.255')).toBe(true);
    expect(isPrivateOrLocalIp('192.168.1.1')).toBe(true);
  });

  it('detects link-local 169.254.0.0/16', () => {
    expect(isPrivateOrLocalIp('169.254.169.254')).toBe(true); // AWS metadata
  });

  it('detects shared-address space 100.64.0.0/10', () => {
    expect(isPrivateOrLocalIp('100.64.0.1')).toBe(true);
    expect(isPrivateOrLocalIp('100.127.255.255')).toBe(true);
  });

  it('does NOT flag a public IPv4 address', () => {
    expect(isPrivateOrLocalIp('8.8.8.8')).toBe(false);
    expect(isPrivateOrLocalIp('1.1.1.1')).toBe(false);
  });

  it('detects IPv6 loopback and ULA/link-local prefixes', () => {
    expect(isPrivateOrLocalIp('::1')).toBe(true);
    expect(isPrivateOrLocalIp('fc00::1')).toBe(true);
    expect(isPrivateOrLocalIp('fd12:3456::1')).toBe(true);
    expect(isPrivateOrLocalIp('fe80::1')).toBe(true);
  });

  it('does NOT flag a public IPv6 address', () => {
    expect(isPrivateOrLocalIp('2001:4860:4860::8888')).toBe(false);
  });

  it('returns false for non-IP input', () => {
    expect(isPrivateOrLocalIp('example.com')).toBe(false);
    expect(isPrivateOrLocalIp('not-an-ip')).toBe(false);
  });
});

describe('crawler.extractBalancedJsonObjects', () => {
  it('extracts a single top-level JSON object', () => {
    const out = extractBalancedJsonObjects('var x = {"a":1};');
    expect(out).toEqual(['{"a":1}']);
  });

  it('extracts multiple consecutive objects', () => {
    const out = extractBalancedJsonObjects('{"a":1}{"b":2}');
    expect(out.length).toBe(2);
  });

  it('respects nested braces', () => {
    const out = extractBalancedJsonObjects('{"a":{"b":{"c":1}}}');
    expect(out).toEqual(['{"a":{"b":{"c":1}}}']);
  });

  it('ignores braces inside strings', () => {
    const out = extractBalancedJsonObjects('{"a":"value with } and { brace","b":2}');
    expect(out.length).toBe(1);
    expect(out[0]).toContain('value with } and { brace');
  });

  it('handles escaped quotes in strings', () => {
    const out = extractBalancedJsonObjects('{"a":"escaped \\" quote"}');
    expect(out.length).toBe(1);
  });

  it('returns empty for input with no objects', () => {
    expect(extractBalancedJsonObjects('plain text')).toEqual([]);
  });
});

describe('crawler.extractGtmContainerId', () => {
  it('finds GTM-XXXX in HTML', () => {
    expect(extractGtmContainerId('<script>(function(...){...GTM-ABC123...})</script>')).toBe('GTM-ABC123');
  });

  it('returns null when no GTM ID is present', () => {
    expect(extractGtmContainerId('<html><body></body></html>')).toBeNull();
  });

  it('only returns the first match', () => {
    expect(extractGtmContainerId('GTM-FIRST and later GTM-SECOND')).toBe('GTM-FIRST');
  });
});

describe('crawler.parseTextContent', () => {
  it('returns a CrawledContent with manual-input defaults', async () => {
    const content = await parseTextContent('Hello world.\nSecond paragraph.');
    expect(content.url).toBe('manual-input');
    expect(content.robotsInfo?.hasRobotsTxt).toBe(false);
    expect(content.mobileInfo?.hasViewportMeta).toBe(false);
    expect(content.markdownContent).toContain('Hello world');
  });

  it('produces non-zero word count for non-empty input', async () => {
    const content = await parseTextContent('Lorem ipsum dolor sit amet, consectetur adipiscing.');
    expect(content.wordCount).toBeGreaterThan(0);
  });
});
