# Deployment Guide

Complete guide to deploying the BTC Affiliate Outreach system to production on Vercel.

## Prerequisites

- ✅ Application fully set up locally
- ✅ Supabase project created with migrations run
- ✅ Google Cloud project with OAuth credentials
- ✅ GitHub account
- ✅ Vercel account (free tier works)

## Deployment Steps

### 1. Prepare for Deployment

#### A. Test Locally First

```bash
npm run build
npm run start
```

Verify the production build works without errors.

#### B. Create GitHub Repository

```bash
cd /Users/240553/btc-affiliate-outreach
git init
git add .
git commit -m "Initial commit - BTC Affiliate Outreach System"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/btc-affiliate-outreach.git
git push -u origin main
```

### 2. Deploy to Vercel

#### A. Connect Repository

1. Go to [vercel.com](https://vercel.com)
2. Click **"Add New Project"**
3. Import your GitHub repository
4. Select the `btc-affiliate-outreach` repository

#### B. Configure Build Settings

Vercel should auto-detect Next.js. Verify:

- **Framework Preset**: Next.js
- **Build Command**: `next build`
- **Output Directory**: `.next`
- **Install Command**: `npm install`

#### C. Add Environment Variables

Click **"Environment Variables"** and add ALL variables from `.env.local`:

**Supabase:**
```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

**Google OAuth:**
```
GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-client-secret
GOOGLE_REDIRECT_URI=https://your-app.vercel.app/api/auth/google/callback
```

**Cron Security:**
```
CRON_SECRET=your-random-secret-string
```

**Optional:**
```
GOOGLE_CLOUD_PROJECT_ID=your-project-id (for Gmail push notifications)
```

⚠️ **Important**: Set environment for **Production**, **Preview**, and **Development**

#### D. Deploy

Click **"Deploy"** and wait 2-3 minutes.

### 3. Update Google OAuth

After first deployment:

1. Note your Vercel URL: `https://your-app.vercel.app`
2. Go to [Google Cloud Console](https://console.cloud.google.com)
3. Navigate to **APIs & Services** → **Credentials**
4. Edit your OAuth 2.0 Client
5. Add to **Authorized redirect URIs**:
   ```
   https://your-app.vercel.app/api/auth/google/callback
   ```
6. Add to **Authorized JavaScript origins**:
   ```
   https://your-app.vercel.app
   ```
7. Click **Save**

### 4. Test Production Deployment

#### A. Basic Functionality

1. Visit `https://your-app.vercel.app`
2. Navigate to all pages (Dashboard, Contacts, Calendar, Emails, Settings)
3. Verify no console errors

#### B. Google OAuth

1. Go to Settings
2. Click **"Connect Google"**
3. Authorize the app
4. Verify connection shows as "Connected"

#### C. Test Core Features

- [ ] Add a contact manually
- [ ] Import from Google Sheets (if configured)
- [ ] Scan Gmail
- [ ] Sync Calendar
- [ ] View dashboard stats

### 5. Configure Cron Jobs

Vercel automatically runs cron jobs based on `vercel.json`.

Verify cron jobs are scheduled:
1. Go to Vercel Dashboard
2. Select your project
3. Navigate to **Settings** → **Cron Jobs**
4. You should see:
   - `daily-briefing` - 8:00 AM daily
   - `check-followups` - Every hour
   - `sync-sheets` - Midnight daily

### 6. Monitor First Cron Execution

Wait for first cron run, then check logs:

1. Go to Settings page in your app
2. Scroll to "Automation Logs"
3. Verify jobs are running successfully

Or check Vercel logs:
1. Vercel Dashboard → Your Project
2. Click on a deployment
3. View "Functions" logs

### 7. Custom Domain (Optional)

#### Add Custom Domain

1. Vercel Dashboard → Your Project
2. **Settings** → **Domains**
3. Add your domain (e.g., `outreach.bitcoinconf.com`)
4. Follow Vercel's DNS instructions
5. Update Google OAuth redirect URIs with new domain

## Environment Variables Reference

### Required Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL | `https://abc123.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon public key | `eyJhbG...` |
| `GOOGLE_CLIENT_ID` | Google OAuth client ID | `123-abc.apps.googleusercontent.com` |
| `GOOGLE_CLIENT_SECRET` | Google OAuth client secret | `GOCSPX-...` |
| `GOOGLE_REDIRECT_URI` | OAuth callback URL | `https://your-app.vercel.app/api/auth/google/callback` |
| `CRON_SECRET` | Secure cron jobs | Any long random string |

### Optional Variables

| Variable | Description | When Needed |
|----------|-------------|-------------|
| `GOOGLE_CLOUD_PROJECT_ID` | Google Cloud project ID | Gmail push notifications |
| `NEXT_PUBLIC_APP_URL` | App URL for webhooks | Gmail webhook callback |

## Post-Deployment Configuration

### 1. Update Supabase Settings

If using Row Level Security (RLS):
1. Go to Supabase Dashboard
2. **Authentication** → **Policies**
3. Configure policies as needed

### 2. Set Up Gmail Push Notifications (Advanced)

If you want real-time email monitoring:

1. Create Pub/Sub topic in Google Cloud
2. Configure webhook endpoint
3. Set `GOOGLE_CLOUD_PROJECT_ID` in Vercel
4. Test webhook: POST to `/api/gmail/webhook`

See Google Cloud documentation for details.

## Troubleshooting

### Build Fails

**Error**: `Module not found`
- Check all imports are correct
- Verify dependencies in `package.json`
- Clear Vercel cache and redeploy

**Error**: `Environment variable not found`
- Verify all variables are set in Vercel
- Check variable names match exactly
- Redeploy after adding variables

### OAuth Not Working

**Error**: `redirect_uri_mismatch`
- Update Google OAuth redirect URI
- Must match exactly: `https://your-app.vercel.app/api/auth/google/callback`
- No trailing slash
- Wait 5 minutes after updating

**Error**: `Access blocked`
- Check Google OAuth consent screen is configured
- Add test users if in testing mode
- Verify all required APIs are enabled

### Cron Jobs Not Running

**Check**:
1. Verify `vercel.json` is in root directory
2. Check Vercel Dashboard → Settings → Cron Jobs
3. Ensure `CRON_SECRET` is set
4. Check function logs in Vercel

**Manual Trigger** (for testing):
```bash
curl -H "Authorization: Bearer YOUR_CRON_SECRET" \
  https://your-app.vercel.app/api/cron/daily-briefing
```

### Database Connection Issues

**Error**: `Failed to connect to database`
- Verify Supabase URL and key are correct
- Check Supabase project is active (not paused)
- Verify all migrations have run
- Test connection from local environment

## Rollback

If deployment has issues:

1. Vercel Dashboard → Deployments
2. Find previous working deployment
3. Click **⋯** → **Promote to Production**

## Monitoring

### Vercel Analytics

Enable in Vercel Dashboard:
- **Analytics** tab → Enable Web Analytics
- View page views, performance metrics

### Error Tracking

Check Vercel function logs:
- Dashboard → Your Project → Deployments
- Click on a deployment → **Functions** tab
- View real-time logs

### Uptime Monitoring

Use external service:
- [UptimeRobot](https://uptimerobot.com) (free)
- [Pingdom](https://www.pingdom.com)
- Monitor: `https://your-app.vercel.app`

## Scaling

### Vercel Limits (Free Tier)

- 100 GB bandwidth/month
- 100 hours serverless function execution
- Unlimited deployments

### Upgrade If Needed

- Pro: $20/month (more bandwidth, priority support)
- Enterprise: Custom pricing

### Supabase Limits (Free Tier)

- 500 MB database
- 2 GB bandwidth/month
- 50,000 monthly active users

### Optimize Performance

1. **Reduce API calls**: Cache data on client
2. **Optimize images**: Use Next.js Image component
3. **Database indexes**: Ensure proper indexes
4. **Edge caching**: Use Vercel Edge Network

## Security Best Practices

### Environment Variables

- ✅ Never commit `.env.local` to git
- ✅ Rotate `CRON_SECRET` periodically
- ✅ Use strong random strings
- ✅ Keep Google OAuth secrets private

### API Routes

- ✅ Validate all inputs
- ✅ Use CRON_SECRET for cron routes
- ✅ Implement rate limiting (future)

### Supabase

- ✅ Use Row Level Security (RLS)
- ✅ Don't expose service key
- ✅ Regular backups

## Maintenance

### Weekly

- Check automation logs
- Verify cron jobs running
- Review error logs

### Monthly

- Update dependencies: `npm update`
- Check Vercel/Supabase usage
- Review and archive old data

### As Needed

- Respond to Vercel/Supabase updates
- Update Google OAuth if scopes change
- Database cleanup (old logs)

## Support

### Documentation

- `README.md` - Setup and features
- `IMPLEMENTATION_STATUS.md` - Build progress
- `GOOGLE_CLOUD_SETUP.md` - OAuth setup
- `SHEETS_IMPORT_GUIDE.md` - Import guide

### Resources

- [Vercel Docs](https://vercel.com/docs)
- [Next.js Docs](https://nextjs.org/docs)
- [Supabase Docs](https://supabase.com/docs)

## Success Checklist

After deployment, verify:

- [ ] App loads at production URL
- [ ] All pages accessible
- [ ] Google OAuth connects
- [ ] Can add/edit contacts
- [ ] Google Sheets import works
- [ ] Gmail scan works
- [ ] Calendar sync works
- [ ] Dashboard shows stats
- [ ] Cron jobs visible in Vercel
- [ ] Automation logs recording
- [ ] No console errors
- [ ] Mobile responsive

---

**Congratulations!** Your BTC Affiliate Outreach system is now live! 🎉
