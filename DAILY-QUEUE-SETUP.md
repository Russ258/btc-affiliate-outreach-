# Daily Queue Setup Guide

## What This Does

Automatically discovers fresh Bitcoin/crypto influencers from YouTube and Twitter daily, giving you a list of 150+ NEW prospects to reach out to every day.

## Features

✅ **Auto-Discovery** - Finds new people from YouTube, Twitter, Instagram (no API keys!)
✅ **Daily Fresh Lists** - 150+ new prospects daily
✅ **No Duplicates** - Automatically filters out people you've already contacted
✅ **Smart Prioritization** - HIGH confidence prospects first
✅ **One-Click Contact** - Mark as contacted → automatically moves to your contacts list

---

## Setup Instructions

### Step 1: Install Dependencies

```bash
# Install yt-dlp (for YouTube discovery)
pip install yt-dlp

# Install snscrape (for Twitter discovery)
pip install snscrape
```

### Step 2: Run Database Migrations

Go to your Supabase dashboard and run these SQL files:

1. **Create prospects table:**
   - Open `supabase-prospects-table.sql`
   - Copy and paste into Supabase SQL Editor
   - Click "Run"

2. **Update daily_queue table:**
   - Open `supabase-update-daily-queue.sql`
   - Copy and paste into Supabase SQL Editor
   - Click "Run"

### Step 3: Run Your First Discovery

```bash
# Discover from both YouTube and Twitter
npm run discover

# Or run individually:
npm run discover:youtube   # YouTube only
npm run discover:twitter   # Twitter only
```

This will find 50-200 new prospects and add them to your database.

### Step 4: Generate Your Daily Queue

1. Go to http://localhost:3001/daily-queue
2. Click "Generate List"
3. You'll see 150 fresh prospects!

---

## How It Works

### Discovery Process

1. **YouTube Discovery** - Searches for:
   - bitcoin podcast
   - bitcoin investing
   - crypto education
   - cryptocurrency news
   - bitcoin analysis
   - crypto trading
   - bitcoin conference
   - blockchain technology

2. **Twitter Discovery** - Searches for:
   - bitcoin
   - cryptocurrency
   - crypto trading
   - blockchain
   - btc
   - ethereum
   - web3

3. **Deduplication** - Automatically skips:
   - People you've already contacted
   - Duplicates within the same discovery run
   - Existing prospects in the database

### Daily Queue Workflow

1. **Run Discovery** (manually or via cron):
   ```bash
   npm run discover
   ```

2. **Generate Queue** (click button in UI):
   - Pulls 150 prospects from database
   - Prioritizes by confidence (HIGH > MEDIUM > LOW)
   - Shows prospects with emails first

3. **Reach Out**:
   - Contact the person
   - Click "Mark Contacted"

4. **Automatic Migration**:
   - Prospect → Moves to Contacts list
   - Status updated to "contacted"
   - Notes include discovery source

---

## Automation (Optional)

### Daily Discovery Cron Job

Add this to your crontab to run discovery every day at 6am:

```bash
0 6 * * * cd /path/to/btc-affiliate-outreach && npm run discover
```

Or use Vercel Cron / GitHub Actions:

```yaml
# .github/workflows/daily-discovery.yml
name: Daily Discovery
on:
  schedule:
    - cron: '0 6 * * *'  # 6am daily
jobs:
  discover:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm install
      - run: pip install yt-dlp snscrape
      - run: npm run discover
```

---

## Customization

### Change Search Queries

Edit the search queries in:
- `scripts/discover-youtube.js` - Line 11
- `scripts/discover-twitter.js` - Line 11

### Adjust Discovery Limits

- YouTube: 30 results per query (Line 19 in discover-youtube.js)
- Twitter: 50 tweets per query (Line 20 in discover-twitter.js)

### Change Queue Size

When clicking "Generate List", it creates 150 prospects by default.

To change this, edit the button in `/app/daily-queue/page.tsx`:
```javascript
body: JSON.stringify({ limit: 200 }),  // Change 150 to any number
```

---

## Troubleshooting

### "No fresh prospects found"

**Solution:** Run discovery first:
```bash
npm run discover
```

### yt-dlp not found

**Solution:** Install yt-dlp:
```bash
pip install yt-dlp
# Or on Mac:
brew install yt-dlp
```

### snscrape not found

**Solution:** Install snscrape:
```bash
pip install snscrape
```

### Discovery is slow

This is normal! Each discovery run takes 5-10 minutes because it's scraping hundreds of results without APIs. Run it once daily and you'll have fresh prospects every morning.

---

## Next Steps

1. ✅ Run `npm run discover` to get your first prospects
2. ✅ Visit `/daily-queue` and click "Generate List"
3. ✅ Start reaching out!
4. ✅ Set up daily cron job for automated discovery

Enjoy your automated lead generation! 🚀
