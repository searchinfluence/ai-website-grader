import { afterEach, describe, expect, it, vi } from 'vitest';

const mockSaveLead = vi.fn();
const mockPushHubspot = vi.fn();

vi.mock('@/lib/supabase/leads', () => ({
  saveLeadCapture: (...args: unknown[]) => mockSaveLead(...args),
}));
vi.mock('@/lib/hubspot', () => ({
  pushContactToHubSpot: (...args: unknown[]) => mockPushHubspot(...args),
}));

import { POST } from '@/app/api/leads/route';

const buildReq = (body: unknown) =>
  ({ json: async () => body }) as unknown as Parameters<typeof POST>[0];

afterEach(() => {
  mockSaveLead.mockReset();
  mockPushHubspot.mockReset();
});

describe('POST /api/leads', () => {
  it('returns 400 when name is missing', async () => {
    const res = await POST(buildReq({ email: 'a@b.com' }));
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toMatch(/Name/i);
    expect(mockSaveLead).not.toHaveBeenCalled();
  });

  it('returns 400 when email is invalid', async () => {
    const res = await POST(buildReq({ name: 'A', email: 'not-an-email' }));
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toMatch(/email/i);
  });

  it('saves the lead, pushes to HubSpot, and returns ok', async () => {
    mockSaveLead.mockResolvedValue(undefined);
    mockPushHubspot.mockResolvedValue(undefined);

    const res = await POST(buildReq({ name: 'Ada', email: 'A@B.com', company: 'Acme' }));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body).toEqual({ ok: true });

    expect(mockSaveLead).toHaveBeenCalledWith({
      name: 'Ada',
      email: 'a@b.com',
      company: 'Acme',
      source: 'export-gate',
    });
    expect(mockPushHubspot).toHaveBeenCalledWith({
      email: 'a@b.com',
      firstname: 'Ada',
      company: 'Acme',
      lead_source: 'AI Website Grader',
    });
  });

  it('still returns 200 when HubSpot push throws (non-blocking)', async () => {
    mockSaveLead.mockResolvedValue(undefined);
    mockPushHubspot.mockRejectedValue(new Error('hubspot down'));

    const res = await POST(buildReq({ name: 'A', email: 'a@b.com' }));
    expect(res.status).toBe(200);
  });

  it('returns 500 when supabase save fails', async () => {
    mockSaveLead.mockRejectedValue(new Error('db boom'));
    const res = await POST(buildReq({ name: 'A', email: 'a@b.com' }));
    expect(res.status).toBe(500);
    const body = await res.json();
    expect(body.error).toMatch(/db boom/);
  });
});
