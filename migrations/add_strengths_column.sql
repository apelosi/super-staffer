-- Migration: Add strengths column to users table
-- Date: 2026-01-05
-- Description: Adds a strengths TEXT[] column to store user's character strengths

-- Add the strengths column to the users table
ALTER TABLE users
ADD COLUMN IF NOT EXISTS strengths TEXT[] DEFAULT '{}';

-- Verify the column was added
SELECT column_name, data_type, column_default
FROM information_schema.columns
WHERE table_name = 'users'
AND column_name = 'strengths';
