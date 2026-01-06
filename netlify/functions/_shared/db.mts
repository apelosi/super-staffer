import { neon } from '@neondatabase/serverless';

/**
 * Get database connection with fallback for local development
 */
export function getDb() {
  const databaseUrl = process.env.NETLIFY_DATABASE_URL || process.env.DATABASE_URL;

  if (!databaseUrl) {
    throw new Error('Database URL not configured. Set NETLIFY_DATABASE_URL or DATABASE_URL environment variable.');
  }

  return neon(databaseUrl);
}
