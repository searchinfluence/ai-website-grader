const HUBSPOT_ACCESS_TOKEN = process.env.HUBSPOT_ACCESS_TOKEN;

export type HubSpotContactInput = {
  email: string;
  firstname: string;
  lastname?: string;
  company?: string;
  lead_source?: string;
};

/**
 * Create or update a HubSpot contact.
 * Uses the v3 contacts API with createOrUpdate (by email).
 * Non-blocking: logs errors but doesn't throw so it won't break the lead flow.
 */
export async function pushContactToHubSpot(input: HubSpotContactInput): Promise<void> {
  if (!HUBSPOT_ACCESS_TOKEN) {
    console.warn('HUBSPOT_ACCESS_TOKEN not set — skipping HubSpot push.');
    return;
  }

  // Split name into first/last if only firstname is provided and contains a space
  let firstname = input.firstname;
  let lastname = input.lastname || '';
  if (!lastname && firstname.includes(' ')) {
    const parts = firstname.split(' ');
    firstname = parts[0];
    lastname = parts.slice(1).join(' ');
  }

  const properties: Record<string, string> = {
    email: input.email,
    firstname,
    lastname,
  };

  if (input.company) {
    properties.company = input.company;
  }

  if (input.lead_source) {
    properties.hs_lead_status = 'NEW';
  }

  try {
    // Try to create the contact first
    const createRes = await fetch('https://api.hubapi.com/crm/v3/objects/contacts', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${HUBSPOT_ACCESS_TOKEN}`,
      },
      body: JSON.stringify({ properties }),
    });

    if (createRes.ok) {
      console.log(`HubSpot: created contact for ${input.email}`);
      return;
    }

    const errBody = await createRes.json().catch(() => ({}));

    // If contact already exists (409 conflict), update instead
    if (createRes.status === 409) {
      const existingId =
        errBody?.message?.match(/Existing ID: (\d+)/)?.[1] ??
        errBody?.id;

      if (existingId) {
        const updateRes = await fetch(
          `https://api.hubapi.com/crm/v3/objects/contacts/${existingId}`,
          {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${HUBSPOT_ACCESS_TOKEN}`,
            },
            body: JSON.stringify({ properties }),
          }
        );
        if (updateRes.ok) {
          console.log(`HubSpot: updated existing contact ${existingId} for ${input.email}`);
        } else {
          console.error(`HubSpot: failed to update contact ${existingId}:`, await updateRes.text());
        }
      } else {
        console.error('HubSpot: contact exists but could not extract ID from error:', errBody);
      }
      return;
    }

    console.error(`HubSpot: create contact failed (${createRes.status}):`, errBody);
  } catch (err) {
    console.error('HubSpot: network error pushing contact:', err);
  }
}
