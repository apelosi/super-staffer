# Super Powers (Strengths) Feature Implementation

This document describes the implementation of the Super Powers feature, which allows users to specify their character strengths based on the Wheel of Character Strengths framework.

## Overview

The Super Powers feature enables users to:
1. Select up to 5 character strengths during onboarding (step 3)
2. View their strengths on their dashboard
3. Edit their strengths at any time from the dashboard
4. See their strengths displayed on the back of their trading cards

## Database Changes

### Schema Update

A new `strengths` column has been added to the `users` table:

```sql
ALTER TABLE users
ADD COLUMN IF NOT EXISTS strengths TEXT[] DEFAULT '{}';
```

### Migration Instructions

**For Production Database:**

1. Log into your Netlify dashboard
2. Navigate to your site → Integrations → Neon
3. Click "Open Neon Dashboard"
4. Select your **production** branch
5. Go to the SQL Editor
6. Run the migration script from `migrations/add_strengths_column.sql`:

```sql
ALTER TABLE users
ADD COLUMN IF NOT EXISTS strengths TEXT[] DEFAULT '{}';
```

7. Verify the column was added:

```sql
SELECT column_name, data_type, column_default
FROM information_schema.columns
WHERE table_name = 'users'
AND column_name = 'strengths';
```

**Note:** The development database schema (`schema.sql`) has already been updated. This migration only needs to be run on the production database.

## Code Changes

### 1. Type Definitions (`types.ts`)

Added `strengths` field to the `User` interface:

```typescript
export interface User {
  clerkId: string;
  name: string;
  selfie: string;
  strengths?: string[];  // NEW: Array of up to 5 character strengths
}
```

### 2. Database Function (`netlify/functions/db-save-user.mts`)

Updated to handle the `strengths` field:

```typescript
const { clerkId, name, selfieUrl, strengths } = body;

await sql`
  INSERT INTO users (clerk_id, name, selfie_url, strengths, updated_at)
  VALUES (${clerkId}, ${name}, ${selfieUrl}, ${strengths || []}, NOW())
  ON CONFLICT (clerk_id)
  DO UPDATE SET
    name = ${name},
    selfie_url = ${selfieUrl},
    strengths = ${strengths || []},
    updated_at = NOW()
`;
```

### 3. New Component (`components/SuperPowersInput.tsx`)

Created a reusable component for managing strengths with:
- Tag/pill input interface
- Add/remove strengths with Enter key or click
- Visual feedback with animations
- Wheel of Character Strengths reference with 6 categories:
  - **TRANSCENDENCE**: Appreciation of Beauty, Gratitude, Hope, Humor, Spirituality
  - **WISDOM**: Creativity, Curiosity, Judgment, Love of Learning, Perspective
  - **COURAGE**: Bravery, Perseverance, Honesty, Zest
  - **HUMANITY**: Love, Kindness, Social Intelligence
  - **JUSTICE**: Teamwork, Fairness, Leadership
  - **TEMPERANCE**: Forgiveness, Humility, Prudence, Self-Regulation

### 4. Onboarding Flow (`components/Onboarding.tsx`)

Added step 3 for Super Powers selection:
- Appears after selfie confirmation
- Users can specify 0-5 strengths
- Navigation: Back to Selfie, Skip, or Confirm
- Progress bar updated to show 3 steps (33%, 66%, 100%)

### 5. Dashboard (`components/Dashboard.tsx`)

Added "MY SUPER POWERS" section:
- Displays current strengths as gradient pills
- Edit button to modify strengths
- Save/Cancel buttons when editing
- Uses the same SuperPowersInput component

### 6. Card Back (`components/SingleCardView.tsx`)

Updated the card back to display strengths:
- Shows list of user's strengths instead of "Coming soon..."
- Each strength displayed with a Sparkles icon
- Falls back to "No super powers specified" if none set

## User Flow

### New User Onboarding

1. **Step 1**: Enter name
2. **Step 2**: Capture selfie
3. **Step 3 (NEW)**: Select super powers (optional)
   - User can type custom strengths or click from the Wheel of Character Strengths
   - Can add up to 5 strengths
   - Can skip this step
4. Proceed to Card Creator (Hero/Villain selection)

### Existing User

1. Dashboard shows "MY SUPER POWERS" section
2. Click "EDIT" to modify strengths
3. Changes are saved to the database immediately
4. Updated strengths appear on all future card backs

## Technical Details

### State Management

- Onboarding: `strengths` state managed within component, passed to user object on completion
- Dashboard: Local state for editing, synced with user object via `onUpdateUser` callback
- Card Back: Receives user object as prop to display current strengths

### Data Flow

```
Onboarding (Step 3)
  → User object with strengths
    → storage.saveUser()
      → /.netlify/functions/db-save-user
        → PostgreSQL users table

Dashboard → Edit Strengths
  → onUpdateUser()
    → storage.saveUser()
      → /.netlify/functions/db-save-user
        → PostgreSQL users table

SingleCardView
  ← User object with strengths
    ← Displayed on card back
```

### Design Decisions

1. **Optional Field**: Strengths are optional to allow users to skip during onboarding
2. **Maximum 5**: Limited to 5 strengths to fit nicely on the card back and encourage thoughtful selection
3. **Character Strengths Framework**: Based on the established psychological framework for authenticity and guidance
4. **Reusable Component**: SuperPowersInput used in both onboarding and dashboard for consistency
5. **Database Array Type**: Using PostgreSQL TEXT[] for flexible storage and querying

## Testing Checklist

- [ ] Run the production database migration
- [ ] Test new user onboarding flow (3 steps)
- [ ] Test skipping strengths during onboarding
- [ ] Test adding custom strengths
- [ ] Test selecting from Wheel of Character Strengths
- [ ] Test editing strengths from dashboard
- [ ] Test canceling strength edits
- [ ] Verify strengths appear on card back
- [ ] Verify strengths persist across sessions
- [ ] Test with 0, 1, and 5 strengths

## Future Enhancements

Potential improvements for future iterations:

1. Allow users to go back from Card Creator to modify strengths
2. Add strength suggestions based on user's theme/alignment choices
3. Display strength categories on card back with colors
4. Allow reordering of strengths
5. Add strength descriptions/tooltips
6. Track most popular strengths across all users
7. Suggest complementary strengths

## Notes

- Renamed from "superPowers" to "strengths" throughout the codebase for clarity and consistency
- The term "Super Powers" is still used in the UI for user-facing elements (marketing/branding)
- The Wheel of Character Strengths provides 24 total strengths across 6 categories
- Strengths are stored as plain text strings for maximum flexibility
