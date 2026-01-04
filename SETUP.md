# SuperStaffer Setup Guide

This guide walks you through setting up Clerk authentication, Netlify DB (Neon Postgres), and Cloudinary for the SuperStaffer app.

## Prerequisites

- Node.js and npm installed
- Netlify account
- Clerk account
- Cloudinary account

---

## 1. Install Dependencies

All dependencies should already be installed. If not, run:

```bash
npm install @clerk/clerk-react@latest @neondatabase/serverless @netlify/neon cloudinary
```

---

## 2. Clerk Authentication Setup

### Get Your Clerk Publishable Key

1. Go to [Clerk Dashboard](https://dashboard.clerk.com/)
2. Select your application (or create a new one)
3. Go to **API Keys** in the left sidebar
4. Copy your **Publishable Key** (starts with `pk_test_` or `pk_live_`)

### Configure Environment Variables

Your `.env` file should already have:

```bash
VITE_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key_here
```

✅ **Status**: Clerk is already configured in the code. Just ensure your key is set correctly.

---

## 3. Netlify DB (Neon Postgres) Setup

### Initialize Netlify DB

You've already run this command:

```bash
npx netlify db init
```

This creates a Neon Postgres database connected to your Netlify site.

### Create Database Tables Using Neon Console

Since Netlify DB uses Neon Postgres, you'll access the SQL editor through the Neon console:

#### Option 1: Via Netlify Dashboard (Recommended)

1. Go to your Netlify site dashboard
2. Click **Integrations** in the left sidebar
3. Find the **Neon** integration and click **Manage**
4. Click **Open Neon Console** or **SQL Editor**
5. Paste the following SQL schema and run it:

```sql
CREATE TABLE IF NOT EXISTS users (
  clerk_id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  selfie_url TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

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

CREATE INDEX IF NOT EXISTS idx_cards_clerk_id ON cards(clerk_id);
CREATE INDEX IF NOT EXISTS idx_cards_timestamp ON cards(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_cards_public ON cards(is_public) WHERE is_public = TRUE;
```

#### Option 2: Direct Neon Console Access

1. Go to [console.neon.tech](https://console.neon.tech)
2. Find your project (linked to your Netlify site)
3. Click **SQL Editor** in the left sidebar
4. Paste and run the SQL schema above

#### Option 3: Using DATABASE_URL Locally

If you have `psql` installed:

```bash
# Get the database URL from Netlify
npx netlify env:get DATABASE_URL

# Then connect with psql
psql "your_database_url_here"

# Or create a one-liner:
psql "$(npx netlify env:get DATABASE_URL)" -c "CREATE TABLE..."
```

### Verify Database Setup

Run this in the Neon SQL Editor to verify tables were created:

```sql
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public';
```

You should see `users` and `cards` tables listed.

Or if using `psql`:

```bash
psql "$(npx netlify env:get DATABASE_URL)" -c "\dt"
```

### Get Database Connection String

The `DATABASE_URL` environment variable is automatically set by Netlify in your serverless functions. You don't need to manually configure it.

To view it locally:

```bash
npx netlify env:get DATABASE_URL
```

---

## 4. Cloudinary Setup

### Get Cloudinary Credentials

1. Go to [Cloudinary Console](https://console.cloudinary.com/)
2. From your dashboard, find:
   - **Cloud Name**
   - **API Key**
   - **API Secret**

### Configure Environment Variables

Add these to your `.env` file (for local development):

```bash
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

### Set Netlify Environment Variables

Set these in Netlify for production:

```bash
npx netlify env:set CLOUDINARY_CLOUD_NAME "your_cloud_name"
npx netlify env:set CLOUDINARY_API_KEY "your_api_key"
npx netlify env:set CLOUDINARY_API_SECRET "your_api_secret"
```

Or via Netlify Dashboard:
1. Go to **Site Settings** → **Environment Variables**
2. Add the three Cloudinary variables

---

## 5. Existing Environment Variables

Ensure you also have the Gemini API key configured:

```bash
# In .env (LOCAL ONLY - never commit)
GEMINI_API_KEY=your_gemini_api_key_here
```

Set in Netlify:

```bash
npx netlify env:set GEMINI_API_KEY "your_gemini_api_key"
```

---

## 6. Run the App Locally

Start the development server with Netlify Functions:

```bash
npm run dev:net
```

The app will run at **http://localhost:8888**

---

## 7. Deploy to Netlify

### Link to Netlify Site (if not already done)

```bash
npx netlify link
```

### Deploy

```bash
npx netlify deploy --prod
```

---

## 8. Testing the Setup

### Test Authentication Flow

1. Visit the app homepage
2. Click **SIGN UP** to create a Clerk account
3. Complete onboarding (name + selfie)
4. Selfie should upload to Cloudinary
5. User profile should save to Netlify DB

### Test Card Creation

1. From dashboard, click **CREATE NEW CARD**
2. Select theme and alignment
3. Generate card (uses Gemini API via Netlify Function)
4. Card should save to database with `is_public = false` by default

### Test Public/Private Toggle

1. On dashboard, click the eye icon on a card
2. Toggle between public (blue eye) and private (grey eye with slash)
3. Changes should persist to database

### Verify Database

Check database contents:

```bash
npx netlify db:query "SELECT * FROM users;"
npx netlify db:query "SELECT id, user_name, theme, alignment, is_public FROM cards;"
```

---

## 9. Troubleshooting

### Database Connection Issues

If functions can't connect to the database:

```bash
# Verify DATABASE_URL is set in Netlify
npx netlify env:list
```

### Cloudinary Upload Fails

Check that all three environment variables are set:

```bash
npx netlify env:get CLOUDINARY_CLOUD_NAME
npx netlify env:get CLOUDINARY_API_KEY
npx netlify env:get CLOUDINARY_API_SECRET
```

### Clerk Authentication Issues

- Ensure `VITE_CLERK_PUBLISHABLE_KEY` starts with `pk_test_` or `pk_live_`
- Check that ClerkProvider is wrapped around the app in `index.tsx`
- Visit Clerk Dashboard → **JWT Templates** to verify settings

### Local vs Production

- **Local development**: Uses `.env` file + Netlify Dev proxy
- **Production**: Uses Netlify environment variables only
- Never commit `.env` files to git

---

## 10. Important Security Notes

✅ **DO:**
- Use `VITE_` prefix for client-safe variables (like Clerk publishable key)
- Keep API secrets in `.env` (local) and Netlify environment (production)
- Use Netlify Functions for sensitive operations (database, Cloudinary, Gemini)

❌ **DON'T:**
- Never use `VITE_` prefix for secrets (Gemini, Cloudinary, DATABASE_URL)
- Never commit `.env` files to version control
- Never expose API keys in client-side code

---

## Summary of Environment Variables

### Client-Side (VITE_ prefix)
```bash
VITE_CLERK_PUBLISHABLE_KEY=pk_test_...
```

### Server-Side (Netlify Functions only - NO VITE_ prefix)
```bash
# Automatically set by Netlify DB
DATABASE_URL=postgresql://...

# Manually configured
GEMINI_API_KEY=AIza...
CLOUDINARY_CLOUD_NAME=your_cloud
CLOUDINARY_API_KEY=123456789
CLOUDINARY_API_SECRET=abc123xyz
```

---

## Next Steps

1. ✅ Run database schema creation command
2. ✅ Configure Cloudinary environment variables
3. ✅ Test the app locally with `npm run dev:net`
4. ✅ Deploy to Netlify with `npx netlify deploy --prod`
5. ✅ Test end-to-end: sign up → onboarding → card creation → public/private toggle

---

## Support

- **Clerk Docs**: https://clerk.com/docs
- **Netlify DB Docs**: https://docs.netlify.com/databases/overview/
- **Neon Postgres Docs**: https://neon.tech/docs
- **Cloudinary Docs**: https://cloudinary.com/documentation

For issues, check the browser console and Netlify function logs:

```bash
npx netlify functions:log
```
