-- Migration: Update story column length from 144 to 256 characters
-- Date: 2026-01-05
-- Description: Increases the story VARCHAR length from 144 to 256 characters to allow longer origin stories

-- ⚠️ RUN THIS IN BOTH DEV AND PROD DATABASES ⚠️

-- Step 1: Alter the story column to increase character limit
ALTER TABLE users
ALTER COLUMN story TYPE VARCHAR(256);

-- Step 2: Verify the column was updated
SELECT column_name, data_type, character_maximum_length, column_default
FROM information_schema.columns
WHERE table_name = 'users'
AND column_name = 'story';

-- Expected output:
-- column_name | data_type         | character_maximum_length | column_default
-- story       | character varying | 256                      | ''::character varying
