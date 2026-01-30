import { NextResponse } from 'next/server';
import { isAuthenticated, disconnectGoogle, getStoredTokens } from '@/lib/google/auth';
import { google } from 'googleapis';

// GET /api/settings/google - Check Google connection status and get user info
export async function GET() {
  try {
    const authenticated = await isAuthenticated();

    if (!authenticated) {
      return NextResponse.json({ connected: false });
    }

    // Try to get user info
    try {
      const tokens = await getStoredTokens();
      const oauth2Client = new google.auth.OAuth2();
      oauth2Client.setCredentials(tokens);

      const oauth2 = google.oauth2({ version: 'v2', auth: oauth2Client });
      const { data: userInfo } = await oauth2.userinfo.get();

      return NextResponse.json({
        connected: true,
        email: userInfo.email,
        name: userInfo.name,
        picture: userInfo.picture,
      });
    } catch (error) {
      // Token might be invalid, return connected but without user info
      return NextResponse.json({ connected: true });
    }
  } catch (error) {
    console.error('Failed to check Google connection:', error);
    return NextResponse.json(
      { error: 'Failed to check connection status' },
      { status: 500 }
    );
  }
}

// DELETE /api/settings/google - Disconnect Google account
export async function DELETE() {
  try {
    await disconnectGoogle();
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to disconnect Google:', error);
    return NextResponse.json(
      { error: 'Failed to disconnect Google account' },
      { status: 500 }
    );
  }
}
