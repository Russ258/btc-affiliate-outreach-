-- Migration: Add Twitter handle support and make email optional
-- Date: 2026-01-30

-- Step 1: Make email nullable (allow contacts without email)
ALTER TABLE contacts
  ALTER COLUMN email DROP NOT NULL;

-- Step 2: Drop unique constraint on email (since it can be null, multiple nulls are allowed)
ALTER TABLE contacts
  DROP CONSTRAINT IF EXISTS contacts_email_key;

-- Step 3: Add unique constraint on email only when it's not null
CREATE UNIQUE INDEX contacts_email_unique_idx ON contacts(email) WHERE email IS NOT NULL;

-- Step 4: Add twitter_handle column
ALTER TABLE contacts
  ADD COLUMN twitter_handle VARCHAR(255);

-- Step 5: Add unique constraint on twitter_handle (when not null)
CREATE UNIQUE INDEX contacts_twitter_handle_unique_idx ON contacts(twitter_handle) WHERE twitter_handle IS NOT NULL;

-- Step 6: Add index on twitter_handle for fast lookups
CREATE INDEX idx_contacts_twitter_handle ON contacts(twitter_handle);

-- Step 7: Add constraint to ensure either email OR twitter_handle exists
ALTER TABLE contacts
  ADD CONSTRAINT contacts_require_identifier
  CHECK (
    (email IS NOT NULL AND email != '') OR
    (twitter_handle IS NOT NULL AND twitter_handle != '')
  );

-- Step 8: Add comment
COMMENT ON COLUMN contacts.twitter_handle IS 'Twitter/X handle without @ symbol (e.g., "johndoe" not "@johndoe")';
