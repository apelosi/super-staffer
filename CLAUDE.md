# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

SuperStaffer is a React-based web app that creates superhero trading cards from user selfies using Google's Gemini AI. Built for Vibez Ventures as a team-building experience, it transforms photos into 1990s-style superhero card artwork with various themes (Cyberpunk, Space Opera, Medieval Knight, etc.).

**Key Tech Stack:**
- React 19 + TypeScript
- Vite (build tool)
- Tailwind CSS v4 (via @tailwindcss/vite)
- Framer Motion (animations)
- Google Gemini AI (@google/genai) for image generation
- LocalStorage for data persistence

## Development Commands

```bash
# Install dependencies
npm install

# Run development server (http://localhost:3001)
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Environment Setup

The app requires a Gemini API key. Create a `.env` file:
```
VITE_GEMINI_API_KEY=your_api_key_here
```

The key is accessed via `import.meta.env.VITE_GEMINI_API_KEY` (Vite convention).

## Architecture

### Application Flow

The app uses a simple view-based state machine in [App.tsx](App.tsx):
1. **home** → ParallaxHero (landing page)
2. **onboarding** → Onboarding (user creates profile with selfie)
3. **dashboard** → Dashboard (view/manage created cards)
4. **creator** → CardCreator (generate new card with theme selection)

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

[services/gemini.ts](services/gemini.ts) handles image generation:
- Uses `gemini-2.5-flash-image` model
- Takes user selfie (base64), theme, and alignment
- Returns generated trading card image as base64 data URL
- Prompt engineering targets 1990s Marvel trading card aesthetic with Marina Bay Sands Singapore backdrop

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

## Known Constraints

- Generated from AI Studio (see metadata.json), originally designed for Google's AI Studio platform
- Camera permission required for onboarding
- LocalStorage-only persistence (no backend/database)
- Gemini API rate limits apply to card generation
