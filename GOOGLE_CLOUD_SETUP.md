# Google Cloud Setup Guide

Complete guide to setting up Google OAuth for the BTC Affiliate Outreach system.

## Prerequisites

- Google account
- Access to [Google Cloud Console](https://console.cloud.google.com)

## Step-by-Step Setup

### 1. Create a Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Click **Select a project** dropdown (top left, next to "Google Cloud")
3. Click **NEW PROJECT**
4. Fill in:
   - **Project name**: `BTC Affiliate Outreach` (or any name you prefer)
   - **Organization**: Leave default or select your organization
   - **Location**: Leave default
5. Click **CREATE**
6. Wait a few seconds for the project to be created
7. Select the new project from the dropdown

### 2. Enable Required APIs

You need to enable 3 APIs for this application:

#### Enable Gmail API
1. In the left sidebar, go to **APIs & Services** > **Library**
2. Search for "Gmail API"
3. Click on **Gmail API**
4. Click **ENABLE**
5. Wait for it to enable (takes a few seconds)

#### Enable Google Calendar API
1. Click **← Go to Library** (or navigate back to API Library)
2. Search for "Google Calendar API"
3. Click on **Google Calendar API**
4. Click **ENABLE**

#### Enable Google Sheets API
1. Click **← Go to Library**
2. Search for "Google Sheets API"
3. Click on **Google Sheets API**
4. Click **ENABLE**

### 3. Configure OAuth Consent Screen

Before creating credentials, you need to configure the OAuth consent screen:

1. In the left sidebar, go to **APIs & Services** > **OAuth consent screen**
2. Select **External** (unless you have a Google Workspace organization)
3. Click **CREATE**
4. Fill in the App information:
   - **App name**: `BTC Affiliate Outreach`
   - **User support email**: Your email address
   - **App logo**: (Optional) Upload a logo if you have one
5. **App domain** section:
   - **Application home page**: `http://localhost:3000` (for development)
   - **Authorized domains**: Leave empty for now (add your production domain later)
6. **Developer contact information**:
   - **Email addresses**: Your email address
7. Click **SAVE AND CONTINUE**
8. **Scopes** page:
   - Click **ADD OR REMOVE SCOPES**
   - Search and select these scopes:
     - `.../auth/gmail.readonly` (View your email messages)
     - `.../auth/gmail.modify` (Manage your email)
     - `.../auth/calendar.readonly` (View your calendar)
     - `.../auth/spreadsheets` (See, edit, create, and delete spreadsheets)
   - Click **UPDATE**
   - Click **SAVE AND CONTINUE**
9. **Test users** page:
   - Click **+ ADD USERS**
   - Add your email address (the one you'll use to test)
   - Click **ADD**
   - Click **SAVE AND CONTINUE**
10. Review the summary and click **BACK TO DASHBOARD**

### 4. Create OAuth 2.0 Credentials

1. In the left sidebar, go to **APIs & Services** > **Credentials**
2. Click **+ CREATE CREDENTIALS** (at the top)
3. Select **OAuth client ID**
4. **Application type**: Select **Web application**
5. **Name**: `BTC Affiliate Outreach Web Client`
6. **Authorized JavaScript origins**:
   - Click **+ ADD URI**
   - Enter: `http://localhost:3000`
   - (Later, add your production URL like `https://your-app.vercel.app`)
7. **Authorized redirect URIs**:
   - Click **+ ADD URI**
   - Enter: `http://localhost:3000/api/auth/google/callback`
   - (Later, add production: `https://your-app.vercel.app/api/auth/google/callback`)
8. Click **CREATE**
9. A popup will appear with your credentials:
   - **Client ID**: Starts with `xxxxx.apps.googleusercontent.com`
   - **Client Secret**: A random string
10. Click **DOWNLOAD JSON** (optional, for backup)
11. Copy both values - you'll need them next!

### 5. Update Environment Variables

1. Open your project directory
2. Edit `.env.local` file
3. Replace the placeholder values:

```env
# Supabase (you should have set these up already)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# Google OAuth - PASTE YOUR VALUES HERE
GOOGLE_CLIENT_ID=123456789-abcdefghijklmnopqrstuvwxyz.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-abcdefghijklmnopqrstuvwxyz
GOOGLE_REDIRECT_URI=http://localhost:3000/api/auth/google/callback

# Cron Security
CRON_SECRET=your-random-string-here
```

4. Save the file

### 6. Restart Development Server

If the server is running:
1. Press `Ctrl+C` to stop it
2. Run `npm run dev` to start it again

This ensures the new environment variables are loaded.

### 7. Test Google OAuth

1. Open http://localhost:3000 in your browser
2. Click **Settings** in the navigation
3. Click **Connect Google** button
4. You'll be redirected to Google's consent screen
5. Sign in with your Google account (use the test user you added)
6. Review the permissions:
   - Read Gmail
   - Modify Gmail
   - Read Calendar
   - Access Sheets
7. Click **Continue** or **Allow**
8. You'll be redirected back to Settings page
9. You should see:
   - ✅ **Connected** status (green checkmark)
   - Your name and email
   - Your profile picture
   - List of granted permissions

### 8. Troubleshooting

#### "Access blocked: This app's request is invalid"
- Make sure all 3 APIs are enabled (Gmail, Calendar, Sheets)
- Check that redirect URI matches exactly: `http://localhost:3000/api/auth/google/callback`
- Verify OAuth consent screen is published (or in Testing mode with your email as a test user)

#### "Redirect URI mismatch"
- Go back to Google Cloud Console > Credentials
- Edit your OAuth client
- Add the exact redirect URI: `http://localhost:3000/api/auth/google/callback`
- Make sure there's no trailing slash
- Make sure the port matches (3000 vs 3001)

#### "Authentication failed: Failed to complete authentication"
- Check browser console for errors
- Verify `.env.local` has correct Client ID and Secret
- Restart dev server after updating `.env.local`
- Check Supabase connection is working

#### "This app hasn't been verified"
This is normal for apps in testing mode. You'll see a warning screen:
1. Click "Advanced" (bottom left)
2. Click "Go to BTC Affiliate Outreach (unsafe)"
3. This only appears once per user

#### Can't connect - wrong port
If your dev server is running on port 3001 instead of 3000:
1. Update `.env.local`:
   ```
   GOOGLE_REDIRECT_URI=http://localhost:3001/api/auth/google/callback
   ```
2. Update Google Cloud Console:
   - Edit OAuth client
   - Change redirect URI to `http://localhost:3001/api/auth/google/callback`
3. Restart dev server

### 9. Production Setup (When Deploying)

When you deploy to Vercel or another host:

1. Update `.env.local` in Vercel dashboard with production values
2. Go to Google Cloud Console > Credentials
3. Edit your OAuth client
4. Add production redirect URI:
   - `https://your-app.vercel.app/api/auth/google/callback`
5. Add production origin:
   - `https://your-app.vercel.app`
6. Publish OAuth consent screen:
   - Go to OAuth consent screen
   - Click **PUBLISH APP**
   - Submit for verification (optional, but removes warning screen)

## Security Notes

- **Never commit** `.env.local` to git (already in `.gitignore`)
- **Keep Client Secret private** - don't share or expose it
- Tokens are stored encrypted in Supabase
- Use HTTPS in production (required by Google)
- Regularly rotate secrets if compromised

## Scopes Explained

Your app requests these permissions:

| Scope | Purpose |
|-------|---------|
| `gmail.readonly` | Read emails to flag important messages |
| `gmail.modify` | Mark emails as read/unread |
| `calendar.readonly` | View calendar events for affiliate meetings |
| `spreadsheets` | Import/sync contacts from Google Sheets |

Users will see these on the consent screen.

## Next Steps

After Google OAuth is working:
1. ✅ Test connection in Settings
2. ✅ Verify you can connect/disconnect
3. ⏳ Move to Phase 4: Import contacts from Google Sheets
4. ⏳ Phase 5: Gmail email monitoring
5. ⏳ Phase 6: Calendar sync

## Support Resources

- [Google OAuth 2.0 Documentation](https://developers.google.com/identity/protocols/oauth2)
- [Gmail API Quickstart](https://developers.google.com/gmail/api/quickstart/js)
- [Google Calendar API](https://developers.google.com/calendar/api/guides/overview)
- [Google Sheets API](https://developers.google.com/sheets/api/guides/concepts)

## Common Questions

**Q: Do I need to verify my app?**
A: Not required for personal use. Only if you want to remove the "unverified app" warning for other users.

**Q: How many users can connect?**
A: In testing mode: 100 test users. Published: unlimited.

**Q: Will Google charge me?**
A: Google Cloud APIs have generous free tiers. You're unlikely to exceed them for this use case.

**Q: Can I use the same project for multiple environments?**
A: Yes, just add multiple redirect URIs (localhost, staging, production).

**Q: What if I lose my Client Secret?**
A: Generate a new OAuth client in Google Cloud Console. Update `.env.local` with new credentials.

---

**Status**: Ready to connect Google! Click "Connect Google" in Settings to test.
