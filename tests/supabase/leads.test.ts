import { afterEach, describe, expect, it, vi } from 'vitest';

const mockGetClient = vi.fn();
vi.mock('@/lib/supabase/admin', () => ({
  getSupabaseAdminClient: () => mockGetClient(),
}));

import { saveLeadCapture } from '@/lib/supabase/leads';

afterEach(() => {
  mockGetClient.mockReset();
});

describe('saveLeadCapture', () => {
  it('throws when supabase is not configured', async () => {
    mockGetClient.mockReturnValue(null);
    await expect(
      saveLeadCapture({ name: 'A', email: 'a@b.com' }),
    ).rejects.toThrow(/not configured/i);
  });

  it('inserts a lead with defaults for missing fields', async () => {
    const insert = vi.fn().mockResolvedValue({ error: null });
    const from = vi.fn().mockReturnValue({ insert });
    mockGetClient.mockReturnValue({ from });

    await saveLeadCapture({ name: 'Ada', email: 'ada@b.com' });

    expect(from).toHaveBeenCalledWith('leads');
    expect(insert).toHaveBeenCalledWith({
      name: 'Ada',
      email: 'ada@b.com',
      company: null,
      source: 'ai-website-grader-v3',
    });
  });

  it('passes through company and source when provided', async () => {
    const insert = vi.fn().mockResolvedValue({ error: null });
    mockGetClient.mockReturnValue({ from: () => ({ insert }) });

    await saveLeadCapture({ name: 'Ada', email: 'ada@b.com', company: 'Acme', source: 'export-modal' });

    expect(insert).toHaveBeenCalledWith({
      name: 'Ada',
      email: 'ada@b.com',
      company: 'Acme',
      source: 'export-modal',
    });
  });

  it('translates "leads does not exist" errors into a clear migration hint', async () => {
    const insert = vi.fn().mockResolvedValue({
      error: { message: 'relation "leads" does not exist' },
    });
    mockGetClient.mockReturnValue({ from: () => ({ insert }) });

    await expect(
      saveLeadCapture({ name: 'A', email: 'a@b.com' }),
    ).rejects.toThrow(/Run the Supabase migration/);
  });

  it('rethrows other errors with the supabase message', async () => {
    const insert = vi.fn().mockResolvedValue({ error: { message: 'permission denied' } });
    mockGetClient.mockReturnValue({ from: () => ({ insert }) });

    await expect(
      saveLeadCapture({ name: 'A', email: 'a@b.com' }),
    ).rejects.toThrow(/permission denied/);
  });
});
