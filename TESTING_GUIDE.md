# Saved Cards Feature - Quick Testing Guide

## Start Development Server

```bash
npm run dev:net
```

Visit: **http://localhost:8888**

---

## Test Scenario 1: Save Card While Logged In

1. **Create User A:**
   - Sign up with Clerk
   - Complete onboarding (name + selfie)
   - Create a public card (Theme: Cyberpunk Neon, Alignment: Hero)
   - Toggle card to PUBLIC using the visibility toggle
   - Copy the card URL from "COPY SHARE LINK" button

2. **Create User B (different browser/incognito):**
   - Sign up with different email
   - Complete onboarding
   - Paste User A's card URL in browser
   - Should see "ADD TO COLLECTION" button (green)
   - Click it → Toast shows "Card saved to your collection!"
   - Navigate to Saved Cards tab → See User A's card

3. **Verify Save Count:**
   - User A views their card → Should see "1 person has saved this card"

4. **Remove from Collection:**
   - User B clicks saved card from Saved Cards tab
   - Should navigate to `/saved/:id` with back button
   - Click "REMOVE FROM COLLECTION"
   - Confirm → Card removed, redirected to Saved Cards
   - Verify card no longer in Saved Cards tab

---

## Test Scenario 2: Save Card During Sign-Up

1. **User A:** Create and share a public card URL

2. **New User (not logged in):**
   - Visit User A's card URL directly
   - Click "ADD TO COLLECTION"
   - Clerk sign-up modal appears
   - Complete sign-up → Lands on "What is your name" screen
   - **Toast should appear:** "Card saved to your collection! You can view it in Saved Cards after completing onboarding."
   - Complete onboarding (name, selfie, strengths, story)
   - After onboarding, navigate to Saved Cards tab
   - Verify User A's card is there

---

## Test Scenario 3: Private/Deleted Cards

1. **User A:** Make their public card PRIVATE

2. **User B (who saved it):**
   - Go to Saved Cards tab
   - **Expected:** Card should NOT appear (filtered out)
   - Try accessing `/saved/:id` directly
   - **Expected:** Redirects to `/card/:id` → Shows "Card not found or private"

3. **User A:** Make card PUBLIC again

4. **User B:**
   - Go to Saved Cards tab
   - **Expected:** Card reappears automatically!

5. **User A:** Delete their card (click DELETE → confirm)

6. **User B:**
   - Saved Cards tab → Card disappears
   - Database still has the saved relationship (soft delete)

---

## Test Scenario 4: Edge Cases

### Cannot Save Own Card:
1. Create a public card
2. View it at `/card/:id`
3. **Expected:** No "ADD TO COLLECTION" button (you're the owner)

### Navigation & Back Buttons:
1. From Dashboard → Saved Cards tab → Click card
2. **Expected:** Navigate to `/saved/:id`, back button appears
3. Click back → **Expected:** Return to Saved Cards tab

4. From Dashboard → My Cards tab → Click card
5. **Expected:** Navigate to `/card/:id`, back button appears
6. Click back → **Expected:** Return to My Cards tab

### Tab Navigation:
1. Click between tabs: My Cards ↔ Saved Cards ↔ Personalize
2. Use browser back/forward buttons
3. **Expected:** URLs update, tabs stay in sync

---

## Database Verification Commands

### Check saved_cards table:
```bash
npx netlify db:query "SELECT user_clerk_id, card_id, saved_at FROM saved_cards;"
```

### Check save counts:
```bash
npx netlify db:query "SELECT id, user_name, theme, public, active, save_count FROM cards ORDER BY save_count DESC;"
```

### Check soft-deleted cards:
```bash
npx netlify db:query "SELECT id, user_name, active FROM cards WHERE active = FALSE;"
```

### Find cards saved by specific user:
```bash
# Replace user_*** with actual Clerk ID
npx netlify db:query "SELECT card_id FROM saved_cards WHERE user_clerk_id = 'user_***';"
```

---

## Expected Console Output

### When saving a card:
```
Storage.saveCardToCollection: Starting...
netlify-db.saveCardToCollection: API call successful
Toast: Card saved to your collection!
```

### When removing a card:
```
Storage.removeCardFromCollection: Starting...
netlify-db.removeCardFromCollection: API call successful
Toast: Card removed from your collection.
Navigating back to /cards/saved
```

---

## Common Issues & Fixes

### Issue: "Card saved" toast doesn't appear
**Fix:** Check browser console for errors, verify Netlify function logs

### Issue: Save count doesn't update
**Fix:** Refresh the page, count updates after database write completes

### Issue: Saved card doesn't appear in Saved Cards tab
**Fix:** Verify card is `public=TRUE` and `active=TRUE` in database

### Issue: Cannot access /saved/:id
**Fix:** Ensure you're logged in and have actually saved the card

### Issue: Back button doesn't work
**Fix:** Verify you're navigating from the correct source (dashboard tabs)

---

## Browser DevTools Checks

### Network Tab:
- Look for POST requests to `/.netlify/functions/db-*`
- Verify 200 status codes
- Check request/response payloads

### Application Tab → Local Storage:
- Check sessionStorage for `pendingCardSave` during sign-up flow

### Console:
- Should be free of errors
- May see info logs from storage service

---

## Success Criteria

✅ Can save public cards from other users
✅ Toast notifications appear and auto-dismiss
✅ Save count displays and updates correctly
✅ Saved Cards tab shows only active, public saved cards
✅ Remove from collection works with confirmation
✅ Private/deleted cards disappear from saved collections
✅ Can save card during sign-up flow
✅ Cannot save own cards
✅ Routing and back buttons work correctly
✅ Browser back/forward work with tabs

---

## Performance Notes

- Card saves are non-blocking (toast appears, page stays responsive)
- Save count updates after successful database write
- Saved Cards tab filters client-side after fetching from database
- IndexedDB cache used for instant reads, syncs in background

---

**Happy Testing!** 🎉

If you find any bugs or unexpected behavior, check:
1. Browser console
2. Netlify function logs: `npx netlify functions:log`
3. Database state with queries above
