# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Instructions for Claude Code

**IMPORTANT**: As we work together, whenever there are:
- New requirements or features added
- Changes to existing requirements or implementations
- Architecture decisions made
- Bugs fixed or issues resolved
- Dependencies or configuration updated

You MUST automatically update this CLAUDE.md file to reflect those changes. Do NOT ask for permission to update this file - just make the updates and inform me what was changed.

## Project Overview

SuperStaffer is a React-based web app that creates superhero trading cards from user selfies using Google's Gemini AI. Built for Vibez Ventures as a team-building experience at company outings, it allows colleagues to transform themselves into superheroes or villains with personalized trading cards.

**Key Tech Stack:**
- React 19 + TypeScript
- Vite (build tool)
- Tailwind CSS v4 (via @tailwindcss/vite)
- Framer Motion (animations)
- Google Gemini AI (via Netlify Functions) for image generation
- Clerk (authentication) ✅ FULLY INTEGRATED
- Netlify (hosting & serverless functions)
- Neon Postgres (cloud database via Netlify integration) ✅ FULLY INTEGRATED
- IndexedDB (client-side cache for performance optimization)

## Product Requirements

### Core Features (All Implemented)

The app enables users to:
1. **Create Account**: Sign up with Clerk, provide name and selfie (via camera, photo gallery, or file upload)
2. **Generate Cards**: Choose from 12 superhero themes and Hero/Villain alignment
3. **Manage Cards**: Create unlimited cards, toggle privacy (public/private), delete cards, update profile
4. **Download Cards**: Save generated cards (front and back) as PNG files to local filesystem/gallery
5. **Share Cards**: Copy shareable link for public cards, share URL directly with others
6. **Save Collections**: Add other users' public cards to your personal collection
7. **Browse Cards**: View "My Cards" (cards you created) and "Saved Cards" (cards you collected from others)

### Trading Card Specifications

Generated cards must match the style of **Marvel Universe Series III (1992)** trading cards with:
- Full-body superhero in dynamic action pose with face clearly visible
- Rectangular "window" showing Marina Bay Sands (Singapore) behind the character's torso
- **White border with rounded corners** (hardcoded for all cards) - image bleeds to edges with border drawn on top
- **Front Card**: Generated AI image with overlaid text and logo
- **Back Card**: Custom-designed card back with user stats, character strengths, and origin story
- User's name (top left) - font size matching "SUPER STAFFERS" text (36px italic)
- Superhero theme name (bottom left)
- "SUPER STAFFERS" text (top right)
- **SuperStaffer logo** (`/logos/ss-logo-rich-64x64.png`) in bottom right corner at 50px size
- 1990s comic book aesthetic with vibrant colors and realistic textures

### 12 Superhero Themes

As defined in [constants.ts](constants.ts):
1. Cyberpunk Neon
2. Ancient Mystic
3. Space Opera
4. Steampunk Gear
5. Ninja Shadow
6. Elemental Nature
7. Noir Detective
8. Galactic Guardian
9. Medieval Knight
10. Urban Vigilante
11. Mutant X
12. Tech Mecha

### Responsive Design

Three breakpoints required:
- Mobile (default)
- Tablet
- Desktop

### Homepage Design

Colorful parallax landing page featuring imagery representing all 12 superhero themes with vertical scroll animation.

## Development Commands

```bash
# Install dependencies
npm install

# Run development server with Netlify Functions (RECOMMENDED)
# Runs at http://localhost:8888
npm run dev:net

# Run Vite only (without Netlify Functions)
# Runs at http://localhost:3001
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

**Important:**
- **Use `npm run dev:net`** for local development to test Netlify Functions (like `generate-card`)
- The Netlify Dev server runs at **http://localhost:8888** and proxies to Vite
- `npm run dev` runs Vite standalone at port 3001 but **won't have access to Netlify Functions**
- Always use `dev:net` when working with AI card generation or database operations

## Environment Setup

Required environment variables in `.env` or `.env.local`:

```bash
# Clerk Authentication (configured in local .env and Netlify)
VITE_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key

# Gemini API (SERVER-SIDE ONLY - used in Netlify Functions)
# ⚠️ CRITICAL: NO VITE_ PREFIX - must not be exposed to client
GEMINI_API_KEY=your_gemini_api_key

