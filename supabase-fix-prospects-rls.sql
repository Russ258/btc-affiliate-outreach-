-- Fix RLS policy for prospects table to allow service role inserts
-- Run this in your Supabase SQL Editor

-- Drop the old restrictive policy
DROP POLICY IF EXISTS "Users can insert prospects" ON prospects;

-- Create new policy that allows both authenticated users AND service role
CREATE POLICY "Allow inserts for authenticated and service role"
  ON prospects
  FOR INSERT
  WITH CHECK (true);
