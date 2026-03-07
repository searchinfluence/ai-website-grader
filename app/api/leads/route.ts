import { NextRequest, NextResponse } from 'next/server';
import { saveLeadCapture } from '@/lib/supabase/leads';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const name = typeof body?.name === 'string' ? body.name.trim() : '';
    const email = typeof body?.email === 'string' ? body.email.trim().toLowerCase() : '';
    const company = typeof body?.company === 'string' ? body.company.trim() : '';

    if (!name) {
      return NextResponse.json({ error: 'Name is required.' }, { status: 400 });
    }

    if (!/^\S+@\S+\.\S+$/.test(email)) {
      return NextResponse.json({ error: 'A valid email is required.' }, { status: 400 });
    }

    await saveLeadCapture({
      name,
      email,
      company: company || undefined,
      source: 'export-gate'
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Lead capture failed:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to save lead.' },
      { status: 500 }
    );
  }
}