# Neon Postgres Database (AUTO-CONFIGURED by Netlify)
# DATABASE_URL and NETLIFY_DATABASE_URL are set automatically by Netlify
# No manual configuration needed for local development
```

**CRITICAL Security Notes:**
- **VITE_ prefix**: Only use for client-safe variables (like `VITE_CLERK_PUBLISHABLE_KEY`)
- **NO VITE_ prefix**: Required for secrets like `GEMINI_API_KEY` to keep them server-side only
- ⚠️ **NEVER use `VITE_GEMINI_API_KEY`** - this exposes the secret API key to the client bundle
- Gemini API key must ONLY exist in Netlify Functions environment (server-side)
- Clerk publishable key is safe for client-side (designed to be public)
- Ensure `.gitignore` excludes `.env*` files

## Architecture

### Application Flow

The app uses React Router with the following routes:

1. **/** → ParallaxHero (landing page)
2. **/onboarding** → Onboarding (new user 4-step profile creation: name, selfie, super powers, origin story)
3. **/creator** → CardCreator (generate new card with theme selection)
4. **/cards/my** → Dashboard (Created tab - cards you created)
5. **/cards/saved** → Dashboard (Added tab - cards you collected from others)
6. **/stats** → Dashboard (Stats tab - view your SUPER STAFFER statistics)
7. **/personalize** → Dashboard (Me tab - update profile: name, selfie, super powers, origin story)
8. **/card/:id** → PublicCardView (view any card - public card or your own card)

**User Authentication Flow:**
- Clerk handles all authentication (sign-up, sign-in, sign-out)
- New users are redirected to `/onboarding` to create profile (name, selfie, optional super powers, optional origin story)
- After onboarding completes, users are taken to Dashboard (`/cards/my`) where they can create their first card
- All routes except `/` and `/card/:id` require authentication

**Onboarding Flow Details:**
1. **Step 1: Name** - User enters their real name or alias (required)
2. **Step 2: Selfie** - Camera capture for profile photo (required)
3. **Step 3: Super Powers** - User can add up to 5 strengths (optional, can skip)
4. **Step 4: Origin Story** - User writes a 256-character origin story (optional, can skip)
5. **Completion** - User profile saved to database, navigates to `/cards/my` (Dashboard)
6. User clicks "CREATE NEW CARD" button to start their first card generation

**Card Viewing Logic (Important):**
- `/card/:id` is the ONLY route for viewing individual cards
- Back button destination is determined on page load based on:
  - **Owners** → back to `/cards/my`
  - **Non-owners with card saved** → back to `/cards/saved`
  - **Non-owners without card saved** → back to `/` (homepage)
- Back button does NOT update during session (set once on mount)
- This ensures consistent behavior when adding/removing from collection

**Stats Tab Features:**
- **Your Cards Stats**: Total created, active cards, public cards, cards added by others, total adds, most popular card
- **Your Collection Stats**: Total saved cards, most popular saved card
- Clickable card links navigate to card detail view
- Visual presentation with icons, color-coded stats, and gradient boxes
- Encouragement message with user's name

### Key Components

- **ParallaxHero** ([components/ParallaxHero.tsx](components/ParallaxHero.tsx)): Animated landing page with parallax effect
- **Onboarding** ([components/Onboarding.tsx](components/Onboarding.tsx)): 4-step onboarding flow (name, selfie, super powers, origin story) with optional fields
- **CameraCapture** ([components/CameraCapture.tsx](components/CameraCapture.tsx)): Camera access and photo capture, outputs base64
- **CardCreator** ([components/CardCreator.tsx](components/CardCreator.tsx)): Theme/alignment selection + Gemini API integration
- **Dashboard** ([components/Dashboard.tsx](components/Dashboard.tsx)): Tabbed interface with 4 tabs (Created, Added, Stats, Me) with icons, compact layout optimized for mobile
- **TradingCard** ([components/TradingCard.tsx](components/TradingCard.tsx)): Displays individual card with theme styling
- **SingleCardView** ([components/SingleCardView.tsx](components/SingleCardView.tsx)): Full card detail view with flip animation, download, and action buttons

### Data Models

See [types.ts](types.ts) for core types:
- `User`: name + selfie (base64 string) + clerkId
- `CardData`: id, timestamp, imageUrl, theme, alignment, userName, ownerClerkId, public, active, saveCount
- `ThemeName`: 12 predefined themes (string union)
- `Alignment`: 'Hero' | 'Villain'

Themes are defined in [constants.ts](constants.ts) with icons, colors, and descriptions.

### Database Architecture (Neon Postgres)

**Tables:**
1. **users** - User profiles (Clerk ID, name, selfie base64)
2. **cards** - Trading cards (owner, image URL, metadata, public/private flag, active flag for soft deletion)
3. **saved_cards** - Junction table for users saving other users' cards (user_id, card_id, saved_at)

**Key Design Decisions:**
- Soft deletion: Cards have `active` flag (false = deleted, not visible)
- Privacy: Cards have `public` flag (true = shareable, false = private/owner-only)
- Save count: Denormalized `save_count` on cards table for performance
- IndexedDB cache: Client-side cache for frequently accessed data (60-300x faster for repeat views)

**Storage Service** ([services/storage.ts](services/storage.ts)):
- Handles all database operations via Netlify Functions
- Implements dual-layer caching (IndexedDB + stale-while-revalidate)
- Cache-first for owner viewing their own cards (fast)
- Fresh-fetch for non-owners viewing public cards (ensures privacy/visibility state is current)

### AI Integration

**Gemini Card Generation** ([netlify/functions/generate-card.mts](netlify/functions/generate-card.mts)):
- Client calls `/.netlify/functions/generate-card` endpoint (POST)
- Netlify Function processes request server-side using Gemini API
- Uses `gemini-2.5-flash-image` model
- Takes user selfie (base64), theme, and alignment as JSON payload
- Returns generated trading card image URL stored in Cloudinary

**Critical Prompt Engineering** (Lines 33-85):
The Gemini prompt was carefully engineered to ensure consistent comic book style while preserving facial likeness:

1. **ARTISTIC STYLE section appears FIRST** - Establishes comic book art style upfront (NOT photorealistic)
   - Removed "hyper-realistic" language that caused photorealistic outputs
   - Explicitly states "illustrated comic book art, NOT a photograph"
   - Specifies bold ink outlines, cell-shading, and vibrant colors
   - References artist styles: "Alex Ross meets Jim Lee"
2. **FACIAL LIKENESS REQUIREMENTS** section (11 specific instructions)
   - Preserves exact facial features while rendering in comic style
   - Explicit conflict resolution: "prioritize likeness over theme"
   - Constrains poses to ensure face visibility (forward or 3/4 angle)
3. **Marina Bay Sands backdrop** must be illustrated/stylized (NOT a photograph)
   - Rectangular "window" behind character showing MBS
   - Prevents photorealistic building from appearing in foreground
4. **NO borders or frames** on outer image (canvas edge-to-edge)
5. **FINAL REMINDER** reinforces: comic book art style, facial likeness, stylized MBS

**Why This Matters:**
- Previous "hyper-realistic" + "realistic facial features" language caused inconsistent outputs (sometimes photorealistic)
- Root cause: Mixed signals between "realistic" and "comic book style"
- Solution: Removed all "realistic" language, strengthened comic book style requirements FIRST, then facial likeness
- Result: Consistent 1990s comic book illustrated style with accurate facial preservation

### State Management

No global state library. App state managed in [App.tsx](App.tsx):
- Clerk auth hooks (`useAuth`, `useUser`) for authentication state
- Local state in route components (PublicCardView, Dashboard, CardCreator, etc.)
- Storage service handles persistence via Netlify Functions + Neon Postgres
- IndexedDB cache managed automatically by storage service

### Styling Approach

- Tailwind CSS v4 with utility-first classes
- Framer Motion for animations (hero parallax, card reveals, flip animations)
- Gradient backgrounds from theme definitions ([constants.ts](constants.ts))
- Responsive design with mobile-first breakpoints
- Custom loading screens with theme-based styling

## Important Patterns & UX Standards

### Button Loading States (Database-First Pattern)

**CRITICAL**: All buttons that interact with the database follow this pattern:

1. **Before Database Call**: Button shows loading state (50% opacity + spinner icon)
2. **After Database Confirmation**: Button updates to new state
3. **On Success**: NO popup/toast (button state change is the confirmation)
4. **On Error**: Show error toast/popup and revert button state

**Examples:**
- **Privacy Toggle**: Shows muted color (50% opacity) during operation, then full brightness when confirmed
- **Add to Collection**: Shows spinner, keeps "ADD TO COLLECTION" text, then switches to "REMOVE FROM COLLECTION"
- **Remove from Collection**: Shows confirmation dialog → both buttons gray out (50% opacity) during operation → switches back to "ADD TO COLLECTION"
- **Delete Card**: Shows confirmation dialog → both buttons gray out (50% opacity) during operation → navigates away on success

**Button Text During Loading:**
- Text STAYS THE SAME during loading
- Only icon changes (e.g., Plus → Spinner, Trash → Spinner)
- Exception: Confirmation buttons can say "DELETING..." or "REMOVING..." if needed, but prefer keeping text consistent

### Confirmation Dialogs

**Delete Card:**
- Initial button: White with red border/text outline style
- Click → Shows red confirmation box with "DELETE THIS CARD FOREVER?"
- Two buttons: "CANCEL" (white) and "DELETE" (red)
- After clicking DELETE → both buttons gray out (50% opacity) with spinner on DELETE button
- NO success popup

**Remove from Collection:**
- Initial button: White with red border/text outline style (matches Delete Card style)
- Click → Shows red confirmation box with "REMOVE CARD FROM COLLECTION?"
- Two buttons: "CANCEL" (white) and "REMOVE" (red)
- After clicking REMOVE → both buttons gray out (50% opacity) with spinner on REMOVE button
- NO success popup
- Card view stays open (does NOT navigate away)

### Race Condition Fix (Card Creation)

**Problem**: After creating a card, sometimes got "CARD NOT FOUND" error
**Root Cause**: IndexedDB transaction timing - navigation happened before transaction committed
**Solution**: 50ms delay between `saveCard` and `navigate` in [App.tsx](App.tsx:517-519)
```typescript
// Small delay to ensure IndexedDB transaction commits before navigation
await new Promise(resolve => setTimeout(resolve, 50));
```

### Download Card Behavior

**Front Card Download:**
- Renders generated AI image edge-to-edge (no white border)
- Filename: `SuperStaffer-{userName}-{theme}-FRONT.png`

**Back Card Download:**
- Renders custom card back with stats and origin story
- White rounded border drawn on canvas
- Filename: `SuperStaffer-{userName}-{theme}-BACK.png`

**Important**: Front card download does NOT add white border (removed in previous iteration because AI image should bleed to edges, border is for display only)

## Known Constraints & Outstanding Issues

### Current Limitations

1. **Camera permission required** for onboarding (no fallback to file upload during initial profile creation)
2. **Gemini API rate limits** apply to card generation
3. **Base64 selfie storage** - Selfies stored as base64 strings in database (large payload, but necessary for AI API)
4. **Single Gemini model** - Only using `gemini-2.5-flash-image` (could test other models for better quality)
5. **iCloud Drive development issues** - Project stored in iCloud Drive can cause:
   - `npm install` failures (esbuild platform mismatch errors)
   - `.netlify/plugins` directory corruption (ENOTEMPTY errors)
   - **Solution**: Run `rm -rf node_modules package-lock.json && npm install` to reinstall with correct platform binaries
   - **Better solution**: Move project to local directory (e.g., `~/Development/`) instead of iCloud Drive

### Outstanding Issues to Address

**None currently identified** - All major bugs have been resolved:
- ✅ Privacy toggle UX (no popup, loading feedback)
- ✅ Download card issues (border removal, filename consistency)
- ✅ Card generation likeness (strengthened prompt)
- ✅ Race condition after card creation (50ms delay)
- ✅ Collection button UX (consistent loading states, no popups)
- ✅ Routing refactor (consolidated /saved/:id into /card/:id)
- ✅ VIBEZ_LOGO_SVG removed (now using PNG logo via img tag)
- ✅ Database connection refactored (centralized getDb() with fallback support)
- ✅ Dashboard tabs mobile crowding (responsive padding/text size, equal width distribution)
- ✅ Onboarding flow clarified (goes to Dashboard, not CardCreator)
- ✅ Inconsistent card generation style (removed "hyper-realistic" language, strengthened comic book style requirements)
- ✅ Dashboard welcome message updated (shows card counts consistently)
- ✅ Dashboard mobile optimization (reduced header height, compact layout, single-word tab labels with icons)
- ✅ Stats tab added (displays user statistics with visual presentation)
- ✅ Tab layout optimized (icons above text in vertical layout to reduce horizontal crowding)

### Future Enhancements (Optional)

1. **Multi-stage generation**: Generate face first with strict likeness, then add costume/background
2. **Model comparison**: Test Gemini Pro vs. Flash for better facial accuracy
3. **UUID-based card IDs**: Additional security layer (currently using timestamps)
4. **Card analytics**: Track views, shares, collection adds per card
5. **Batch card generation**: Generate multiple cards with same selfie + different themes
6. **Social features**: Comments, likes, card battles, leaderboards

## Design Philosophy

Per the original brief, this is a **team-building experience** for company outings. The app prioritizes:
- Fun, colorful, engaging UI
- Quick onboarding flow (< 2 minutes to first card)
- Instant gratification (card generation in ~20 seconds)
- Collectibility (unlimited card creation + save others' cards)
- Shareability (public links + PNG download)
- Privacy control (public/private toggle per card)

## Public Folder Organization

**Structure:**
```
/public
├── favicon.svg, favicon.ico, favicon-96x96.png (favicons - must stay at root)
├── apple-touch-icon.png, site.webmanifest (PWA files - must stay at root)
├── web-app-manifest-192x192.png, web-app-manifest-512x512.png (PWA icons - must stay at root)
├── /logos (all SuperStaffer logo variants)
│   ├── ss-logo-rich-32x32.png (used in Footer)
│   ├── ss-logo-rich-64x64.png (used in Header, SingleCardView card backs)
│   ├── ss-logo-rich-128x128.png (used in LoadingScreen)
│   ├── ss-logo-rich-256x256.png (used in ParallaxHero)
│   ├── ss-logo-rich-512x512.png, ss-logo-rich-1024x1024.png (unused, kept for future)
│   └── ss-logo-flat-*.png (6 flat variants, unused, kept for future)
└── /characters (all theme character images for parallax hero)
    ├── ss-cyberpunk-hero.png, ss-medieval-hero.png, ss-mutant-hero.png
    ├── ss-ninja-hero.png, ss-noir-hero.png, ss-space-hero.png
    ├── ss-elemental-villain.png, ss-galactic-villain.png, ss-mecha-villain.png
    └── ss-mystic-villain.png, ss-steampunk-villain.png, ss-urban-villain.png
