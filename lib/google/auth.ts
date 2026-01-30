import { google } from 'googleapis';
import { supabase } from '@/lib/supabase/client';

const SCOPES = [
  'https://www.googleapis.com/auth/gmail.readonly',
  'https://www.googleapis.com/auth/gmail.modify',
  'https://www.googleapis.com/auth/calendar.readonly',
  'https://www.googleapis.com/auth/spreadsheets',
];

// Creates and returns a configured OAuth2 client for Google API authentication
export function getOAuth2Client() {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const redirectUri = process.env.GOOGLE_REDIRECT_URI;

  if (!clientId || !clientSecret || !redirectUri) {
    throw new Error('Missing Google OAuth configuration');
  }

  return new google.auth.OAuth2(clientId, clientSecret, redirectUri);
}

// Generates the Google OAuth consent screen URL with required scopes
export function getAuthUrl() {
  const oauth2Client = getOAuth2Client();

  return oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
    prompt: 'consent',
  });
}

// Exchanges authorization code for access and refresh tokens
export async function getTokensFromCode(code: string) {
  const oauth2Client = getOAuth2Client();

  const { tokens } = await oauth2Client.getToken(code);
  return tokens;
}

// Stores OAuth tokens securely in Supabase settings table
export async function storeTokens(tokens: any) {
  const tokensJson = JSON.stringify(tokens);

  const { error } = await supabase
    .from('settings')
    .upsert(
      {
        key: 'google_oauth_tokens',
        value: tokensJson,
      },
      {
        onConflict: 'key',
      }
    );

  if (error) {
    throw new Error(`Failed to store tokens: ${error.message}`);
  }
}

// Retrieves stored OAuth tokens from Supabase
export async function getStoredTokens() {
  const { data, error } = await supabase
    .from('settings')
    .select('value')
    .eq('key', 'google_oauth_tokens')
    .single();

  if (error || !data) {
    return null;
  }

  return JSON.parse(data.value);
}

// Refreshes expired access token using refresh token
export async function refreshAccessToken() {
  const tokens = await getStoredTokens();

  if (!tokens || !tokens.refresh_token) {
    throw new Error('No refresh token available');
  }

  const oauth2Client = getOAuth2Client();
  oauth2Client.setCredentials(tokens);

  const { credentials } = await oauth2Client.refreshAccessToken();

  await storeTokens(credentials);

  return credentials;
}

// Returns an authenticated OAuth2 client with current valid tokens
export async function getAuthenticatedClient() {
  let tokens = await getStoredTokens();

  if (!tokens) {
    throw new Error('Not authenticated with Google');
  }

  const oauth2Client = getOAuth2Client();
  oauth2Client.setCredentials(tokens);

  // Check if token is expired or about to expire (within 5 minutes)
  const expiryDate = tokens.expiry_date;
  const now = Date.now();
  const fiveMinutes = 5 * 60 * 1000;

  if (!expiryDate || expiryDate < now + fiveMinutes) {
    // Token expired or expiring soon, refresh it
    const newCredentials = await refreshAccessToken();
    oauth2Client.setCredentials(newCredentials);
  }

  return oauth2Client;
}

// Removes stored OAuth tokens (disconnects Google account)
export async function disconnectGoogle() {
  const { error } = await supabase
    .from('settings')
    .delete()
    .eq('key', 'google_oauth_tokens');

  if (error) {
    throw new Error(`Failed to disconnect: ${error.message}`);
  }
}

// Checks if user is currently authenticated with Google
export async function isAuthenticated(): Promise<boolean> {
  const tokens = await getStoredTokens();
  return tokens !== null && tokens.refresh_token !== undefined;
}
