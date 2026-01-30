import { NextRequest } from 'next/server';

// Validates that a cron job request is authorized using CRON_SECRET
export function validateCronRequest(request: NextRequest): boolean {
  const authHeader = request.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;

  if (!cronSecret) {
    console.error('CRON_SECRET not configured');
    return false;
  }

  // Check for Bearer token
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7);
    return token === cronSecret;
  }

  // Check for x-vercel-cron header (Vercel cron jobs)
  const vercelCronHeader = request.headers.get('x-vercel-cron');
  if (vercelCronHeader === '1') {
    return true;
  }

  return false;
}

// Creates a standardized error response for unauthorized cron requests
export function unauthorizedResponse() {
  return new Response(
    JSON.stringify({ error: 'Unauthorized - Invalid or missing CRON_SECRET' }),
    {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    }
  );
}
