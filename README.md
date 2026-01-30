# BTC Affiliate Outreach Management System

A web-based affiliate outreach management system for The Bitcoin Conference that integrates with Google Calendar, Gmail, and Sheets to automate contact tracking, email monitoring, and duplicate detection.

## 🚀 Implementation Status: Complete (100%)

✅ **All Features Implemented:**
- ✅ Contact management (add, edit, delete, view, search, filter)
- ✅ Google OAuth integration (connect/disconnect, auto token refresh)
- ✅ Google Sheets import with smart duplicate detection
- ✅ Interactive duplicate resolution and auto-merge
- ✅ Gmail monitoring and email flagging
- ✅ Calendar sync with event-contact linking
- ✅ Dashboard with analytics and daily briefing
- ✅ Automated workflows (cron jobs)
- ✅ Automation logs and monitoring
- ✅ Error boundaries and loading states
- ✅ Responsive UI with Tailwind CSS
- ✅ Complete documentation

See [IMPLEMENTATION_STATUS.md](./IMPLEMENTATION_STATUS.md) for detailed progress.

## Features

- **Contact Management**: Track affiliate contacts with status, priority, and follow-up dates
- **Google Sheets Integration**: Import contacts and sync data bidirectionally
- **Gmail Monitoring**: Automatically flag important emails from affiliates
- **Calendar Integration**: View upcoming events and link to contacts
- **Duplicate Detection**: Smart algorithm to identify and merge duplicate contacts
- **Automated Workflows**: Daily briefings, follow-up reminders, and auto-sync
- **Dashboard**: Overview of key metrics and action items

## Tech Stack

- **Frontend/Backend**: Next.js 14 (App Router) + React + TypeScript
- **Styling**: Tailwind CSS
- **Database**: Supabase (PostgreSQL)
- **Integrations**: Google APIs (Gmail, Calendar, Sheets)
- **Deployment**: Vercel

## Prerequisites

- Node.js v20+
- npm v10+
- Google account with admin access to Gmail, Calendar, Sheets
- Supabase account (free tier sufficient)
- Vercel account for deployment (optional)

## Setup Instructions

### 1. Clone and Install Dependencies

```bash
cd btc-affiliate-outreach
npm install
```

### 2. Set Up Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to Project Settings > API to get your URL and anon key
3. Go to SQL Editor and run the migration file: `supabase/migrations/001_initial_schema.sql`

### 3. Set Up Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project
3. Enable these APIs:
   - Gmail API
   - Google Calendar API
   - Google Sheets API
4. Create OAuth 2.0 credentials:
   - Go to APIs & Services > Credentials
   - Create OAuth client ID (Web application)
   - Add authorized redirect URI: `http://localhost:3000/api/auth/google/callback`
   - Save Client ID and Client Secret

### 4. Configure Environment Variables

Copy `.env.local.example` to `.env.local` and fill in the values:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# Google OAuth
GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-client-secret
GOOGLE_REDIRECT_URI=http://localhost:3000/api/auth/google/callback

# Cron Security
CRON_SECRET=generate-a-random-string-here
```

### 5. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
btc-affiliate-outreach/
├── app/                    # Next.js 14 App Router
│   ├── page.tsx           # Dashboard
│   ├── contacts/          # Contact management pages
│   ├── calendar/          # Calendar view
│   ├── emails/            # Email monitoring
│   ├── settings/          # Settings & integrations
│   └── api/               # API routes
├── components/            # React components
├── lib/                   # Utilities and integrations
│   ├── supabase/         # Database client
│   ├── google/           # Google API wrappers
│   └── utils/            # Helper functions
├── types/                 # TypeScript definitions
└── supabase/
    └── migrations/        # Database schema
```

## Database Schema

### Core Tables

- **contacts**: Main affiliate contact database
- **communications**: Communication log (emails, calls, meetings)
- **calendar_events**: Google Calendar events
- **flagged_emails**: Important emails from affiliates
- **settings**: System configuration (OAuth tokens, preferences)
- **automation_logs**: Job execution tracking

## Usage

### Daily Workflow

1. Open the dashboard to see daily briefing
2. Review flagged emails
3. Update contact statuses as needed
4. Check follow-ups due
5. Respond to action-required items

### Initial Setup

1. Go to Settings
2. Click "Connect Google" and authorize access
3. Enter your Google Sheets spreadsheet ID and sheet name
4. Click "Save & Import" to import contacts
5. Review and merge any duplicate contacts

## Deployment

### Deploy to Vercel

1. Push code to GitHub
2. Import repository in Vercel
3. Configure environment variables
4. Deploy
5. Update Google OAuth redirect URI with production URL

### Post-Deployment

- Test OAuth flow
- Import contacts from Google Sheets
- Verify Gmail webhook (if configured)
- Test automation jobs

## Development Status

### ✅ All Phases Complete

- ✅ **Phase 1**: Project setup and foundation
- ✅ **Phase 2**: Contact management core (CRUD, search, filter)
- ✅ **Phase 3**: Google OAuth & authentication
- ✅ **Phase 4**: Google Sheets integration with duplicate detection
- ✅ **Phase 5**: Gmail integration and email flagging
- ✅ **Phase 6**: Calendar integration and event linking
- ✅ **Phase 7**: Dashboard with analytics and daily briefing
- ✅ **Phase 8**: Automation & background jobs (cron)
- ✅ **Phase 9**: Polish, error handling, and deployment ready

### 📚 Documentation

- [QUICK_START.md](./QUICK_START.md) - 5-minute setup guide
- [GOOGLE_CLOUD_SETUP.md](./GOOGLE_CLOUD_SETUP.md) - OAuth setup instructions
- [SHEETS_IMPORT_GUIDE.md](./SHEETS_IMPORT_GUIDE.md) - Import and duplicate resolution
- [DEPLOYMENT.md](./DEPLOYMENT.md) - Production deployment to Vercel
- [TESTING.md](./TESTING.md) - Comprehensive testing procedures
- [IMPLEMENTATION_STATUS.md](./IMPLEMENTATION_STATUS.md) - Detailed progress tracking

## Contributing

This is a custom internal tool for The Bitcoin Conference.

## License

Proprietary
