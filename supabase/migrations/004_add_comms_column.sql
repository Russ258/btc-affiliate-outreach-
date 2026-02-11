-- Add comms column to contacts table
ALTER TABLE contacts ADD COLUMN IF NOT EXISTS comms TEXT;

-- Set all existing contacts to use X (since that's what you've been using)
UPDATE contacts SET comms = 'x' WHERE comms IS NULL;

-- Add check constraint for valid comms values
ALTER TABLE contacts ADD CONSTRAINT contacts_comms_check
CHECK (comms IN ('x', 'instagram', 'telegram', 'email', 'whatsapp', 'messages'));
