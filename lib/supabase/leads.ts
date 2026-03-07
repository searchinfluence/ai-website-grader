import { getSupabaseAdminClient } from './admin';

export type LeadCapture = {
  name: string;
  email: string;
  company?: string;
  source?: string;
};

export async function saveLeadCapture(lead: LeadCapture): Promise<void> {
  const client = getSupabaseAdminClient();
  if (!client) {
    throw new Error('Supabase admin client is not configured.');
  }

  const { error } = await client.from('leads').insert({
    name: lead.name,
    email: lead.email,
    company: lead.company || null,
    source: lead.source || 'ai-website-grader-v3'
  });

  if (error) {
    if (error.message.toLowerCase().includes('leads') && error.message.toLowerCase().includes('does not exist')) {
      throw new Error('leads table is missing. Run the Supabase migration to create it.');
    }
    throw new Error(error.message || 'Failed to save lead.');
  }
}
