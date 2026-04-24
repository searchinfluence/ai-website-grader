import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

// HUBSPOT_ACCESS_TOKEN is captured at module-load time, so each test
// resets modules and re-imports after setting (or unsetting) the env var.
async function importHubSpot() {
  return await import('@/lib/hubspot');
}

afterEach(() => {
  vi.unstubAllGlobals();
  vi.resetModules();
  delete process.env.HUBSPOT_ACCESS_TOKEN;
});

describe('pushContactToHubSpot', () => {
  it('skips entirely when HUBSPOT_ACCESS_TOKEN is not set', async () => {
    delete process.env.HUBSPOT_ACCESS_TOKEN;
    vi.resetModules();
    const fetchSpy = vi.fn();
    vi.stubGlobal('fetch', fetchSpy);

    const { pushContactToHubSpot } = await importHubSpot();
    await pushContactToHubSpot({ email: 'a@b.com', firstname: 'A' });

    expect(fetchSpy).not.toHaveBeenCalled();
  });

  describe('with token set', () => {
    beforeEach(() => {
      process.env.HUBSPOT_ACCESS_TOKEN = 'test-token';
      vi.resetModules();
    });

    it('POSTs a create call with email/firstname/lastname properties', async () => {
      let receivedInit: RequestInit | undefined;
      vi.stubGlobal(
        'fetch',
        vi.fn(async (_url: unknown, init?: RequestInit) => {
          receivedInit = init;
          return new Response(JSON.stringify({ id: '123' }), { status: 201 });
        }),
      );

      const { pushContactToHubSpot } = await importHubSpot();
      await pushContactToHubSpot({ email: 'a@b.com', firstname: 'Ada', lastname: 'Lovelace' });

      const body = JSON.parse(String(receivedInit?.body));
      expect(body.properties).toEqual({ email: 'a@b.com', firstname: 'Ada', lastname: 'Lovelace' });
      expect((receivedInit?.headers as Record<string, string>).Authorization).toBe('Bearer test-token');
    });

    it('splits a single firstname containing a space into first/last', async () => {
      let body: { properties: Record<string, string> } = { properties: {} };
      vi.stubGlobal(
        'fetch',
        vi.fn(async (_url: unknown, init?: RequestInit) => {
          body = JSON.parse(String(init?.body));
          return new Response('{}', { status: 201 });
        }),
      );

      const { pushContactToHubSpot } = await importHubSpot();
      await pushContactToHubSpot({ email: 'a@b.com', firstname: 'Grace Hopper' });

      expect(body.properties.firstname).toBe('Grace');
      expect(body.properties.lastname).toBe('Hopper');
    });

    it('includes company when provided and sets hs_lead_status when lead_source provided', async () => {
      let body: { properties: Record<string, string> } = { properties: {} };
      vi.stubGlobal(
        'fetch',
        vi.fn(async (_url: unknown, init?: RequestInit) => {
          body = JSON.parse(String(init?.body));
          return new Response('{}', { status: 201 });
        }),
      );

      const { pushContactToHubSpot } = await importHubSpot();
      await pushContactToHubSpot({
        email: 'a@b.com',
        firstname: 'A',
        company: 'Acme',
        lead_source: 'export-gate',
      });

      expect(body.properties.company).toBe('Acme');
      expect(body.properties.hs_lead_status).toBe('NEW');
    });

    it('on 409 conflict, extracts existing ID and PATCHes the contact', async () => {
      const calls: Array<{ url: string; init?: RequestInit }> = [];
      vi.stubGlobal(
        'fetch',
        vi.fn(async (url: unknown, init?: RequestInit) => {
          calls.push({ url: String(url), init });
          if (calls.length === 1) {
            return new Response(
              JSON.stringify({ message: 'Contact already exists. Existing ID: 555' }),
              { status: 409 },
            );
          }
          return new Response('{}', { status: 200 });
        }),
      );

      const { pushContactToHubSpot } = await importHubSpot();
      await pushContactToHubSpot({ email: 'a@b.com', firstname: 'A' });

      expect(calls.length).toBe(2);
      expect(calls[1].url).toContain('/contacts/555');
      expect(calls[1].init?.method).toBe('PATCH');
    });

    it('on 409 with id field in body, uses that id', async () => {
      const calls: Array<string> = [];
      vi.stubGlobal(
        'fetch',
        vi.fn(async (url: unknown) => {
          calls.push(String(url));
          if (calls.length === 1) {
            return new Response(JSON.stringify({ id: '777' }), { status: 409 });
          }
          return new Response('{}', { status: 200 });
        }),
      );

      const { pushContactToHubSpot } = await importHubSpot();
      await pushContactToHubSpot({ email: 'a@b.com', firstname: 'A' });

      expect(calls[1]).toContain('/contacts/777');
    });

    it('does NOT throw when fetch itself rejects (network error swallowed)', async () => {
      vi.stubGlobal(
        'fetch',
        vi.fn(async () => {
          throw new Error('network down');
        }),
      );

      const { pushContactToHubSpot } = await importHubSpot();
      await expect(pushContactToHubSpot({ email: 'a@b.com', firstname: 'A' })).resolves.toBeUndefined();
    });

    it('does NOT throw on a non-409 error response', async () => {
      vi.stubGlobal(
        'fetch',
        vi.fn(async () => new Response(JSON.stringify({ error: 'bad' }), { status: 400 })),
      );

      const { pushContactToHubSpot } = await importHubSpot();
      await expect(pushContactToHubSpot({ email: 'a@b.com', firstname: 'A' })).resolves.toBeUndefined();
    });

    it('on 409 with no parseable ID anywhere, logs and returns without throwing', async () => {
      vi.stubGlobal(
        'fetch',
        vi.fn(async () => new Response(JSON.stringify({ message: 'Conflict but no id' }), { status: 409 })),
      );
      const { pushContactToHubSpot } = await importHubSpot();
      await expect(pushContactToHubSpot({ email: 'a@b.com', firstname: 'A' })).resolves.toBeUndefined();
    });

    it('does NOT throw when the PATCH update fails after a 409', async () => {
      let calls = 0;
      vi.stubGlobal(
        'fetch',
        vi.fn(async () => {
          calls += 1;
          if (calls === 1) return new Response(JSON.stringify({ id: '123' }), { status: 409 });
          return new Response('forbidden', { status: 403 });
        }),
      );
      const { pushContactToHubSpot } = await importHubSpot();
      await expect(pushContactToHubSpot({ email: 'a@b.com', firstname: 'A' })).resolves.toBeUndefined();
    });
  });
});
