-- Add user_id and is_shared columns to contacts table
-- This enables personal vs team contacts

-- Add user_id column (references auth.users)
ALTER TABLE contacts
ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Add is_shared flag (true = team contact, false/null = personal)
ALTER TABLE contacts
ADD COLUMN is_shared BOOLEAN DEFAULT false;

-- Create index for faster queries
CREATE INDEX idx_contacts_user_id ON contacts(user_id);
CREATE INDEX idx_contacts_is_shared ON contacts(is_shared);

-- Set existing contacts to belong to Russ (will update after first login)
-- For now, mark all as shared so they're visible to everyone
UPDATE contacts SET is_shared = true;

-- Add RLS (Row Level Security) policies
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;

-- Policy: Users can see their own contacts
CREATE POLICY "Users can view own contacts"
  ON contacts FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: Users can see shared/team contacts
CREATE POLICY "Users can view team contacts"
  ON contacts FOR SELECT
  USING (is_shared = true);

-- Policy: Users can insert their own contacts
CREATE POLICY "Users can create own contacts"
  ON contacts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own contacts
CREATE POLICY "Users can update own contacts"
  ON contacts FOR UPDATE
  USING (auth.uid() = user_id);

-- Policy: Users can update team contacts
CREATE POLICY "Users can update team contacts"
  ON contacts FOR UPDATE
  USING (is_shared = true);

-- Policy: Users can delete their own contacts
CREATE POLICY "Users can delete own contacts"
  ON contacts FOR DELETE
  USING (auth.uid() = user_id);

-- Add comment
COMMENT ON COLUMN contacts.user_id IS 'Owner of the contact (NULL for team contacts)';
COMMENT ON COLUMN contacts.is_shared IS 'Whether this contact is shared with the team';
