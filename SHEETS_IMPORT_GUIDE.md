# Google Sheets Import Guide

Complete guide to importing contacts from Google Sheets with automatic duplicate detection.

## Overview

The Google Sheets import feature allows you to:
- Import contacts from any Google Sheets spreadsheet
- Automatically detect duplicates using smart algorithms
- Review and merge duplicates before importing
- Keep your contact database clean and organized

## Prerequisites

- ✅ Google account connected (see Settings page)
- ✅ Google Sheets with contact data
- ✅ Read access to the spreadsheet

## Sheet Format

### Required Columns

Your Google Sheet should have at minimum:
- **Name** (required)
- **Email** (required)

### Recommended Format

For best results, organize your sheet with these columns in order:

| Column A | Column B | Column C | Column D | Column E | Column F |
|----------|----------|----------|----------|----------|----------|
| Name     | Email    | Company  | Phone    | Website  | Notes    |

### Example Sheet

```
Name              Email                    Company        Phone           Website                Notes
John Doe          john@example.com         Example Inc    (555) 123-4567  https://example.com   Met at conference
Jane Smith        jane@acme.co             ACME Corp      555-234-5678    acme.co               Follow up Q1
Bob Johnson       bob.johnson@startup.io   StartupIO      +1-555-345-6789 startup.io            High priority
```

### Important Notes

1. **First row must be headers** - The import skips row 1 automatically
2. **Email validation** - Invalid emails will be skipped
3. **Empty rows** - Completely empty rows are ignored
4. **Required fields** - Rows without name or email are skipped

## How to Import

### Step 1: Get Your Spreadsheet ID

1. Open your Google Sheet
2. Look at the URL in your browser:
   ```
   https://docs.google.com/spreadsheets/d/1ABC123xyz456DEF789/edit
   ```
3. Copy the ID between `/d/` and `/edit`:
   ```
   1ABC123xyz456DEF789
   ```

### Step 2: Find Your Sheet Name

1. Look at the bottom of your Google Sheet
2. You'll see tabs like "Sheet1", "Contacts", "Affiliates", etc.
3. Note the exact name (case-sensitive)

### Step 3: Import in Settings

1. Go to **Settings** in the app
2. Scroll to **Google Sheets Import** section
3. Paste your **Spreadsheet ID**
4. Enter your **Sheet Name**
5. Click **Import Contacts from Sheet**

### Step 4: Review Duplicates

If duplicates are detected, you'll see a review screen:

**For each potential duplicate:**
- View the new contact from your sheet
- See all matching contacts in your database
- See confidence score (70-100%) and match reasons
- Choose an action:
  - **Merge with This** - Combine data with existing contact
  - **Create as New Contact** - Add as separate contact
  - **Skip This Contact** - Don't import

## Duplicate Detection

### How It Works

The system uses 4 algorithms to detect duplicates:

#### 1. Exact Email Match (100% confidence)
```
New: john@example.com
Existing: john@example.com
Result: Perfect match ✓
```

#### 2. Phone Number Match (90% confidence)
```
New: (555) 123-4567
Existing: 555-123-4567
Result: Same number (different formatting) ✓
```

#### 3. Name Similarity (70-85% confidence)
Uses Levenshtein distance algorithm:
```
New: John Doe
Existing: Jon Doe
Result: Similar name (edit distance: 1) ✓
```

#### 4. Domain + Company Match (80% confidence)
```
New: jane@acme.com | ACME Corporation
Existing: john@acme.com | ACME Corp
Result: Same domain + similar company ✓
```

### Confidence Levels

| Confidence | Color | Meaning |
|------------|-------|---------|
| 90-100% | 🔴 Red | Very likely duplicate |
| 75-89% | 🟡 Yellow | Probably duplicate |
| 70-74% | ⚪ Gray | Possibly duplicate |

### Merge Behavior

When you merge contacts, the system:
1. **Keeps existing ID** - Contact remains the same in database
2. **Updates with new data** - Fills in missing fields
3. **Combines notes** - Appends new notes to existing
4. **Merges tags** - Combines unique tags from both
5. **Preserves dates** - Keeps earliest contact date

## Common Scenarios

### Scenario 1: Clean Import (No Duplicates)

If no duplicates are found:
```
✅ Successfully imported 50 contacts from Google Sheets!
```

All contacts are automatically added to your database.

### Scenario 2: Some Duplicates

If duplicates are found:
```
✅ Imported 45 contacts. Found 5 potential duplicates to review.
```

You'll review the 5 duplicates one by one, then the other 45 are already imported.

### Scenario 3: Exact Email Duplicates

