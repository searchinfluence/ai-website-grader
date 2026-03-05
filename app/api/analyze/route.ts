import { NextRequest, NextResponse } from 'next/server';
import { analyzeWebsite } from '@/lib/analysis-engine';
import { logAnalysisToSupabase } from '@/lib/supabase/log-analysis';

type RateLimitEntry = {
  count: number;
  resetAt: number;
};

const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX_REQUESTS = 30;
const rateLimitStore = new Map<string, RateLimitEntry>();

const DEFAULT_ALLOWED_ORIGINS = [
  'http://localhost:3000',
  'http://127.0.0.1:3000',
  'https://ai-grader.searchinfluence.com',
  'https://www.ai-grader.searchinfluence.com',
];

const configuredOrigins = process.env.CORS_ALLOWED_ORIGINS
  ?.split(',')
  .map((origin) => origin.trim())
  .filter(Boolean) ?? [];

const allowedOrigins = new Set([...DEFAULT_ALLOWED_ORIGINS, ...configuredOrigins]);

function getClientIp(request: NextRequest): string {
  const forwardedFor = request.headers.get('x-forwarded-for');
  if (forwardedFor) {
    return forwardedFor.split(',')[0].trim();
  }
  return request.headers.get('x-real-ip') || 'unknown';
}

function isTrustedOrigin(origin: string | null): boolean {
  if (!origin) return true;
  return allowedOrigins.has(origin);
}

function buildCorsHeaders(origin: string | null): HeadersInit {
  const headers: Record<string, string> = {
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Vary': 'Origin',
  };

  if (origin && isTrustedOrigin(origin)) {
    headers['Access-Control-Allow-Origin'] = origin;
  }

  return headers;
}

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const existing = rateLimitStore.get(ip);

  if (!existing || now >= existing.resetAt) {
    rateLimitStore.set(ip, {
      count: 1,
      resetAt: now + RATE_LIMIT_WINDOW_MS,
    });
    return true;
  }

  if (existing.count >= RATE_LIMIT_MAX_REQUESTS) {
    return false;
  }

  existing.count += 1;
  return true;
}

export async function POST(request: NextRequest) {
  const origin = request.headers.get('origin');
  const corsHeaders = buildCorsHeaders(origin);

  if (!isTrustedOrigin(origin)) {
    return NextResponse.json(
      { error: 'Origin not allowed' },
      { status: 403, headers: corsHeaders }
    );
  }

  const clientIp = getClientIp(request);
  if (!checkRateLimit(clientIp)) {
    return NextResponse.json(
      { error: 'Rate limit exceeded. Please retry in one minute.' },
      { status: 429, headers: corsHeaders }
    );
  }

  try {
    const body = await request.json();
    const { url, textContent } = body;

    if (!url && !textContent) {
      return NextResponse.json(
        { error: 'Either URL or text content is required' },
        {
          status: 400,
          headers: corsHeaders,
        }
      );
    }

    const analysis = await analyzeWebsite(url || 'manual-input', textContent);

    await logAnalysisToSupabase({
      analysis,
      url: url || 'manual-input',
      ip: clientIp,
      userAgent: request.headers.get('user-agent') || 'unknown'
    });

    return NextResponse.json(analysis, {
      headers: corsHeaders,
    });
  } catch (error) {
    console.error('Analysis error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Analysis failed' },
      {
        status: 500,
        headers: corsHeaders,
      }
    );
  }
}

// Add CORS headers for preflight requests
export async function OPTIONS(request: NextRequest) {
  const origin = request.headers.get('origin');
  const corsHeaders = buildCorsHeaders(origin);

  if (!isTrustedOrigin(origin)) {
    return NextResponse.json(
      { error: 'Origin not allowed' },
      { status: 403, headers: corsHeaders }
    );
  }

  return new NextResponse(null, {
    status: 200,
    headers: corsHeaders,
  });
}

 
