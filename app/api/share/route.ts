import { NextRequest, NextResponse } from 'next/server';
import { WebsiteAnalysis } from '@/types';
import { createSharedReport, getSharedReport } from '@/lib/supabase/shared-reports';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const analysis = (body?.analysis || body?.analysisData) as WebsiteAnalysis | undefined;

    if (!analysis || !analysis.url || !analysis.timestamp) {
      return NextResponse.json({ error: 'Valid analysis payload is required.' }, { status: 400 });
    }

    const shared = await createSharedReport(analysis);
    return NextResponse.json(shared);
  } catch (error) {
    console.error('Share report POST failed:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create share link.' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const id = request.nextUrl.searchParams.get('id');
    if (!id) {
      return NextResponse.json({ error: 'id is required.' }, { status: 400 });
    }

    const report = await getSharedReport(id);
    if (!report) {
      return NextResponse.json({ error: 'Report not found or expired.' }, { status: 404 });
    }

    return NextResponse.json({ report });
  } catch (error) {
    console.error('Share report GET failed:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch shared report.' },
      { status: 500 }
    );
  }
}

