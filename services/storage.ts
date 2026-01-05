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
    // Local cache
    const localCards = await dbGetAll<CardData>(STORE_CARDS);

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
   */
  getCardById: async (cardId: string): Promise<CardData | null> => {
    // Try local cache first
    const localCard = await dbRequest<CardData>(
      STORE_CARDS,
      'readonly',
      store => store.get(cardId)
    );

    if (localCard) {
      return localCard;
    }

    // Try fetching from cloud if not in cache
    try {
      const response = await db.getCardById(cardId);
      if (response && response.card) {
        // Cache it locally
        await dbRequest(STORE_CARDS, 'readwrite', store => store.put(response.card));
        return response.card;
      }
    } catch (error) {
      console.error('Failed to fetch card from cloud:', error);
    }

    return null;
  },

  /**
   * Toggle card visibility (public/private)
   */
  toggleCardVisibility: async (cardId: string, isPublic: boolean): Promise<void> => {
    // Update local cache
    const card = await dbRequest<CardData>(
      STORE_CARDS,
      'readonly',
      store => store.get(cardId)
    );

    if (card) {
      card.isPublic = isPublic;
      await dbRequest(STORE_CARDS, 'readwrite', store => store.put(card));
    }

    // Update cloud
    await db.toggleCardVisibility(cardId, isPublic);
  },

  /**
   * Clear local user cache (for logout)
   */
  clearUser: async (): Promise<void> => {
    // Clear all local data
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
