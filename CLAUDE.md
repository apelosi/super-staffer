# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

SuperStaffer is a React-based web app that creates superhero trading cards from user selfies using Google's Gemini AI. Built for Vibez Ventures as a team-building experience at company outings, it allows colleagues to transform themselves into superheroes or villains with personalized trading cards.

**Key Tech Stack:**
- React 19 + TypeScript
- Vite (build tool)
- Tailwind CSS v4 (via @tailwindcss/vite)
- Framer Motion (animations)
- Google Gemini AI (via Netlify Functions) for image generation
- Clerk (authentication - in progress)
- Netlify (hosting & serverless functions)
- LocalStorage for data persistence (migrating to Clerk + backend)

## Product Requirements

### Original Design Brief

The app enables users to:
1. **Create Account**: Provide name and selfie (via camera, photo gallery, or file upload)
2. **Generate Cards**: Choose from 12 superhero themes and Hero/Villain alignment
3. **Manage Cards**: Create unlimited cards, delete cards, update profile, or logout
4. **Download Cards**: Save generated cards as PNG files to local filesystem/gallery

### Trading Card Specifications

Generated cards must match the style of **Marvel Universe Series III (1992)** trading cards with:
- Full-body superhero in dynamic action pose
- Rectangular "window" showing Marina Bay Sands (Singapore) behind the character's torso
- **White border with rounded corners** (hardcoded for all cards) - image bleeds to edges with border drawn on top
- User's name (top left) - font size matching "SUPER STAFFERS" text (36px italic)
- Superhero theme name (bottom left)
- "SUPER STAFFERS" text (top right)
- **vv-logo-square-alpha.png** image file in bottom right corner at 50px size (half the original size, NOT a generated V logo)
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
- Always use `dev:net` when working with AI card generation or other serverless features

## Environment Setup

Required environment variables in `.env` or `.env.local`:

