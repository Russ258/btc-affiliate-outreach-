-- Create blocklist table for names to exclude from daily queue
-- Run this in your Supabase SQL Editor

CREATE TABLE IF NOT EXISTS blocklist (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  reason TEXT, -- Optional: why they're blocked (e.g., "already working with", "declined", etc.)
  email TEXT,
  twitter_handle TEXT,
  youtube_channel TEXT,
  notes TEXT,
  added_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Prevent duplicates
  UNIQUE(name)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_blocklist_name ON blocklist(LOWER(name));
CREATE INDEX IF NOT EXISTS idx_blocklist_email ON blocklist(LOWER(email));
CREATE INDEX IF NOT EXISTS idx_blocklist_twitter ON blocklist(LOWER(twitter_handle));
CREATE INDEX IF NOT EXISTS idx_blocklist_youtube ON blocklist(LOWER(youtube_channel));

-- Enable Row Level Security
ALTER TABLE blocklist ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to view blocklist
CREATE POLICY "Users can view blocklist"
  ON blocklist
  FOR SELECT
  TO authenticated
  USING (true);

-- Allow authenticated users to add to blocklist
CREATE POLICY "Users can add to blocklist"
  ON blocklist
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Allow authenticated users to delete from blocklist
CREATE POLICY "Users can delete from blocklist"
  ON blocklist
  FOR DELETE
  TO authenticated
  USING (true);

-- Trigger to auto-update updated_at
CREATE OR REPLACE FUNCTION update_blocklist_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER blocklist_updated_at
  BEFORE UPDATE ON blocklist
  FOR EACH ROW
  EXECUTE FUNCTION update_blocklist_updated_at();
