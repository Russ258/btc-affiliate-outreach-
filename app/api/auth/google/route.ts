import { NextResponse } from 'next/server';
import { getAuthUrl } from '@/lib/google/auth';

// GET /api/auth/google - Initiates Google OAuth flow by redirecting to consent screen
export async function GET() {
  try {
    const authUrl = getAuthUrl();
    return NextResponse.redirect(authUrl);
  } catch (error) {
    console.error('OAuth initiation error:', error);
    return NextResponse.json(
      { error: 'Failed to initiate Google authentication' },
      { status: 500 }
    );
  }
}