```
New Contact:
  Name: John Doe
  Email: john@example.com

Matches in Database (100% confidence):
  Name: J. Doe
  Email: john@example.com
  Company: Example Inc
```

**Recommended action:** Merge (combines both records)

### Scenario 4: Similar Names, Different Emails

```
New Contact:
  Name: John Smith
  Email: jsmith@newcompany.com

Matches in Database (75% confidence):
  Name: Jon Smith
  Email: john.smith@oldcompany.com
```

**Could be:**
- Same person with new job → Merge
- Different person with similar name → Create new

## Tips & Best Practices

### Before Importing

1. **Clean your sheet** - Remove test data, empty rows
2. **Validate emails** - Check for typos in email addresses
3. **Standardize format** - Consistent column order
4. **Remove duplicates in sheet** - Clean up in Google Sheets first
5. **Backup database** - Export current contacts (optional)

### During Import

1. **Review carefully** - Don't rush through duplicates
2. **High confidence (90%+)** - Usually safe to merge
3. **Medium confidence (75-89%)** - Check details carefully
4. **Low confidence (70-74%)** - Often better to create new
5. **When unsure** - Skip and review manually later

### After Import

1. **Check contacts page** - Verify imported contacts
2. **Search for name** - Find specific imports
3. **Update statuses** - Mark as "contacted" if already reached out
4. **Set follow-ups** - Add next follow-up dates

## Troubleshooting

### "Failed to read Google Sheet"

**Causes:**
- Spreadsheet ID is incorrect
- You don't have access to the sheet
- Sheet is not shared with your Google account

**Solutions:**
1. Double-check the spreadsheet ID
2. Make sure you're signed in with the right Google account
3. Share the sheet with your connected Google account
4. Reconnect Google account in Settings

### "No valid contacts found in spreadsheet"

**Causes:**
- Sheet is empty
- Missing required columns (Name, Email)
- All emails are invalid
- Wrong sheet name

**Solutions:**
1. Check your sheet has data
2. Verify first row has headers
3. Ensure columns A (Name) and B (Email) have data
4. Check sheet name spelling (case-sensitive)

### "A contact with this email already exists"

**Cause:**
- Trying to create new contact but email exists

**Solution:**
- This shouldn't happen during normal import (duplicates are caught)
- If you see this, someone might have added the contact manually during import
- Refresh and try again

### Import taking a long time

**Normal:**
- Large sheets (1000+ rows) may take 30-60 seconds
- Reviewing many duplicates takes time

**If stuck:**
1. Check browser console for errors
2. Refresh the page
3. Try importing smaller batches
4. Check Google API quotas

## Re-importing / Syncing

### First Import
- All contacts are new
- Duplicate detection runs automatically
- You review matches

### Subsequent Imports
- System remembers `sheets_row_id`
- Duplicates from same row can update existing contact
- New rows are treated as new contacts

### Manual Sync Workflow

1. **Add new contacts** to your Google Sheet (append to bottom)
2. **Update existing contacts** in sheet
3. **Run import** from Settings
4. **Review duplicates**
5. **Merge or create** as needed

## Advanced: Column Mapping

Currently, the system expects this order:
```
A: Name
B: Email
C: Company
D: Phone
E: Website
F: Notes
```

**Future enhancement:** Custom column mapping in the UI

**Workaround:** Rearrange your Google Sheet columns to match

## Security & Privacy

- ✅ OAuth tokens stored encrypted in Supabase
- ✅ Read-only access to your sheets (can also write for future sync)
- ✅ No data sent to third parties
- ✅ Your Google data stays in your control
- ✅ Disconnect anytime from Settings

## Automation (Coming Soon)

**Phase 8 will add:**
- Daily auto-sync (midnight)
- Automatic duplicate merging (high confidence)
- Status sync back to Google Sheets
- Email notifications for new imports

## FAQs

**Q: Can I import from multiple sheets?**
A: Yes, change the spreadsheet ID and sheet name for each import.

**Q: Will it overwrite my existing contacts?**
A: No, existing contacts are only updated if you choose "Merge" during duplicate review.

**Q: Can I undo an import?**
A: Currently no. Be careful when reviewing duplicates. Future versions will add undo.

**Q: How often should I sync?**
A: Depends on your workflow. Daily/weekly is common. Auto-sync coming in Phase 8.

**Q: What happens if I delete a row in the sheet?**
A: Nothing. The contact remains in your database. Manual deletion required.

**Q: Can I export contacts back to Google Sheets?**
A: Not yet. Two-way sync coming in future version.

**Q: How many contacts can I import?**
A: No hard limit. Tested with 10,000+ rows successfully.

---

**Need help?** Check the main README or submit an issue on GitHub.
