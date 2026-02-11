-- Update daily_queue table to support both contacts and prospects
-- Run this in your Supabase SQL Editor

-- Add prospect_id column (nullable)
ALTER TABLE daily_queue
ADD COLUMN IF NOT EXISTS prospect_id UUID REFERENCES prospects(id) ON DELETE CASCADE;

-- Make contact_id nullable (it was NOT NULL before)
ALTER TABLE daily_queue
ALTER COLUMN contact_id DROP NOT NULL;

-- Add constraint: must have either contact_id OR prospect_id (but not both or neither)
ALTER TABLE daily_queue
ADD CONSTRAINT daily_queue_source_check CHECK (
  (contact_id IS NOT NULL AND prospect_id IS NULL) OR
  (contact_id IS NULL AND prospect_id IS NOT NULL)
);

-- Create index for prospect_id
CREATE INDEX IF NOT EXISTS idx_daily_queue_prospect_id ON daily_queue(prospect_id);

-- Update unique constraint to include prospect_id
ALTER TABLE daily_queue DROP CONSTRAINT IF EXISTS daily_queue_queue_date_contact_id_key;

-- Note: We can't have a simple UNIQUE constraint anymore since we have two nullable columns
-- Instead, we'll use a partial unique index
CREATE UNIQUE INDEX IF NOT EXISTS daily_queue_unique_contact
  ON daily_queue(queue_date, contact_id)
  WHERE contact_id IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS daily_queue_unique_prospect
  ON daily_queue(queue_date, prospect_id)
  WHERE prospect_id IS NOT NULL;
