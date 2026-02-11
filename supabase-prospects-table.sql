-- Create prospects table for discovered leads (before they become contacts)
-- Run this in your Supabase SQL Editor

CREATE TABLE IF NOT EXISTS prospects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT,
  twitter_handle TEXT,
  instagram_handle TEXT,
  linkedin_url TEXT,
  youtube_channel TEXT,
  youtube_url TEXT,

  -- Metadata
  source TEXT NOT NULL CHECK (source IN ('youtube', 'twitter', 'instagram', 'linkedin', 'manual')),
  follower_count INTEGER,
  bio TEXT,
  website TEXT,

  -- Status
  status TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'queued', 'contacted', 'skipped')),
  confidence TEXT DEFAULT 'MEDIUM' CHECK (confidence IN ('HIGH', 'MEDIUM', 'LOW')),

  -- Tracking
  discovered_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  contacted_at TIMESTAMP WITH TIME ZONE,
  moved_to_contacts_at TIMESTAMP WITH TIME ZONE,
  contact_id UUID REFERENCES contacts(id) ON DELETE SET NULL,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Prevent duplicates
  UNIQUE(twitter_handle),
  UNIQUE(youtube_channel),
  UNIQUE(instagram_handle)
);

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_prospects_source ON prospects(source);
CREATE INDEX IF NOT EXISTS idx_prospects_status ON prospects(status);
CREATE INDEX IF NOT EXISTS idx_prospects_discovered_at ON prospects(discovered_at);
CREATE INDEX IF NOT EXISTS idx_prospects_confidence ON prospects(confidence);

-- Enable Row Level Security
ALTER TABLE prospects ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to read prospects
CREATE POLICY "Users can view prospects"
  ON prospects
  FOR SELECT
  TO authenticated
  USING (true);

-- Allow authenticated users to insert prospects
CREATE POLICY "Users can insert prospects"
  ON prospects
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Allow authenticated users to update prospects
CREATE POLICY "Users can update prospects"
  ON prospects
  FOR UPDATE
  TO authenticated
  USING (true);

-- Trigger to auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_prospects_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER prospects_updated_at
  BEFORE UPDATE ON prospects
  FOR EACH ROW
  EXECUTE FUNCTION update_prospects_updated_at();
