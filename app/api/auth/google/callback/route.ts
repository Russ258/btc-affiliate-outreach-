import { NextRequest, NextResponse } from 'next/server';
import { getTokensFromCode, storeTokens } from '@/lib/google/auth';

// GET /api/auth/google/callback - Handles OAuth callback from Google after user authorization
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const code = searchParams.get('code');
    const error = searchParams.get('error');

    // Handle user denial or error
    if (error) {
      return NextResponse.redirect(
        new URL(`/settings?error=${encodeURIComponent(error)}`, request.url)
      );
    }

    if (!code) {
      return NextResponse.redirect(
        new URL('/settings?error=no_code', request.url)
      );
    }

    // Exchange authorization code for tokens
    const tokens = await getTokensFromCode(code);

    // Store tokens in database
    await storeTokens(tokens);

    // Redirect back to settings with success message
    return NextResponse.redirect(
      new URL('/settings?success=true', request.url)
    );
  } catch (error) {
    console.error('OAuth callback error:', error);
    return NextResponse.redirect(
      new URL(
        `/settings?error=${encodeURIComponent('Failed to complete authentication')}`,
        request.url
      )
    );
  }
}
