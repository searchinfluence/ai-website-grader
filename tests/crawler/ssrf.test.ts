import { afterEach, describe, expect, it, vi } from 'vitest';

vi.mock('node:dns/promises', () => ({
  default: { lookup: vi.fn() },
}));

import dns from 'node:dns/promises';
import { assertSafeTargetUrl } from '@/lib/crawler';

const mockLookup = vi.mocked(dns.lookup);

afterEach(() => {
  mockLookup.mockReset();
});

describe('assertSafeTargetUrl', () => {
  it('rejects localhost and loopback hostnames before DNS', async () => {
    await expect(assertSafeTargetUrl('http://localhost/x')).rejects.toThrow(/blocked/i);
    await expect(assertSafeTargetUrl('http://anything.localhost/x')).rejects.toThrow(/blocked/i);
    expect(mockLookup).not.toHaveBeenCalled();
  });

  it('rejects cloud metadata hosts before DNS', async () => {
    await expect(assertSafeTargetUrl('http://169.254.169.254/x')).rejects.toThrow();
    await expect(assertSafeTargetUrl('http://metadata.google.internal/x')).rejects.toThrow();
    await expect(assertSafeTargetUrl('http://metadata/x')).rejects.toThrow();
    await expect(assertSafeTargetUrl('http://100.100.100.200/x')).rejects.toThrow();
  });

  it('rejects IPv6 loopback before DNS', async () => {
    await expect(assertSafeTargetUrl('http://[::1]/x')).rejects.toThrow();
  });

  it('rejects RFC1918 private hostname literals', async () => {
    await expect(assertSafeTargetUrl('http://10.1.2.3/x')).rejects.toThrow(/Private/i);
    await expect(assertSafeTargetUrl('http://192.168.1.1/x')).rejects.toThrow(/Private/i);
    await expect(assertSafeTargetUrl('http://172.16.0.1/x')).rejects.toThrow(/Private/i);
  });

  it('throws when DNS resolves no addresses', async () => {
    mockLookup.mockResolvedValueOnce([] as never);
    await expect(assertSafeTargetUrl('https://example.com/x')).rejects.toThrow(/Could not resolve/i);
  });

  it('rejects when ANY resolved IP is private', async () => {
    mockLookup.mockResolvedValueOnce([
      { address: '93.184.216.34', family: 4 },
      { address: '10.0.0.5', family: 4 },
    ] as never);
    await expect(assertSafeTargetUrl('https://example.com/x')).rejects.toThrow(/Resolved.+not allowed/i);
  });

  it('passes when all resolved IPs are public', async () => {
    mockLookup.mockResolvedValueOnce([
      { address: '93.184.216.34', family: 4 },
      { address: '2606:2800:220:1:248:1893:25c8:1946', family: 6 },
    ] as never);
    await expect(assertSafeTargetUrl('https://example.com/x')).resolves.toBeUndefined();
  });
});