```bash
# Clerk Authentication (configured in local .env and Netlify)
VITE_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key

# Gemini API (SERVER-SIDE ONLY - used in Netlify Functions)
# ⚠️ CRITICAL: NO VITE_ PREFIX - must not be exposed to client
GEMINI_API_KEY=your_gemini_api_key
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

The app uses a simple view-based state machine in [App.tsx](App.tsx):
1. **home** → ParallaxHero (landing page)
2. **onboarding** → Onboarding (user creates profile with selfie)
3. **creator** → CardCreator (generate new card with theme selection)
4. **dashboard** → Dashboard (view/manage created cards)

**New User Onboarding Flow (Updated Requirement):**
- After completing onboarding (name + selfie), new users go directly to CardCreator
- User must select both Hero/Villain alignment AND a theme before creating their first card
- User can skip/cancel to go to empty Dashboard, or proceed to create their first card
- After first card creation, user is taken to Dashboard showing their newly created card
- This ensures new users experience the core card creation feature immediately

User data and cards persist in localStorage via [services/storage.ts](services/storage.ts).

### Key Components

- **ParallaxHero** ([components/ParallaxHero.tsx](components/ParallaxHero.tsx)): Animated landing page with parallax effect
- **Onboarding** ([components/Onboarding.tsx](components/Onboarding.tsx)): Captures user name + selfie via CameraCapture
- **CameraCapture** ([components/CameraCapture.tsx](components/CameraCapture.tsx)): Camera access and photo capture, outputs base64
- **CardCreator** ([components/CardCreator.tsx](components/CardCreator.tsx)): Theme/alignment selection + Gemini API integration
- **Dashboard** ([components/Dashboard.tsx](components/Dashboard.tsx)): Gallery of generated cards with user profile
- **TradingCard** ([components/TradingCard.tsx](components/TradingCard.tsx)): Displays individual card with theme styling

### Data Models

See [types.ts](types.ts) for core types:
- `User`: name + selfie (base64 string)
- `CardData`: id, timestamp, imageUrl, theme, alignment
- `ThemeName`: 12 predefined themes (string union)
- `Alignment`: 'Hero' | 'Villain'

Themes are defined in [constants.ts](constants.ts) with icons, colors, and descriptions.

### AI Integration

[services/gemini.ts](services/gemini.ts) handles image generation via Netlify Functions:
- **Updated Architecture**: Client calls `/.netlify/functions/generate-card` endpoint (POST)
- Netlify Function processes the request server-side using Gemini API
- Uses `gemini-2.5-flash-image` model (originally specified as "Gemini 3 nano banana" in requirements)
- Takes user selfie (base64), theme, and alignment as JSON payload
- Returns generated trading card image URL
- Prompt engineering targets 1990s Marvel Universe Series III (1992) trading card aesthetic
- **Critical prompt elements**: Marina Bay Sands Singapore as rectangular "window" backdrop, dynamic action pose, comic book shading with realistic textures, no text overlay (text handled separately)
- **Security**: Gemini API key is kept server-side in Netlify Function, never exposed to client

### State Management

No global state library. App state lives in [App.tsx](App.tsx) and flows down via props:
- User object passed to Dashboard and CardCreator
- Cards array managed in App, persisted via storage service
- View state determines which component renders

### Styling Approach

- Tailwind CSS v4 with utility-first classes
- Framer Motion for animations (hero parallax, card reveals)
- Gradient backgrounds from theme definitions ([constants.ts](constants.ts))
- Responsive design with mobile-first breakpoints

## Important Patterns

**Camera Access**: CameraCapture component requests `getUserMedia` permission and converts captured image to base64 for both storage and API calls.

**Error Handling**: Gemini API errors are caught and logged in [services/gemini.ts](services/gemini.ts). API key validation happens before making requests.

**Base64 Handling**: Images are stored as base64 strings (not files) to simplify localStorage persistence. The gemini service strips the data URL prefix before sending to API.

**Path Aliases**: TypeScript and Vite configured with `@/*` alias pointing to project root (see [tsconfig.json](tsconfig.json) and [vite.config.ts](vite.config.ts)).

## Known Constraints & Future Enhancements

**Current Limitations:**
- Generated from AI Studio (see metadata.json), originally designed for Google's AI Studio platform
- Camera permission required for onboarding
- LocalStorage-only persistence (no backend/database)
- Gemini API rate limits apply to card generation
- No user authentication or multi-device sync

**Planned Features** (per original requirements):
- User management system with Clerk authentication
- Backend database for persistent storage across devices
- Multi-device sync capabilities

## Design Philosophy

Per the original brief, this is a **team-building experience** for company outings. The app prioritizes:
- Fun, colorful, engaging UI
- Quick onboarding flow
- Instant gratification (card generation)
- Collectibility (unlimited card creation)
- Shareability (PNG download)

---

## Clerk Authentication Integration Guidelines

**STATUS**: ✅ Environment configured - `VITE_CLERK_PUBLISHABLE_KEY` is set in local `.env` and Netlify environment.

**IMPORTANT**: When completing Clerk authentication integration, follow these strict requirements.

### Required Setup Steps

1. **Install Clerk React SDK** (if not already installed):
   ```bash
   npm install @clerk/clerk-react@latest
   ```

2. **Environment Variables** ✅ COMPLETED:
   ```bash
   VITE_CLERK_PUBLISHABLE_KEY=your_publishable_key_here
   ```
   - **CRITICAL**: Must use `VITE_` prefix for Vite to expose to client-side code
   - ✅ Already configured in local `.env` and Netlify environment
   - Get publishable key from [Clerk Dashboard API Keys page](https://dashboard.clerk.com/last-active?path=api-keys) (select React)
   - Ensure `.gitignore` excludes `.env*` files
   - Only use placeholders in code examples

3. **Wrap App with ClerkProvider** in [index.tsx](index.tsx):
   ```typescript
   import { ClerkProvider } from '@clerk/clerk-react';

   const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;
   if (!PUBLISHABLE_KEY) {
     throw new Error('Missing Clerk Publishable Key');
   }

   createRoot(document.getElementById('root')!).render(
     <StrictMode>
       <ClerkProvider publishableKey={PUBLISHABLE_KEY} afterSignOutUrl="/">
         <App />
       </ClerkProvider>
     </StrictMode>
   );
   ```

4. **Use Clerk Components**:
   ```typescript
   import {
     SignedIn,
     SignedOut,
     SignInButton,
     SignUpButton,
     UserButton,
   } from '@clerk/clerk-react';
   ```

### Critical Rules - ALWAYS DO

1. ✅ Use `@clerk/clerk-react@latest` package
2. ✅ Use environment variable named `VITE_CLERK_PUBLISHABLE_KEY`
3. ✅ Place `<ClerkProvider>` in `index.tsx` or `main.tsx`
4. ✅ Use `publishableKey` prop (not `frontendApi`)
5. ✅ Store real keys only in `.env.local`, use placeholders in code
6. ✅ Reference official docs: https://clerk.com/docs/react/getting-started/quickstart

### Critical Rules - NEVER DO

1. ❌ Do NOT use `frontendApi` instead of `publishableKey`
2. ❌ Do NOT use old variable names like `REACT_APP_CLERK_FRONTEND_API`
3. ❌ Do NOT place `<ClerkProvider>` deeper in component tree
4. ❌ Do NOT use outdated hooks or components from older Clerk versions
5. ❌ Do NOT print or persist real keys in tracked files (`.ts`, `.tsx`, `.md`)
6. ❌ Do NOT skip the `VITE_` prefix on environment variables

### Integration with Existing Architecture

When integrating Clerk into this app:
- Replace localStorage-based user management in [services/storage.ts](services/storage.ts) with Clerk's user state
- Update [App.tsx](App.tsx) view state machine to use `<SignedIn>` / `<SignedOut>` instead of local `user` state
- Migrate onboarding flow to use Clerk's sign-up process
- Associate trading cards with Clerk user IDs instead of localStorage keys
- Maintain the existing view flow: home → onboarding → creator → dashboard
