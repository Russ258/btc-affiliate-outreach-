# Quick Start Guide

Get the BTC Affiliate Outreach system running in 5 minutes!

## What's Currently Working

- ✅ Contact management (CRUD operations)
- ✅ Search and filter functionality
- ✅ Responsive design
- ⏳ Google integrations (coming in Phase 3+)

## Setup Steps

### 1. Install Dependencies

Already done! Dependencies are installed in `node_modules/`.

### 2. Set Up Supabase Database

You need a Supabase project to store contacts. Here's how:

#### Option A: Quick Setup (5 minutes)
1. Go to [supabase.com](https://supabase.com) and sign up/login
2. Click "New Project"
3. Fill in:
   - Name: `btc-affiliate-outreach`
   - Database Password: (create a strong password)
   - Region: (choose closest to you)
4. Wait 2 minutes for project to initialize
5. Go to **Project Settings** (gear icon) → **API**
6. Copy these values:
   - Project URL
   - `anon` `public` key

#### Option B: Detailed Setup
See the full database setup in [README.md](./README.md#2-set-up-supabase)

### 3. Configure Environment

Edit `.env.local` file:

```bash
# Replace these with your actual Supabase values
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here

# Leave these as-is for now (Phase 3+)
GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-client-secret
GOOGLE_REDIRECT_URI=http://localhost:3000/api/auth/google/callback
CRON_SECRET=change-this-to-a-random-string
```

### 4. Run Database Migration

In Supabase dashboard:
1. Click **SQL Editor** in sidebar
2. Click **New query**
3. Copy and paste the entire contents of:
   ```
   supabase/migrations/001_initial_schema.sql
   ```
4. Click **Run** (or press Cmd/Ctrl + Enter)
5. You should see "Success. No rows returned"

This creates 6 tables:
- `contacts` - Your affiliate contacts
- `communications` - Email/call/meeting logs
- `calendar_events` - Google Calendar events
- `flagged_emails` - Important emails from affiliates
- `settings` - System configuration
- `automation_logs` - Background job tracking

### 5. Start the Application

```bash
npm run dev
```

The app will start on **http://localhost:3000** (or 3001 if 3000 is busy).

### 6. Test Contact Management

1. **Open** http://localhost:3000
2. **Navigate** to "Contacts" in the top menu
3. **Click** "Add Contact" button
4. **Fill in** the form:
   - Name: John Doe
   - Email: john@example.com
   - Company: Example Corp
   - Status: New
   - Priority: High
5. **Click** "Add Contact"
6. **View** the contact in the table
7. **Click** "View" to see details
8. **Try** the search and filters

## Troubleshooting

### "Failed to fetch contacts"
- Check that Supabase URL and key are correct in `.env.local`
- Verify database migration ran successfully
- Restart dev server: `Ctrl+C` then `npm run dev`

### Port already in use
- The app will automatically use the next available port (3001, 3002, etc.)
- Check the terminal output for the actual URL

### Database connection error
- Confirm Supabase project is active (not paused)
- Check project settings for correct URL
- Verify anon key is the `anon` `public` key, not the service key

## Next Steps

Once contacts are working:

1. **Phase 3**: Set up Google OAuth (see plan)
2. **Phase 4**: Import contacts from Google Sheets
3. **Phase 5+**: Add Gmail monitoring, Calendar sync, automation

## Features to Test

### ✅ Available Now
- [x] Add contact
- [x] View contact list
- [x] Search contacts
- [x] Filter by status
- [x] Filter by priority
- [x] View contact details
- [x] Edit contact
- [x] Delete contact

### ⏳ Coming Soon
- [ ] Import from Google Sheets
- [ ] Gmail email flagging
- [ ] Calendar event sync
- [ ] Duplicate detection
- [ ] Daily briefing
- [ ] Automated follow-ups

## Questions?

Check these files:
- `README.md` - Full documentation
- `IMPLEMENTATION_STATUS.md` - Detailed progress
- `.env.local.example` - Environment variable template

## Current Database Schema

Your Supabase database has these tables:

**contacts** - Main affiliate database
- id, email, name, company, phone, website
- status, priority, notes, tags
- first_contact_date, last_contact_date, next_followup_date

**communications** - Contact history
- contact_id, type (email/call/meeting)
- subject, body, scheduled_for

**calendar_events** - Google Calendar sync
- google_event_id, summary, start_time, end_time

**flagged_emails** - Important emails
- gmail_message_id, from_email, subject
- is_read, action_required

**settings** - System config
- key-value store for OAuth tokens

**automation_logs** - Cron job tracking
- job_name, status, execution_time

Happy testing! 🚀
