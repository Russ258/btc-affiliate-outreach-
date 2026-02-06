-- Add 'accepted' to the allowed status values in contacts table
-- Drop the old constraint
ALTER TABLE contacts DROP CONSTRAINT IF EXISTS contacts_status_check;

-- Add new constraint with 'accepted' included
ALTER TABLE contacts ADD CONSTRAINT contacts_status_check
  CHECK (status IN ('new', 'contacted', 'responded', 'interested', 'accepted', 'declined'));
