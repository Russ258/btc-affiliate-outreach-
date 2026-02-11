-- Create daily_queue table
-- Run this in your Supabase SQL Editor

CREATE TABLE IF NOT EXISTS daily_queue (
  id BIGSERIAL PRIMARY KEY,
  queue_date DATE NOT NULL,
  contact_id BIGINT NOT NULL REFERENCES contacts(id) ON DELETE CASCADE,
  state TEXT NOT NULL DEFAULT 'pending' CHECK (state IN ('pending', 'contacted', 'skipped')),
  added_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Prevent duplicate contacts in same day's queue
  UNIQUE(queue_date, contact_id)
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_daily_queue_date_state ON daily_queue(queue_date, state);
CREATE INDEX IF NOT EXISTS idx_daily_queue_contact_id ON daily_queue(contact_id);

-- Enable Row Level Security
ALTER TABLE daily_queue ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to read their team's daily queue
CREATE POLICY "Users can view daily queue"
  ON daily_queue
  FOR SELECT
  TO authenticated
  USING (true);

-- Allow authenticated users to insert into daily queue
CREATE POLICY "Users can generate daily queue"
  ON daily_queue
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Allow authenticated users to update daily queue
CREATE POLICY "Users can update daily queue"
  ON daily_queue
  FOR UPDATE
  TO authenticated
  USING (true);

-- Trigger to auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_daily_queue_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER daily_queue_updated_at
  BEFORE UPDATE ON daily_queue
  FOR EACH ROW
  EXECUTE FUNCTION update_daily_queue_updated_at();
