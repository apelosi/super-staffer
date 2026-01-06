import { User, CardData } from '../types';
import { db } from './netlify-db';
import { dbRequest, dbGetAll, STORE_USERS, STORE_CARDS } from './db';

/**
 * Hybrid offline-first storage service
 * - Reads from local IndexedDB cache first (instant)
 * - Syncs with Netlify DB in background
 * - Writes to local cache immediately, then syncs to cloud
 */

export const storage = {
  /**
   * Load user from local cache, sync from Netlify DB in background
   */
  getUser: async (clerkId: string): Promise<User | null> => {
    // Try local cache first
    const localUser = await dbRequest<{ id: string, user: User }>(
      STORE_USERS,
      'readonly',
      store => store.get(clerkId)
    );

    // Return cached data immediately
    if (localUser) {
      // Sync from cloud in background (don't await)
      syncUserFromCloud(clerkId).catch(console.error);
      return localUser.user;
    }

    // No cache, fetch from cloud
    try {
      const response = await db.getUser(clerkId);
      const user = response.user;

      if (user) {
        // Cache locally
        await dbRequest(STORE_USERS, 'readwrite', store =>
          store.put({ id: clerkId, user })
        );

        return user;
      }
    } catch (error) {
      console.error('Cloud fetch failed:', error);
    }

    return null;
  },

  /**
   * Save user to local cache, sync to cloud in background
   */
  saveUser: async (user: User): Promise<void> => {
    // Save to local cache immediately
    await dbRequest(STORE_USERS, 'readwrite', store =>
      store.put({ id: user.clerkId, user })
    );

    // Sync to cloud in background
    syncUserToCloud(user).catch(console.error);
  },

  /**
   * Load cards from local cache, sync from cloud
   */
  getCards: async (clerkId: string): Promise<CardData[]> => {
    // Local cache - CRITICAL: Only get cards owned by this user
    const allLocalCards = await dbGetAll<CardData>(STORE_CARDS);
    const localCards = allLocalCards.filter(card => card.ownerClerkId === clerkId);

    // Sync from cloud in background
    syncCardsFromCloud(clerkId).catch(console.error);

    return localCards;
  },

  /**
   * Save card to local cache, sync to cloud
   */
  saveCard: async (card: CardData, clerkId: string): Promise<void> => {
    // Save locally immediately
    await dbRequest(STORE_CARDS, 'readwrite', store => store.put(card));

    // Sync to cloud
    syncCardToCloud(card, clerkId).catch(console.error);
  },

  /**
   * Delete card from local and cloud
   */
  deleteCard: async (cardId: string): Promise<void> => {
    console.log('storage.deleteCard: Deleting from IndexedDB, cardId:', cardId);
    await dbRequest(STORE_CARDS, 'readwrite', store => store.delete(cardId));
    console.log('storage.deleteCard: IndexedDB delete complete');

    // Delete from cloud
    console.log('storage.deleteCard: Deleting from cloud database');
    await db.deleteCard(cardId);
    console.log('storage.deleteCard: Cloud delete complete');
  },

  /**
   * Get a single card by ID (for public viewing)
   * @param cardId - The card ID to fetch
   * @param viewerClerkId - Optional: Current user's Clerk ID. If provided and matches card owner, uses cache-first
   */
  getCardById: async (cardId: string, viewerClerkId?: string): Promise<CardData | null> => {
    // If viewer ID provided, check cache first to see if they're the owner
    if (viewerClerkId) {
      const localCard = await dbRequest<CardData>(
        STORE_CARDS,
        'readonly',
        store => store.get(cardId)
      );

      if (localCard) {
        // Check schema validity
        if ('isPublic' in localCard || !('active' in localCard)) {
          console.log('[storage.getCardById] Cached card has old schema, falling through to cloud');
        } else if (localCard.ownerClerkId === viewerClerkId) {
          // OWNER viewing their own card - can use cache safely
          if (localCard.active) {
            console.log('[storage.getCardById] Owner viewing own card - using cache (60-300x faster)');
            return localCard;
          } else {
            console.log('[storage.getCardById] Owner card is deleted (active: false)');
            return null;
          }
        }
        // Not owner - fall through to cloud fetch for fresh public state
      }
      // Cache miss - fall through to cloud fetch
    }

    // NON-OWNER CONTEXT or cache miss: Fetch fresh from cloud
    try {
      const response = await db.getCardById(cardId);
      if (response && response.card) {
        // Update local cache with fresh data
        await dbRequest(STORE_CARDS, 'readwrite', store => store.put(response.card));
        console.log('[storage.getCardById] Fetched fresh from cloud, public:', response.card.public, 'active:', response.card.active);
        return response.card;
      }
    } catch (error) {
      console.error('[storage.getCardById] Cloud fetch failed:', error);

      // Fallback to cache only for owners (offline mode)
      if (viewerClerkId) {
        const localCard = await dbRequest<CardData>(
          STORE_CARDS,
          'readonly',
          store => store.get(cardId)
        );

        if (localCard && localCard.active && !('isPublic' in localCard) && 'active' in localCard && localCard.ownerClerkId === viewerClerkId) {
          console.log('[storage.getCardById] Using cached card (offline mode) - owner only');
          return localCard;
        }
      }
    }

    return null;
  },

  /**
   * Toggle card visibility (public/private)
   */
  toggleCardVisibility: async (cardId: string, publicValue: boolean): Promise<void> => {
    // Update local cache
    const card = await dbRequest<CardData>(
      STORE_CARDS,
      'readonly',
      store => store.get(cardId)
    );

    if (card) {
      card.public = publicValue;
      await dbRequest(STORE_CARDS, 'readwrite', store => store.put(card));
    }

    // Update cloud
    await db.toggleCardVisibility(cardId, publicValue);
  },

  /**
   * Get saved cards for a user (from external collection)
   */
  getSavedCards: async (clerkId: string): Promise<CardData[]> => {
    console.log('[storage.getSavedCards] Called with clerkId:', clerkId, 'Type:', typeof clerkId);
    try {
      const response = await db.getSavedCards(clerkId);
      console.log('[storage.getSavedCards] Success, got', response.cards.length, 'cards');
      return response.cards;
    } catch (error) {
      console.error('[storage.getSavedCards] Failed to get saved cards:', error);
      return [];
    }
  },

  /**
   * Save a card to user's collection
   */
  saveCardToCollection: async (userClerkId: string, cardId: string): Promise<void> => {
    await db.saveCardToCollection(userClerkId, cardId);
  },

  /**
   * Remove a card from user's collection
   */
  removeCardFromCollection: async (userClerkId: string, cardId: string): Promise<void> => {
    await db.removeCardFromCollection(userClerkId, cardId);
  },

  /**
   * Check if a card is saved by a user
   */
  checkCardSaved: async (userClerkId: string, cardId: string): Promise<boolean> => {
    const response = await db.checkCardSaved(userClerkId, cardId);
    return response.isSaved;
  },

  /**
   * Clear local user cache (for logout)
   */
  clearUser: async (): Promise<void> => {
    // Clear all local data
    await dbRequest(STORE_USERS, 'readwrite', store => store.clear());
    await dbRequest(STORE_CARDS, 'readwrite', store => store.clear());
  },

  /**
   * Clear ALL local cache (for switching users)
   * CRITICAL: Call this when detecting a new user sign-in to prevent data leakage
   */
  clearAllLocalCache: async (): Promise<void> => {
    console.log('[storage.clearAllLocalCache] Clearing all IndexedDB data');
    await dbRequest(STORE_USERS, 'readwrite', store => store.clear());
    await dbRequest(STORE_CARDS, 'readwrite', store => store.clear());
  },
};

// Background sync helpers
async function syncUserFromCloud(clerkId: string) {
  try {
    const response = await db.getUser(clerkId);
    if (response.user) {
      await dbRequest(STORE_USERS, 'readwrite', store =>
        store.put({ id: clerkId, user: response.user })
      );
    }
  } catch (error) {
    console.error('User sync failed:', error);
  }
}

async function syncUserToCloud(user: User) {
  try {
    await db.saveUser({
      clerkId: user.clerkId,
      name: user.name,
      selfieUrl: user.selfie,
      strengths: user.strengths,
      story: user.story,
    });
  } catch (error) {
    console.error('User save failed:', error);
  }
}

async function syncCardsFromCloud(clerkId: string) {
  try {
    const response = await db.getCards(clerkId);
    const cards = response.cards;

    for (const card of cards) {
      await dbRequest(STORE_CARDS, 'readwrite', store => store.put(card));
    }
  } catch (error) {
    console.error('Cards sync failed:', error);
  }
}

async function syncCardToCloud(card: CardData, clerkId: string) {
  try {
    await db.saveCard(card, clerkId);
  } catch (error) {
    console.error('Card save failed:', error);
  }
}
