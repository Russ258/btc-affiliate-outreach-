# Testing Guide

Complete testing procedures for the BTC Affiliate Outreach Management System.

## Table of Contents
- [Pre-Deployment Testing](#pre-deployment-testing)
- [Manual Testing Checklist](#manual-testing-checklist)
- [API Endpoint Testing](#api-endpoint-testing)
- [Integration Testing](#integration-testing)
- [Cron Job Testing](#cron-job-testing)
- [Production Verification](#production-verification)

---

## Pre-Deployment Testing

### Local Environment Setup

1. **Environment Variables**
   ```bash
   # Verify all required variables are set
   cat .env.local | grep -E "NEXT_PUBLIC_SUPABASE_URL|GOOGLE_CLIENT_ID|CRON_SECRET"
   ```

2. **Database Connection**
   ```bash
   # Test Supabase connection
   npm run dev
   # Open browser to http://localhost:3000/api/contacts
   # Should return empty array or contact data
   ```

3. **Build Test**
   ```bash
   npm run build
   npm run start
   ```

---

## Manual Testing Checklist

### Phase 1: Project Setup & Foundation

- [ ] Application starts without errors
- [ ] All pages load (Dashboard, Contacts, Calendar, Emails, Settings)
- [ ] Navigation works correctly
- [ ] Mobile responsive layout (test on phone or dev tools)
- [ ] No console errors on page load

### Phase 2: Contact Management Core

#### Add Contact
- [ ] Navigate to Contacts page
- [ ] Click "Add Contact" button
- [ ] Fill in all fields:
  - Name: "John Smith"
  - Email: "john@example.com"
  - Company: "Example Corp"
  - Phone: "+1-555-123-4567"
  - Website: "https://example.com"
  - Status: "New"
  - Priority: "Medium"
  - Notes: "Test contact"
- [ ] Submit form
- [ ] Contact appears in list
- [ ] Verify contact data is correct

#### Edit Contact
- [ ] Click on a contact in the list
- [ ] Click "Edit" button
- [ ] Change status to "Contacted"
- [ ] Change priority to "High"
- [ ] Add notes: "Updated via edit"
- [ ] Save changes
- [ ] Verify changes are reflected

#### Search & Filter
- [ ] Enter name in search box
- [ ] Verify contact appears
- [ ] Filter by status "Contacted"
- [ ] Verify only contacted contacts show
- [ ] Filter by priority "High"
- [ ] Clear filters

#### Delete Contact
- [ ] Select a test contact
- [ ] Click "Delete" button
- [ ] Confirm deletion
- [ ] Verify contact is removed from list

### Phase 3: Google OAuth & Authentication

#### Connect Google Account
- [ ] Navigate to Settings
- [ ] Click "Connect Google" button
- [ ] Redirects to Google OAuth consent screen
- [ ] Select Google account
- [ ] Grant permissions for Gmail, Calendar, Sheets
- [ ] Redirects back to Settings
- [ ] Shows "Connected" status
- [ ] Displays user profile (name, email, picture)

#### Verify Connection
- [ ] Settings page shows green checkmark
- [ ] Lists granted permissions
- [ ] Profile picture displays correctly

#### Disconnect Google Account
- [ ] Click "Disconnect" button
- [ ] Confirm disconnection
- [ ] Status changes to "Not Connected"
- [ ] Profile information clears

### Phase 4: Google Sheets Integration

#### Configure Sheets
- [ ] Reconnect Google account
- [ ] In Settings, find "Google Sheets Configuration"
- [ ] Enter Spreadsheet ID (from URL)
- [ ] Enter Sheet Name (e.g., "Contacts")
- [ ] Configure column mapping:
  - Column A → Name
  - Column B → Email
  - Column C → Company
  - Column D → Phone
  - Column E → Website
  - Column F → Notes
- [ ] Click "Test Connection"
- [ ] Shows "Connection successful, found X rows"
- [ ] Save configuration

#### Import Contacts
- [ ] Click "Import Contacts" button
- [ ] Wait for processing
- [ ] Shows import results (new: X, duplicates: Y)
- [ ] Imported contacts appear in Contacts list

#### Duplicate Detection
- [ ] Create contact with email "duplicate@example.com"
- [ ] In Google Sheets, add row with same email
- [ ] Run import again
- [ ] Duplicate detected
- [ ] Opens duplicate resolution interface
- [ ] Shows side-by-side comparison
- [ ] Select "Merge" option
- [ ] Verify data merged correctly

#### Test Duplicate Algorithms
- [ ] **Email Match**: Create contact with exact email, import duplicate → Should detect
- [ ] **Phone Match**: Create contact with phone "+1 555 123 4567", import with "(555) 123-4567" → Should detect
- [ ] **Name Similarity**: Create "John Smith", import "John Smyth" → Should detect with 70%+ confidence
- [ ] **Domain Match**: Create "alice@company.com" + "Company Inc", import "bob@company.com" + "Company Inc" → Should detect

### Phase 5: Gmail Integration

#### Scan Gmail
- [ ] Navigate to Emails page
- [ ] Click "Scan Gmail" button
- [ ] Processing indicator appears
- [ ] Shows scan results (scanned: X, flagged: Y)

#### Verify Email Flagging
- [ ] Send email to yourself with subject "Partnership Opportunity"
- [ ] Wait 2 minutes
- [ ] Click "Scan Gmail" again
- [ ] Email appears in flagged list
- [ ] Shows correct subject, sender, snippet

#### Email Actions
- [ ] Click on flagged email
- [ ] Click "Mark as Read"
- [ ] Email marked as read
- [ ] Click "Action Required" toggle
- [ ] Status updates
- [ ] Click "Archive" or delete icon
- [ ] Email removed from list

#### Email Filtering
- [ ] Filter by "Unread"
- [ ] Filter by "Action Required"
- [ ] Verify filters work correctly

### Phase 6: Calendar Integration

#### Sync Calendar
- [ ] Navigate to Calendar page
- [ ] Click "Sync Calendar" button
- [ ] Shows sync progress
- [ ] Events appear in list
- [ ] Shows event title, date/time, description

#### Verify Event Linking
- [ ] Create calendar event in Google Calendar
- [ ] Add contact email as attendee
- [ ] Sync calendar again
- [ ] Event shows linked contact name
- [ ] Click contact name → navigates to contact page

#### Upcoming Events Widget
- [ ] Navigate to Dashboard
- [ ] Verify "Upcoming Events" widget shows next 5 events
- [ ] Shows correct dates
- [ ] Click event → navigates to Calendar page

### Phase 7: Dashboard & Analytics

#### Stats Cards
- [ ] Dashboard shows 4 stat cards:
  - Total Contacts (correct count)
  - Active Outreach (status = "contacted" or "interested")
  - Response Rate (responded / contacted * 100)
  - Pending Follow-ups (next_followup_date in past)
- [ ] Verify all counts are accurate

#### Daily Briefing
- [ ] Shows "New Contacts Today" count
- [ ] Shows "Follow-ups Due Today" count
- [ ] Shows "Flagged Emails" count
- [ ] Shows "Upcoming Events" count
- [ ] Counts match actual data

#### Quick Actions
- [ ] "Add Contact" button → navigates to contact form
- [ ] "Import from Sheets" button → triggers import
- [ ] "Scan Gmail" button → triggers scan
- [ ] "Sync Calendar" button → syncs events

#### Recent Activity
- [ ] Shows last 10 activities
- [ ] Displays contact changes, new emails, upcoming events
- [ ] Shows correct timestamps
- [ ] Icons display correctly

### Phase 8: Automation & Background Jobs

#### Automation Logs
- [ ] Navigate to Settings
- [ ] Scroll to "Automation Logs"
- [ ] Logs displayed (if any jobs have run)
- [ ] Filter by job name:
  - All Jobs
  - Daily Briefing
  - Check Follow-ups
  - Sync Sheets
- [ ] Shows status (success/failed/running)
- [ ] Shows execution time
- [ ] Shows message details
- [ ] Click "Refresh" to update

---

## API Endpoint Testing

Use `curl` or Postman to test API endpoints directly.

### Contacts API

#### List Contacts
```bash
curl http://localhost:3000/api/contacts
```
Expected: JSON array of contacts

#### Get Single Contact
```bash
curl http://localhost:3000/api/contacts/[contact-id]
```
Expected: JSON object with contact details

#### Create Contact
```bash
curl -X POST http://localhost:3000/api/contacts \
  -H "Content-Type: application/json" \
  -d '{
    "name": "API Test",
    "email": "apitest@example.com",
    "company": "Test Corp",
    "status": "new",
    "priority": "medium"
  }'
```
Expected: 201 status, new contact JSON

#### Update Contact
```bash
curl -X PATCH http://localhost:3000/api/contacts/[contact-id] \
  -H "Content-Type: application/json" \
  -d '{"status": "contacted"}'
```
Expected: 200 status, updated contact JSON

#### Delete Contact
```bash
curl -X DELETE http://localhost:3000/api/contacts/[contact-id]
```
Expected: 204 status

### Settings API

#### Google Connection Status
```bash
curl http://localhost:3000/api/settings/google
```
Expected: `{"connected": true/false, "email": "...", ...}`

### Sheets Import API

#### Import from Sheets
```bash
curl -X POST http://localhost:3000/api/contacts/sync \
  -H "Content-Type: application/json" \
  -d '{
    "spreadsheetId": "your-sheet-id",
    "sheetName": "Contacts",
    "columnMapping": {"A": "name", "B": "email"}
  }'
```
Expected: Import results with counts

### Gmail API

#### Scan Gmail
```bash
curl -X POST http://localhost:3000/api/emails/scan
```
Expected: `{"success": true, "scanned": X, "flagged": Y}`

#### List Flagged Emails
```bash
curl http://localhost:3000/api/emails
```
Expected: JSON array of flagged emails

### Calendar API

#### Sync Calendar
```bash
curl -X POST http://localhost:3000/api/calendar/events
```
Expected: `{"success": true, "synced": X}`

#### List Events
```bash
curl http://localhost:3000/api/calendar/events
```
Expected: JSON array of events

### Dashboard API

#### Get Stats
```bash
curl http://localhost:3000/api/dashboard/stats
```
Expected: JSON with stats, briefing, and activity

---

## Integration Testing

### End-to-End Google Sheets Import Flow

1. **Setup**: Create test Google Sheet with 10 contacts
2. **Configure**: Set up sheets configuration in Settings
3. **Import**: Click "Import Contacts" button
4. **Verify**: All 10 contacts imported to database
5. **Duplicate**: Add same 10 contacts to sheet again
6. **Import**: Import again
7. **Verify**: Duplicate resolution UI appears
8. **Resolve**: Merge all duplicates
9. **Verify**: Still only 10 contacts in database
10. **Check Logs**: Automation logs show import success

### End-to-End Gmail Monitoring Flow

1. **Connect**: Connect Google account
2. **Add Contact**: Create contact with your email
3. **Send Email**: Send yourself email with "Partnership" in subject
4. **Scan**: Click "Scan Gmail" button
5. **Verify**: Email appears in flagged emails
6. **Link**: Verify email shows linked contact
7. **Action**: Mark as action required
8. **Check**: Dashboard shows "1 Flagged Email"
9. **Complete**: Mark as read
10. **Archive**: Remove from flagged list

### End-to-End Calendar Integration Flow

1. **Connect**: Google account connected
2. **Add Contact**: Create contact with your email
3. **Create Event**: Create Google Calendar event with contact as attendee
4. **Sync**: Click "Sync Calendar" button
5. **Verify**: Event appears in Calendar page
6. **Link**: Event shows linked contact name
7. **Dashboard**: Event appears in "Upcoming Events" widget
8. **Navigation**: Click contact name → navigates to contact page
9. **Data**: Contact page shows event in activities

### End-to-End Follow-up Workflow

1. **Add Contact**: Create contact "Follow-up Test"
2. **Set Date**: Edit contact, set next_followup_date to yesterday
3. **Dashboard**: Dashboard shows "1 Pending Follow-up"
4. **Daily Briefing**: Shows contact in "Follow-ups Due Today"
5. **Update**: Click contact, update status to "Contacted"
6. **Set New Date**: Set next_followup_date to 7 days from now
7. **Verify**: No longer in pending follow-ups
8. **Future**: In 7 days, will appear again

---

## Cron Job Testing

### Manual Cron Triggers

Set up your `CRON_SECRET` first:
```bash
export CRON_SECRET="your-secret-from-env"
```

### Test Daily Briefing

```bash
curl -X GET http://localhost:3000/api/cron/daily-briefing \
  -H "Authorization: Bearer $CRON_SECRET"
```

**Expected Response:**
```json
{
  "success": true,
  "briefing": {
    "newContactsToday": 2,
    "followupsDueToday": 3,
    "flaggedEmails": 5,
    "upcomingEvents": 4
  }
}
```

**Verify:**
- [ ] Automation log created
- [ ] Status is "success"
- [ ] Execution time recorded
- [ ] Message contains briefing summary

### Test Follow-up Checker

```bash
curl -X GET http://localhost:3000/api/cron/check-followups \
  -H "Authorization: Bearer $CRON_SECRET"
```

**Expected Response:**
```json
{
  "success": true,
  "checked": 50,
  "due": 3,
  "notified": 3
}
```

**Verify:**
- [ ] Finds contacts with past next_followup_date
- [ ] Creates notifications (check database)
- [ ] Logs execution

### Test Sheets Sync

```bash
curl -X GET http://localhost:3000/api/cron/sync-sheets \
  -H "Authorization: Bearer $CRON_SECRET"
```

**Expected Response:**
```json
{
  "success": true,
  "processed": 20,
  "imported": 5,
  "updated": 10,
  "duplicatesFound": 5,
  "executionTime": 2500
}
```

**Verify:**
- [ ] Reads sheets configuration
- [ ] Imports new contacts
- [ ] Auto-merges 90%+ confidence duplicates
- [ ] Skips lower confidence duplicates
- [ ] Logs execution with detailed message

### Test Cron Security

#### Should Succeed
```bash
curl -X GET http://localhost:3000/api/cron/daily-briefing \
  -H "Authorization: Bearer correct-secret"
```

#### Should Fail (401)
```bash
# Missing header
curl -X GET http://localhost:3000/api/cron/daily-briefing

# Wrong secret
curl -X GET http://localhost:3000/api/cron/daily-briefing \
  -H "Authorization: Bearer wrong-secret"
```

---

## Production Verification

After deploying to Vercel, test the following:

### Deployment Checks

- [ ] **App Loads**: Visit `https://your-app.vercel.app`
- [ ] **All Pages Load**: Navigate to each page
- [ ] **No Console Errors**: Open browser DevTools
- [ ] **Mobile Responsive**: Test on phone or resize browser

### Environment Variables

- [ ] **Supabase Connected**: Contacts page loads
- [ ] **Google OAuth Works**: Can connect Google account
- [ ] **Cron Secret Set**: Cron jobs protected

### Google OAuth Production

- [ ] **Redirect URI**: Updated in Google Cloud Console
- [ ] **Origin URI**: Added to authorized origins
- [ ] **Connect Google**: Works without errors
- [ ] **Scopes Granted**: Shows Gmail, Calendar, Sheets access

### Cron Jobs in Production

Verify cron jobs are scheduled:

1. **Vercel Dashboard** → Your Project
2. **Settings** → **Cron Jobs**
3. Should see:
   - `daily-briefing` - 8:00 AM daily
   - `check-followups` - Every hour
   - `sync-sheets` - Midnight daily

### Test Cron Execution (Production)

```bash
curl -X GET https://your-app.vercel.app/api/cron/daily-briefing \
  -H "Authorization: Bearer $CRON_SECRET"
```

**Verify in App:**
1. Go to Settings page
2. Scroll to "Automation Logs"
3. Should see log entry with status "success"

### Database Connectivity

- [ ] **Create Contact**: Add contact via UI
- [ ] **Edit Contact**: Update contact
- [ ] **Delete Contact**: Remove contact
- [ ] **Import Sheets**: Run sheets import
- [ ] **Scan Gmail**: Trigger email scan
- [ ] **Sync Calendar**: Sync calendar events

### Performance Testing

- [ ] **Page Load Time**: All pages load in < 3 seconds
- [ ] **API Response Time**: Contacts API responds in < 1 second
- [ ] **Import Performance**: Imports 100 contacts in < 10 seconds
- [ ] **Gmail Scan**: Scans 50 emails in < 5 seconds

---

## Common Issues & Solutions

### Issue: Google OAuth "redirect_uri_mismatch"
**Solution**:
1. Go to Google Cloud Console
2. Update redirect URI to match exactly: `https://your-app.vercel.app/api/auth/google/callback`
3. No trailing slash
4. Wait 5 minutes for changes to propagate

### Issue: Cron jobs return 401
**Solution**:
1. Verify `CRON_SECRET` is set in Vercel environment variables
2. Use correct secret in Authorization header
3. Format: `Authorization: Bearer your-secret`

### Issue: Sheets import fails
**Solution**:
1. Verify Google account connected
2. Check Spreadsheet ID is correct
3. Verify sheet name matches exactly (case-sensitive)
4. Ensure OAuth scopes include Sheets API

### Issue: Gmail scan finds no emails
**Solution**:
1. Check Gmail has emails in the specified time range (last 7 days)
2. Verify Gmail API is enabled in Google Cloud
3. Check OAuth scopes include Gmail API
4. Try "Scan Gmail" button to refresh

### Issue: Duplicate detection not working
**Solution**:
1. Check email normalization (lowercase)
2. Verify phone number normalization (digits only)
3. Check Levenshtein distance threshold (< 3 for 90%+ confidence)
4. Review duplicate matches in automation logs

---

## Testing Checklist Summary

### Pre-Deployment
- [ ] All dependencies installed
- [ ] Environment variables configured
- [ ] Database migrations run
- [ ] Local build succeeds
- [ ] All manual tests pass

### Post-Deployment
- [ ] Production app loads
- [ ] Google OAuth works
- [ ] Cron jobs scheduled
- [ ] Database operations work
- [ ] All integrations functional

### Ongoing Monitoring
- [ ] Check automation logs weekly
- [ ] Verify cron jobs running
- [ ] Monitor API response times
- [ ] Review error logs
- [ ] Test new features after updates

---

## Automated Testing (Future Enhancement)

For production systems, consider adding:

### Unit Tests
- Test duplicate detection algorithms
- Test email flagging logic
- Test event linking logic
- Test phone/email normalization

### Integration Tests
- Test API endpoints with test database
- Test Google API mocks
- Test cron job logic

### E2E Tests
- Use Playwright or Cypress
- Test complete user flows
- Test in multiple browsers
- Test mobile responsive design

**Example Playwright Test:**
```typescript
test('should import contacts from Google Sheets', async ({ page }) => {
  await page.goto('/settings');
  await page.click('text=Connect Google');
  // ... complete OAuth flow
  await page.fill('[name="spreadsheetId"]', 'test-sheet-id');
  await page.click('text=Import Contacts');
  await expect(page.locator('text=Successfully imported')).toBeVisible();
});
```

---

**Testing Complete!**

Your BTC Affiliate Outreach system is thoroughly tested and ready for production use.
