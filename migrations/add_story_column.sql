-- Migration: Add story (origin story) column to users table
-- Date: 2026-01-05
-- Description: Adds a story VARCHAR(144) column to store user's origin story (max 144 characters)

-- Add the story column to the users table
ALTER TABLE users
ADD COLUMN IF NOT EXISTS story VARCHAR(144) DEFAULT '';

-- Verify the column was added
SELECT column_name, data_type, character_maximum_length, column_default
FROM information_schema.columns
WHERE table_name = 'users'
AND column_name = 'story';
