-- SuperStaffer Database Schema
-- Run this in the Neon SQL Editor (via Netlify Dashboard → Integrations → Neon)

-- Users table: stores Clerk user profiles
CREATE TABLE IF NOT EXISTS users (
  clerk_id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  selfie_url TEXT NOT NULL,
  strengths TEXT[] DEFAULT '{}',
  story VARCHAR(144) DEFAULT '',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Cards table: stores generated trading cards
CREATE TABLE IF NOT EXISTS cards (
  id TEXT PRIMARY KEY,
  clerk_id TEXT NOT NULL REFERENCES users(clerk_id) ON DELETE CASCADE,
  timestamp BIGINT NOT NULL,
  image_url TEXT NOT NULL,
  theme TEXT NOT NULL,
  alignment TEXT NOT NULL CHECK (alignment IN ('Hero', 'Villain')),
  user_name TEXT NOT NULL,
  is_public BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_cards_clerk_id ON cards(clerk_id);
CREATE INDEX IF NOT EXISTS idx_cards_timestamp ON cards(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_cards_public ON cards(is_public) WHERE is_public = TRUE;

-- Verify tables were created
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public';