```

**Important Notes:**
- Favicon files MUST remain at `/public` root level (referenced by index.html and site.webmanifest)
- Logo files are in `/public/logos/` subfolder (referenced as `/logos/ss-logo-*.png` in components)
- Character images are in `/public/characters/` subfolder (referenced dynamically as `/characters/ss-${theme.id}-${alignment}.png`)
- All image paths are absolute from public root (e.g., `/logos/ss-logo-rich-64x64.png`, NOT `../public/logos/...`)

## Critical Files Reference

### Core Application
- [App.tsx](App.tsx) - Main app component with routing and route components (PublicCardView, Dashboard, etc.)
- [types.ts](types.ts) - TypeScript type definitions
- [constants.ts](constants.ts) - Theme definitions and app constants

### Components
- [components/SingleCardView.tsx](components/SingleCardView.tsx) - Card detail view with all action buttons
- [components/Dashboard.tsx](components/Dashboard.tsx) - Tabbed interface for My Cards / Saved Cards
- [components/CardCreator.tsx](components/CardCreator.tsx) - Card generation interface
- [components/TradingCard.tsx](components/TradingCard.tsx) - Individual card display component
- [components/CameraCapture.tsx](components/CameraCapture.tsx) - Camera access and photo capture
- [components/Onboarding.tsx](components/Onboarding.tsx) - New user profile creation

### Services
- [services/storage.ts](services/storage.ts) - Database operations with IndexedDB caching
- [services/gemini.ts](services/gemini.ts) - Gemini API client (calls Netlify Function)

### Netlify Functions
- [netlify/functions/generate-card.mts](netlify/functions/generate-card.mts) - Gemini AI card generation (contains critical prompt)
- [netlify/functions/db-*.mts](netlify/functions/) - Database CRUD operations (users, cards, saved_cards)
- [netlify/functions/_shared/db.mts](netlify/functions/_shared/db.mts) - Shared database connection helper with fallback support

**Database Connection Pattern:**
All database functions use a shared `getDb()` helper that:
- Checks both `NETLIFY_DATABASE_URL` and `DATABASE_URL` environment variables
- Provides fallback support for different deployment environments (production uses NETLIFY_DATABASE_URL, local dev can use either)
- Centralizes error handling for missing database configuration
- Makes maintenance easier (single source of truth for connection logic)

## Architecture Decisions (Why Things Are Built This Way)

### Why Single `/card/:id` Route (Not `/saved/:id` + `/card/:id`)

**Previous**: Two separate routes for viewing cards
- `/card/:id` - Public cards + own cards
- `/saved/:id` - Cards in your saved collection

**Problem**: Removing from collection navigated away from card (inconsistent UX)

**Current**: Single `/card/:id` route handles all card viewing
- Back button determined by checking collection status on mount
- Add/Remove from collection never navigates away
- Simpler codebase (~106 lines deleted)
- Consistent behavior regardless of how user arrived at card

### Why Database-First Updates (Not Optimistic)

**Optimistic Updates**: Update UI immediately, revert on error
**Database-First**: Update UI only after database confirms

**Decision**: Database-first for all state-changing operations
- Reason: Prevents UI lying to user (e.g., showing "Private" when save failed)
- Trade-off: Slightly slower perceived performance
- Mitigation: Visual loading states (50% opacity, spinners) to show progress
- Result: More reliable UX, no confusing revert animations

### Why IndexedDB Cache + Neon Postgres (Not Just One)

**IndexedDB**: Client-side cache in browser
**Neon Postgres**: Server-side database

**Why Both?**
- Owner viewing their own cards: 60-300x faster with cache (no network roundtrip)
- Non-owner viewing public cards: Must fetch fresh to validate privacy/visibility
- Stale-while-revalidate: Show cached data immediately, update in background
- Result: Fast perceived performance + guaranteed data accuracy

### Why Base64 Selfies (Not File Upload to Storage)

**Decision**: Store selfies as base64 strings in database

**Reasons:**
1. Gemini API requires base64 input (no URLs)
2. Simplifies architecture (no separate file storage service)
3. Selfies are small (~50KB compressed)
4. Rarely changed (only during profile creation)

**Trade-offs:**
- Large database payloads
- Cannot use CDN for selfie delivery
- Acceptable because selfies are only loaded on card back + onboarding

### Why Soft Deletion (Not Hard Delete)

**Soft Deletion**: Set `active = false` instead of deleting row
**Hard Deletion**: Remove row from database entirely

**Decision**: Soft deletion for cards

**Reasons:**
1. Preserve referential integrity (saved_cards table still valid)
2. Enable "undelete" feature in future
3. Maintain save count history
4. Easier to debug issues ("why did this card disappear?")

**Implementation**:
- `active = false` → Card not visible in any views
- Cleanup job can hard-delete after 30 days (not yet implemented)

## Testing Checklist (For Next Session)

When making changes, test these critical flows:

1. **Card Creation Flow**
   - [ ] Create card → Success → Navigates to Dashboard showing new card
   - [ ] Create card → Check no "CARD NOT FOUND" error (race condition)

2. **Privacy Toggle**
   - [ ] Toggle Private→Public → Shows loading (50% opacity) → Updates without popup
   - [ ] Toggle Public→Private → Shows loading (50% opacity) → Updates without popup

3. **Collection Management**
   - [ ] Add to Collection → Shows loading spinner → Switches to Remove button (no popup)
   - [ ] Remove from Collection → Shows confirmation → Gray out during operation → Switches to Add button (no popup)
   - [ ] Remains on card page after removing (does NOT navigate away)

4. **Card Navigation & Back Button**
   - [ ] Owner viewing own card → Back goes to My Cards
   - [ ] Non-owner viewing saved card → Back goes to Saved Cards
   - [ ] Non-owner viewing non-saved public card → Back goes to Homepage
   - [ ] Navigate from Saved Cards → Click card → Back goes to Saved Cards

5. **Download Cards**
   - [ ] Download front → No white border, filename ends with "-FRONT.png"
   - [ ] Download back → White rounded border, filename ends with "-BACK.png"

6. **Delete Card**
   - [ ] Click Delete → Shows confirmation → Click Delete → Gray out during operation → Navigates to My Cards (no popup)

---

## Quick Start for New Claude Sessions

1. **Read this file first** to understand current architecture
2. **Check [types.ts](types.ts)** for data models
3. **Check [constants.ts](constants.ts)** for theme definitions
4. **Run `npm run dev:net`** for local development (not `npm run dev`)
5. **Follow the UX patterns** documented above (especially button loading states)
6. **Never expose `GEMINI_API_KEY`** to client (no VITE_ prefix)
7. **Always test with Netlify Dev** to access database and AI functions
