# 🔐 Multi-User Authentication Setup

Complete setup guide for adding magic link auth + multi-user support to your BTC Affiliate Outreach app.

---

## ✅ What's Been Added

- ✅ Magic link authentication (Supabase Auth)
- ✅ Email domain restriction (@btcmedia.org only)
- ✅ Multi-user support (personal + team contacts)
- ✅ All existing contacts marked as "Team" contacts
- ✅ Login page and middleware
- ✅ Toggle between "Team Contacts" and "My Contacts"

---

## 📋 Setup Steps (15 minutes)

### Step 1: Install Dependencies (2 min)

```bash
cd /Users/240553/btc-affiliate-outreach
npm install
```

This installs `@supabase/auth-helpers-nextjs`.

---

### Step 2: Run Database Migration (3 min)

**Go to Supabase Dashboard:**

1. Open: https://supabase.com/dashboard/project/smitercfaqhopfdeeexm
2. Click **SQL Editor** (left sidebar)
3. Click **"New Query"**
4. Copy and paste the entire contents of `supabase/migrations/001_add_user_support.sql`
5. Click **"Run"** (or press Cmd+Enter)
6. You should see: "Success. No rows returned"

This adds `user_id` and `is_shared` columns to your contacts table and sets up security policies.

---

### Step 3: Configure Supabase Auth (5 min)

**Enable Email Auth:**

1. In Supabase Dashboard → **Authentication** → **Providers**
2. Find **Email** → Make sure it's **Enabled** ✓
3. Under **Email Auth** settings:
   - ✓ Enable email confirmations: **OFF** (magic links don't need this)
   - ✓ Secure email change: **ON**

**Configure SendGrid for Emails:**

1. Still in **Authentication** → Click **Email Templates** (top tabs)
2. Scroll down to **SMTP Settings**
3. Toggle **"Enable Custom SMTP"** to ON
4. Fill in:
   ```
   Sender name: BTC Affiliate Outreach
   Sender email: russ.jacobson@btcmedia.org
   Host: smtp.sendgrid.net
   Port: 587
   Username: apikey
   Password: [Your NEW SendGrid API key]
   ```
5. Click **Save**

**Set Site URL:**

1. Go to **Authentication** → **URL Configuration**
2. Set **Site URL** to: `https://btcaffiliateoutreach.vercel.app`
3. Under **Redirect URLs**, add:
   ```
   https://btcaffiliateoutreach.vercel.app/auth/callback
   http://localhost:3000/auth/callback
   ```
4. Click **Save**

---

### Step 4: Assign Existing Contacts to You (2 min)

Your existing contacts are currently marked as "Team" contacts (visible to everyone). To claim them as yours:

1. In Supabase Dashboard → **Table Editor**
2. Select **contacts** table
3. Click **SQL Editor** (top right)
4. Run this query:
   ```sql
   -- First, log in to the app so your user is created
   -- Then come back and run this to assign contacts to you:

   UPDATE contacts
   SET user_id = (
     SELECT id FROM auth.users WHERE email = 'russ.jacobson@btcmedia.org'
   )
   WHERE is_shared = true;
   ```

**Note:** Do this AFTER you've logged in at least once so your user exists in the database.

---

### Step 5: Test Locally (3 min)

```bash
npm run dev
```

1. Go to http://localhost:3000
2. Should redirect to http://localhost:3000/login
3. Enter: `russ.jacobson@btcmedia.org`
4. Click "Send Magic Link"
5. Check your email for the magic link
6. Click the link → You're in!

Test the toggle:
- Click "Team Contacts" → See all team contacts
- Click "My Contacts" → See your personal contacts

---

## 🚀 Deploy to Vercel (5 min)

### Option 1: Auto-Deploy (if connected to GitHub)

```bash
git add -A
git commit -m "Add multi-user auth with magic links"
git push
```

Vercel will auto-deploy.

### Option 2: Manual Deploy

```bash
vercel --prod
```

---

## 👥 Invite Team Members

### Method 1: They Sign Up Themselves

1. Share the login URL: https://btcaffiliateoutreach.vercel.app/login
2. They enter their @btcmedia.org email
3. They click the magic link in their email
4. Done!

### Method 2: Invite via Supabase (Optional)

1. Supabase Dashboard → **Authentication** → **Users**
2. Click **"Invite User"**
3. Enter their @btcmedia.org email
4. They'll get an invite email

---

## 📊 How It Works

### Team Contacts (Default)
- Visible to all users
- Created with `is_shared = true`
- Your existing contacts are team contacts

### Personal Contacts
- Only visible to the owner
- Created with `is_shared = false` and `user_id = current_user`
- Each user can have their own personal contact list

### Toggle
Users can switch between:
- **"Team Contacts"** → See all shared contacts
- **"My Contacts"** → See only their personal contacts

---

## 🔒 Security Features

- ✅ Only @btcmedia.org emails can sign up
- ✅ Magic links expire after use
- ✅ Row-level security policies protect data
- ✅ Users can only modify their own contacts
- ✅ Team contacts can be edited by anyone

---

## 🔧 Troubleshooting

### "Failed to send magic link"
- Check SendGrid API key in Supabase SMTP settings
- Verify sender email (russ.jacobson@btcmedia.org) is verified in SendGrid
- Check SendGrid Activity dashboard for errors

### "Unauthorized" errors
- Make sure you're logged in
- Clear cookies and try logging in again
- Check browser console for errors

### Contacts not showing
- Make sure you ran the database migration
- Check if you're on the right view (Team vs Personal)
- Run the SQL query to assign contacts to your user

### Can't log in with non-@btcmedia.org email
- This is intentional! Only @btcmedia.org emails are allowed
- Check the email domain validation in the login page

---

## 🎯 Next Steps

- [ ] Test login flow
- [ ] Assign existing contacts to yourself
- [ ] Invite team members
- [ ] Create some personal contacts to test
- [ ] Deploy to production
- [ ] Share login URL with team

---

## 📧 Gmail/Calendar Integration

Your Gmail/Calendar integration for `russ.jacobson@btcmedia.org` will continue to work as before. The Google OAuth is separate from the Supabase auth.

Each user will need to connect their own Google account if they want Gmail/Calendar features. (Or you can keep it connected only to your account for now.)

---

Your app is ready! 🎉
