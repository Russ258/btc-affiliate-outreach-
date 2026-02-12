# BTC Affiliate Outreach CRM - Complete System Documentation

**Created by:** Intern
**Date:** February 9, 2026
**Status:** Fully Operational & Deployed

---

## 📋 Table of Contents

1. [System Overview](#system-overview)
2. [What This System Does](#what-this-system-does)
3. [Architecture](#architecture)
4. [Deployed URLs](#deployed-urls)
5. [Database Schema](#database-schema)
6. [Key Features](#key-features)
7. [Important Files](#important-files)
8. [Environment Variables](#environment-variables)
9. [How to Use](#how-to-use)
10. [Automated Discovery](#automated-discovery)
11. [Troubleshooting](#troubleshooting)
12. [Future Enhancements](#future-enhancements)

---

## System Overview

This is a **fully automated affiliate outreach CRM** built specifically for The Bitcoin Conference. It automatically discovers fresh Bitcoin/crypto influencers from YouTube and Twitter, manages your daily outreach queue, tracks contacts, and prevents duplicate outreach.

**Tech Stack:**
- **Frontend/Backend:** Next.js 15.5.11 (React, TypeScript)
- **Database:** Supabase (PostgreSQL)
- **Hosting:** Vercel (Free Tier)
- **Automation:** GitHub Actions (Free)
- **Discovery Tools:** yt-dlp (YouTube), snscrape (Twitter)

---

## What This System Does

### 1. **Automated Prospect Discovery**
Every day at 6:00 AM UTC, GitHub Actions automatically:
- Searches YouTube for Bitcoin/crypto content creators
- Extracts channel names, subscriber counts, bios, URLs
- Adds new prospects to the database
- Skips duplicates automatically

### 2. **Daily Queue Generation**
- Pulls 150 fresh prospects from your pool
- Excludes anyone on the blocklist
- Prioritizes by confidence level (HIGH/MEDIUM/LOW)
- Shows newest discoveries first

### 3. **Smart Contact Management**
- Mark prospects as "contacted" with one click
- Automatically converts prospects to contacts
- Tracks first contact dates
- Maintains complete outreach history

### 4. **Blocklist Management**
- Add names to exclude from future queues
- Bulk add multiple names at once
- Prevents reaching out to people you're already working with

---

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    AUTOMATED DISCOVERY                       │
│  (GitHub Actions runs daily at 6 AM UTC)                    │
│                                                              │
│  scripts/discover-youtube.js  ──────────────────┐          │
│  scripts/discover-twitter.js  (not working) ────┤          │
│  scripts/discover-all.js      ──────────────────┘          │
│                          │                                   │
│                          ↓                                   │
│                    Supabase Database                         │
│                    (prospects table)                         │
└─────────────────────────────────────────────────────────────┘
                           │
                           ↓
┌─────────────────────────────────────────────────────────────┐
│                    WEB APPLICATION                           │
│              (Hosted on Vercel - Free)                       │
│                                                              │
│  Daily Queue Page                                           │
│   ├─ Generate List button (creates queue)                  │
│   ├─ Shows 150 prospects                                    │
│   ├─ Mark Contacted button                                  │
│   └─ Blocklist Management                                   │
│                          │                                   │
│                          ↓                                   │
│  Contacts Page - Full contact management                    │
│  Dashboard - Overview & stats                               │
│  Calendar - Schedule follow-ups                             │
│  Emails - Email templates                                   │
└─────────────────────────────────────────────────────────────┘
```

---

## Deployed URLs

**Live Application:** Check your Vercel dashboard at https://vercel.com
**GitHub Repository:** https://github.com/Russ258/btc-affiliate-outreach-
**GitHub Actions:** https://github.com/Russ258/btc-affiliate-outreach-/actions
**Supabase Dashboard:** https://supabase.com/dashboard/project/smitercfaqhopfdeexm

---

## Database Schema

### Tables

#### 1. `prospects`
Stores discovered influencers before they become contacts.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| name | TEXT | Full name or channel name |
| email | TEXT | Email (often null for discoveries) |
| twitter_handle | TEXT | @username |
| instagram_handle | TEXT | @username |
| linkedin_url | TEXT | LinkedIn profile |
| youtube_channel | TEXT | YouTube channel name |
| youtube_url | TEXT | Full YouTube URL |
| source | TEXT | 'youtube', 'twitter', 'instagram', 'linkedin' |
| follower_count | INTEGER | Subscriber/follower count |
| bio | TEXT | Bio/description from profile |
| website | TEXT | Personal website |
| status | TEXT | 'new', 'queued', 'contacted', 'skipped' |
| confidence | TEXT | 'HIGH', 'MEDIUM', 'LOW' |
| discovered_at | TIMESTAMP | When we found them |
| contacted_at | TIMESTAMP | When we reached out |
| moved_to_contacts_at | TIMESTAMP | When converted to contact |
| contact_id | UUID | Reference to contacts table |

**Unique Constraints:**
- twitter_handle (prevents duplicate Twitter accounts)
- youtube_channel (prevents duplicate YouTube channels)
- instagram_handle (prevents duplicate Instagram accounts)

#### 2. `daily_queue`
The daily outreach queue generated from prospects.

| Column | Type | Description |
|--------|------|-------------|
| id | SERIAL | Primary key |
| queue_date | DATE | Date of the queue (default: today) |
| contact_id | UUID | Reference to contacts (nullable) |
| prospect_id | UUID | Reference to prospects (nullable) |
| state | TEXT | 'pending', 'contacted', 'skipped' |
| added_at | TIMESTAMP | When added to queue |
| updated_at | TIMESTAMP | Last update |

**Constraints:**
- Either contact_id OR prospect_id must be set (not both)
- Unique index on (queue_date, prospect_id)
- Unique index on (queue_date, contact_id)

#### 3. `blocklist`
Names to exclude from queue generation.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| name | TEXT | Name to block (UNIQUE) |
| reason | TEXT | Why they're blocked |
| email | TEXT | Email to block |
| twitter_handle | TEXT | Twitter to block |
| youtube_channel | TEXT | YouTube to block |
| created_at | TIMESTAMP | When added |

**Indexes:**
- LOWER(name) for case-insensitive matching
- LOWER(email)
- LOWER(twitter_handle)
- LOWER(youtube_channel)

#### 4. `contacts`
Your main contact database (existing table, not modified).

Contains all people you're actively working with or have contacted.

---

## Key Features

### 1. Daily Queue Page (`/daily-queue`)
**What it does:** Your daily workspace for outreach

**Features:**
- **Generate List button:** Creates a queue of 150 prospects
- **Stats bar:** Shows Total/Pending/Contacted/Skipped counts
- **Prospect cards:** Each shows:
  - Name, source badge (📺 YouTube, 🐦 Twitter)
  - Email (click to send), Twitter/YouTube links
  - Follower count
  - "Mark Contacted" button
- **Blocklist button:** Opens panel to manage excluded names

**How it works:**
1. Click "Generate List"
2. System queries prospects table (status = 'new' or 'queued')
3. Filters out anyone on blocklist
4. Orders by confidence (HIGH first) then newest
5. Takes first 150
6. Inserts into daily_queue table
7. Displays on screen

### 2. Blocklist Management
**What it does:** Prevents duplicate outreach

**Features:**
- Add single or bulk names (one per line)
- Optional reason field
- View all blocked names in table
- Remove from blocklist
- Case-insensitive matching

**How it works:**
- Names in blocklist are excluded during queue generation
- Matches on: name, email, twitter_handle, youtube_channel
- Uses Set-based lookups for performance

### 3. Mark Contacted
**What it does:** Converts prospects to contacts

**When you click "Mark Contacted":**
1. Checks if it's a prospect or existing contact
2. If prospect:
   - Creates new contact record
   - Copies all data (name, email, social handles)
   - Sets status = 'contacted'
   - Updates prospect record
   - Links prospect to contact
3. If contact:
   - Updates status = 'contacted'
   - Sets first_contact_date
4. Updates queue state to 'contacted'

**Special handling:**
- If prospect has no email/twitter but has YouTube → uses @youtube_channel as twitter_handle
- This satisfies the contacts table constraint requiring at least one identifier

### 4. Automated Discovery (GitHub Actions)
**What it does:** Finds new prospects daily

**Schedule:** Every day at 6:00 AM UTC
**Location:** `.github/workflows/daily-discovery.yml`

**Process:**
1. GitHub Actions VM spins up
2. Installs Node.js and Python
3. Installs npm dependencies
4. Installs yt-dlp and snscrape
5. Runs `npm run discover`
6. Discovers ~200-300 new YouTube channels
7. Inserts into prospects table (skips duplicates)
8. Uploads logs as artifacts

**Search queries used:**
- "bitcoin podcast"
- "bitcoin investing"
- "crypto education"
- "cryptocurrency news"
- "bitcoin analysis"
- "crypto trading"
- "bitcoin conference"
- "blockchain technology"

**Results per run:**
- ~240 channels found
- ~120-130 new inserts
- ~100-110 duplicates skipped

---

## Important Files

### Core Application Files

**`/app/daily-queue/page.tsx`**
- Main daily queue UI
- Generate list functionality
- Blocklist management panel
- Mark contacted buttons

**`/app/api/daily-queue/route.ts`**
- GET: Fetches today's queue with stats
- Joins daily_queue with prospects/contacts
- Returns flattened results with is_prospect flag

**`/app/api/daily-queue/generate/route.ts`**
- POST: Generates daily queue
- Fetches blocklist and prospects
- Filters out blocked names
- Inserts into daily_queue
- Handles duplicate constraint errors

**`/app/api/daily-queue/[id]/mark-contacted/route.ts`**
- PATCH: Marks queue item as contacted
- Creates contact from prospect if needed
- Updates prospect status
- Updates queue state

**`/app/api/blocklist/route.ts`**
- GET: Returns all blocklist entries
- POST: Adds names to blocklist (single or bulk)
- DELETE: Removes entry by ID

**`/app/blocklist/page.tsx`**
- Standalone blocklist page (can be removed - functionality now in daily-queue)

**`/app/layout.tsx`**
- Navigation header
- Links to all pages

### Discovery Scripts

**`/scripts/discover-youtube.js`**
- Uses yt-dlp to search YouTube
- 8 search queries × 30 results each
- Extracts: channel name, subscriber count, description, URL
- Inserts into prospects table
- Confidence level: MEDIUM

**`/scripts/discover-twitter.js`**
- Uses snscrape (currently NOT WORKING - Twitter blocks it)
- Would search for crypto influencers
- Kept for future if Twitter access is fixed

**`/scripts/discover-all.js`**
- Master script that runs both YouTube and Twitter
- Returns combined stats
- Used by GitHub Actions

**`/run-discovery.sh`**
- Shell wrapper for cron jobs
- Logs to logs/discovery-YYYY-MM-DD.log
- Not actively used (GitHub Actions handles automation)

### Database Migrations

**`/supabase-prospects-table.sql`**
- Creates prospects table
- Sets up RLS policies
- Creates unique constraints

**`/supabase-daily-queue-migration.sql`**
- Initial daily_queue table creation

**`/supabase-update-daily-queue.sql`**
- Updates daily_queue to support prospects
- Adds prospect_id column
- Creates unique indexes

**`/supabase-blocklist-table.sql`**
- Creates blocklist table
- Sets up indexes for case-insensitive matching

### GitHub Actions

**`.github/workflows/daily-discovery.yml`**
- Runs daily at 6 AM UTC
- Can be triggered manually
- Installs dependencies
- Runs discovery
- Uploads logs

---

## Environment Variables

### Required for Local Development

Create `/Users/240553/btc-affiliate-outreach/.env.local`:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://smitercfaqhopfdeexm.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNtaXRlcmNmYXFob3BmZGVlZXhtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAyMjgyMDUsImV4cCI6MjA4NTgwNDIwNX0.qPz8HXkZnPqCaG80UyMLYiWZFUvxZgbGPv2h4xBWfqE
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNtaXRlcmNmYXFob3BmZGVlZXhtIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MDIyODIwNSwiZXhwIjoyMDg1ODA0MjA1fQ.Jy_Qn_-XseiF7FGPr4lbYpY9VaOVOyIvq1PgESdREnk
```

### Vercel Deployment

Same three environment variables must be added in Vercel dashboard:
1. Go to project settings
2. Environment Variables
3. Add all three

### GitHub Actions Secrets

Same three environment variables must be added as GitHub secrets:
1. Go to repo → Settings → Secrets and variables → Actions
2. New repository secret
3. Add all three

---

## How to Use

### Daily Workflow

**Morning (Automated):**
1. GitHub Actions runs at 6 AM UTC
2. Discovers 200-300 new YouTube channels
3. Adds them to prospects table

**Your Workflow:**
1. Open the app (Vercel URL)
2. Go to "Daily Queue"
3. Click "Generate List"
4. System creates queue of 150 prospects
5. For each prospect:
   - Review their profile
   - Click email to send outreach
   - Check their YouTube/Twitter
   - Click "Mark Contacted" when done
6. Prospect automatically moves to Contacts

**Managing Blocklist:**
1. Click "Blocklist" button in Daily Queue
2. Add names you want to exclude
3. They'll never appear in future queues

### Generating Queue Manually

```bash
# From project directory
npm run discover
```

This will:
- Run YouTube discovery
- Find new channels
- Add to database
- Skip duplicates

### Viewing Logs

**GitHub Actions logs:**
1. Go to https://github.com/Russ258/btc-affiliate-outreach-/actions
2. Click latest "Daily Discovery" run
3. View output and logs

**Local logs:**
- Stored in `/logs/` directory (gitignored)
- Format: `discovery-YYYY-MM-DD.log`

---

## Troubleshooting

### "Failed to generate queue"

**Possible causes:**
1. No prospects in database
2. All prospects are already queued
3. Database connection issue

**Fix:**
```bash
# Check if you have prospects
# Go to Supabase dashboard → Table Editor → prospects
# Should have rows with status = 'new' or 'queued'

# If empty, run discovery manually:
npm run discover
```

### "Mark Contacted" fails

**Error:** "contacts_require_identifier" constraint

**Cause:** Prospect has no email, twitter_handle, or valid identifier

**Fix:** Code already handles this by using YouTube channel as twitter_handle. If still failing:
1. Check the prospect record in database
2. Ensure they have at least one of: email, twitter_handle, youtube_channel
3. Code at `/app/api/daily-queue/[id]/mark-contacted/route.ts` line 83

### Discovery script fails

**Error:** "yt-dlp: command not found"

**Fix:**
```bash
pip install yt-dlp snscrape
```

**Error:** "supabaseKey is required"

**Fix:** Check that `.env.local` exists and has all three environment variables

### GitHub Actions not running

**Check:**
1. Go to repo → Actions tab
2. Verify workflow exists
3. Check if it's enabled
4. Verify secrets are set (Settings → Secrets)

**Manual trigger:**
1. Actions tab
2. "Daily Discovery" on left
3. "Run workflow" button

### Duplicate key violations

**Error:** "duplicate key value violates unique constraint"

**This is normal!** The system automatically handles duplicates. If a prospect already exists, it skips them.

**If it's blocking queue generation:**
```sql
-- Run in Supabase SQL Editor
DELETE FROM daily_queue WHERE queue_date < CURRENT_DATE;
```

---

## Future Enhancements

### Potential Integrations

**FlexOffers API:**
- Track affiliate performance
- See which affiliates drive sales
- Prioritize similar prospects

**Ticket Socket API:**
- Pull ticket sales data
- Identify top-performing affiliates
- Match characteristics to prospects

**Implementation:** Both have APIs available. See conversation history for details.

### Notion Integration

**If approved by admin:**
- Sync contacts/prospects to Notion
- Use Notion AI to analyze patterns
- Generate smart prospect recommendations
- See conversation history for full plan

### Enhanced Discovery

**Instagram scraping:**
- Add Instagram influencer discovery
- Script structure similar to YouTube/Twitter

**LinkedIn scraping:**
- Add LinkedIn thought leader discovery
- Requires paid LinkedIn API or scraping workaround

**Better Twitter access:**
- snscrape currently blocked by Twitter
- Consider paid Twitter API
- Or alternative scraping methods

### AI-Powered Prioritization

**Score prospects based on:**
- Follower count
- Engagement rate
- Content relevance
- Similarity to successful affiliates

**Implementation:**
- Could use OpenAI API (costs $)
- Or build simple scoring algorithm (free)

---

## Quick Reference Commands

```bash
# Local development
npm run dev                 # Start dev server at localhost:3000

# Discovery
npm run discover           # Run full discovery (YouTube + Twitter)
npm run discover:youtube   # YouTube only
npm run discover:twitter   # Twitter only (not working)

# Git
git status                 # Check changes
git add .                  # Stage all changes
git commit -m "message"    # Commit with message
git push                   # Push to GitHub (triggers Vercel deploy)

# Database
# Go to: https://supabase.com/dashboard/project/smitercfaqhopfdeexm
# Use SQL Editor to run queries

# Deployment
# Automatic on git push
# Or deploy manually from Vercel dashboard
```

---

## Support Contacts

**GitHub Repository:** https://github.com/Russ258/btc-affiliate-outreach-
**Vercel Dashboard:** https://vercel.com (sign in with GitHub)
**Supabase Dashboard:** https://supabase.com/dashboard

**If something breaks:**
1. Check GitHub Actions logs
2. Check Vercel deployment logs
3. Check Supabase logs
4. Check browser console for errors

**Critical files to never delete:**
- `.env.local` (local environment variables)
- `/app/api/**` (all API routes)
- `/scripts/**` (discovery scripts)
- `.github/workflows/**` (automation)
- Database migration SQL files

---

## System Status: ✅ FULLY OPERATIONAL

**Last verified:** February 9, 2026

- ✅ Web app deployed on Vercel
- ✅ Database operational on Supabase
- ✅ GitHub Actions running daily
- ✅ Discovery working (YouTube)
- ✅ Queue generation working
- ✅ Mark contacted working
- ✅ Blocklist working
- ⚠️ Twitter discovery disabled (platform blocks snscrape)

---

## Questions?

This system is fully documented and operational. All code is commented. If you need to make changes:

1. **Small changes:** Edit directly in GitHub web interface
2. **Larger changes:** Clone repo, make changes locally, test, push
3. **Database changes:** Always test in Supabase SQL Editor first
4. **Breaking changes:** Make a backup branch first

The system is designed to run autonomously. GitHub Actions will continue discovering prospects daily, and the web app will continue working without any maintenance required.

---

**Built with ❤️ for The Bitcoin Conference**
