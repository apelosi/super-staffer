# Session Notes - Public Folder Reorganization

## Date
January 6, 2026

## Session Summary
Reorganized `/public` folder structure to improve maintainability by moving assets into logical subfolders while keeping web-standard files (favicons, manifests) at root level.

## Changes Made

### 1. Deleted Outdated Files
- **Removed**: `/public/favicon/` folder (7 outdated, lower-quality favicon duplicates)
  - Root-level favicons are newer and correctly referenced by `index.html`
  - Hidden folder contained redundant files that could cause confusion

### 2. Created New Asset Subfolders
- **Created**: `/public/logos/` (12 logo files - 6 rich variants, 6 flat variants)
- **Created**: `/public/characters/` (12 character images - 6 heroes, 6 villains)

### 3. Moved Files
- **Moved 12 logo files** from `/public/*.png` to `/public/logos/*.png`
  - `ss-logo-rich-*.png` (6 files: 32x32, 64x64, 128x128, 256x256, 512x512, 1024x1024)
  - `ss-logo-flat-*.png` (6 files: same sizes, kept for future use)
- **Moved 12 character files** from `/public/*.png` to `/public/characters/*.png`
  - `ss-*-hero.png` (6 theme heroes)
  - `ss-*-villain.png` (6 theme villains)

### 4. Updated Code References (7 locations across 5 files)

#### [components/Header.tsx](components/Header.tsx) (line 13)
```tsx
// Before: src="/ss-logo-rich-64x64.png"
// After:  src="/logos/ss-logo-rich-64x64.png"
```

#### [components/Footer.tsx](components/Footer.tsx) (line 13)
```tsx
// Before: src="/ss-logo-rich-32x32.png"
// After:  src="/logos/ss-logo-rich-32x32.png"
```

#### [components/LoadingScreen.tsx](components/LoadingScreen.tsx) (line 21)
```tsx
// Before: src="/ss-logo-rich-128x128.png"
// After:  src="/logos/ss-logo-rich-128x128.png"
```

#### [components/ParallaxHero.tsx](components/ParallaxHero.tsx)
**Line 186** - Logo path:
```tsx
// Before: src="/ss-logo-rich-256x256.png"
// After:  src="/logos/ss-logo-rich-256x256.png"
```

**Lines 106 & 378** - Dynamic character paths (2 locations):
```tsx
// Before: src={`/ss-${theme.id}-${alignment}.png`}
// After:  src={`/characters/ss-${theme.id}-${alignment}.png`}
```

#### [components/SingleCardView.tsx](components/SingleCardView.tsx)
**Line 109** - Card back logo:
```tsx
// Before: logoImg.src = '/ss-logo-rich-64x64.png';
// After:  logoImg.src = '/logos/ss-logo-rich-64x64.png';
```

**Line 429** - Card front download logo:
```tsx
// Before: logoImg.src = '/ss-logo-rich-64x64.png';
// After:  logoImg.src = '/logos/ss-logo-rich-64x64.png';
```

### 5. Updated Documentation

#### [CLAUDE.md](CLAUDE.md)
- Added "Public Folder Organization" section with full folder structure
- Corrected logo reference from `vv-logo-square-alpha.png` to `/logos/ss-logo-rich-64x64.png`
- Added iCloud Drive development issues to "Known Constraints" section

## Final Folder Structure

```
/public (7 files at root)
├── favicon.svg
├── favicon.ico
├── favicon-96x96.png
├── apple-touch-icon.png
├── site.webmanifest
├── web-app-manifest-192x192.png
├── web-app-manifest-512x512.png
├── /logos (12 files)
│   ├── ss-logo-rich-32x32.png
│   ├── ss-logo-rich-64x64.png
│   ├── ss-logo-rich-128x128.png
│   ├── ss-logo-rich-256x256.png
│   ├── ss-logo-rich-512x512.png
│   ├── ss-logo-rich-1024x1024.png
│   ├── ss-logo-flat-32x32.png
│   ├── ss-logo-flat-64x64.png
│   ├── ss-logo-flat-128x128.png
│   ├── ss-logo-flat-256x256.png
│   ├── ss-logo-flat-512x512.png
│   └── ss-logo-flat-1024x1024.png
└── /characters (12 files)
    ├── ss-cyberpunk-hero.png
    ├── ss-medieval-hero.png
    ├── ss-mutant-hero.png
    ├── ss-ninja-hero.png
    ├── ss-noir-hero.png
    ├── ss-space-hero.png
    ├── ss-elemental-villain.png
    ├── ss-galactic-villain.png
    ├── ss-mecha-villain.png
    ├── ss-mystic-villain.png
    ├── ss-steampunk-villain.png
    └── ss-urban-villain.png
```

## Benefits

1. **Cleaner root directory**: Only 7 essential files remain at `/public` root (all required for web standards)
2. **Logical grouping**: Assets organized by type/purpose (logos vs characters)
3. **Better maintainability**: Easy to locate and manage logo variants and character images
4. **Scalability**: Simple to add new characters or logo variants in the future
5. **No breaking changes**: All files remain accessible via updated paths

## Issues Encountered

### 1. iCloud Drive + npm Issues

**Problem**: Running `npm run dev:net` failed with two different errors:
- `.netlify/plugins` directory corruption (ENOTEMPTY error)
- esbuild platform mismatch error (darwin-arm64 binary missing/corrupted)

**Root Cause**: Project stored in iCloud Drive causes npm file system issues:
- iCloud sync interferes with npm's directory operations
- Platform-specific binaries (like esbuild) get corrupted during sync
- Common when copying `node_modules` between machines or when iCloud syncs files

**Solutions Attempted**:
1. ✅ Removed `.netlify/plugins` directory: `rm -rf .netlify/plugins`
2. ✅ Linked Netlify project: `netlify link` (connected to existing project)
3. ⚠️ **Still needed**: `rm -rf node_modules package-lock.json && npm install`
   - User needs to run this manually in terminal (Bash tool has PATH issues)

**Recommendation**: Consider moving project to local directory (e.g., `~/Development/super-staffer`) instead of iCloud Drive to avoid future npm issues.

## Testing Required

Before considering this complete, test the following:

1. **Homepage (ParallaxHero)**
   - [ ] Logo loads at top center
   - [ ] All 12 character images load in parallax animation (6 heroes + 6 villains)

2. **Header/Footer (All Pages)**
   - [ ] Header logo loads in top-left corner
   - [ ] Footer logo loads in bottom-left corner

3. **Loading Screen**
   - [ ] Animated spinning logo displays correctly

4. **Trading Card View**
   - [ ] Card back rendering shows logo in bottom-right corner

5. **Card Download**
   - [ ] Front card download includes logo watermark
   - [ ] Back card download includes logo watermark

## Next Steps

1. **Run npm install** manually in terminal:
   ```bash
   rm -rf node_modules package-lock.json
   npm install
   ```

2. **Start dev server**:
   ```bash
   npm run dev:net
   ```

3. **Test all image loading** per checklist above

4. **Verify no console errors** related to missing images

5. **Consider moving project** out of iCloud Drive to prevent future npm issues

## Notes for Next Session

- All code changes are complete and verified in source files
- Documentation (CLAUDE.md) has been updated with current state
- Outstanding work is npm reinstall + testing (requires manual terminal commands)
- No other blocking issues identified
