import { User, CardData } from '../types';
import { dbRequest, dbGetAll, STORE_USERS, STORE_CARDS } from './db';

const CURRENT_USER_ID = 'current_user';
const LS_USER_KEY = 'superstaffer_user';
const LS_CARDS_KEY = 'superstaffer_cards';

export const storage = {
  getUser: async (): Promise<User | null> => {
    // Check DB first
    let userWrapper = await dbRequest<{ id: string, user: User }>(STORE_USERS, 'readonly', store => store.get(CURRENT_USER_ID));

    // Migration: Check LocalStorage if not in DB
    if (!userWrapper) {
      const lsUser = localStorage.getItem(LS_USER_KEY);
      if (lsUser) {
        try {
          const user = JSON.parse(lsUser);
          await dbRequest(STORE_USERS, 'readwrite', store => store.put({ id: CURRENT_USER_ID, user }));
          userWrapper = { id: CURRENT_USER_ID, user };
          // Clear LS to free up space, or keep for safety? Better to clear to fix quota issues immediately.
          localStorage.removeItem(LS_USER_KEY);
        } catch (e) {
          console.error("Migration error (user):", e);
        }
      }
    }
    return userWrapper ? userWrapper.user : null;
  },

  saveUser: async (user: User) => {
    await dbRequest(STORE_USERS, 'readwrite', store => store.put({ id: CURRENT_USER_ID, user }));
  },

  clearUser: async () => {
    await dbRequest(STORE_USERS, 'readwrite', store => store.delete(CURRENT_USER_ID));
  },

  getCards: async (): Promise<CardData[]> => {
    let cards = await dbGetAll<CardData>(STORE_CARDS);

    // Migration: Check LocalStorage if DB is empty (or check anyway to merge?)
    // Converting LS array to individual DB items
    const lsCardsStr = localStorage.getItem(LS_CARDS_KEY);
    if (lsCardsStr) {
      try {
        const lsCards = JSON.parse(lsCardsStr) as CardData[];
        if (lsCards.length > 0) {
          // Check if we already migrated them based on IDs? 
          // Simpler: Just try to put them all. put() updates if exists.
          for (const card of lsCards) {
            await dbRequest(STORE_CARDS, 'readwrite', store => store.put(card));
          }
          // Re-fetch to get complete list sorted/updated
          cards = await dbGetAll<CardData>(STORE_CARDS);
          localStorage.removeItem(LS_CARDS_KEY);
        }
      } catch (e) {
        console.error("Migration error (cards):", e);
      }
    }
    return cards;
  },

  saveCard: async (card: CardData) => {
    await dbRequest(STORE_CARDS, 'readwrite', store => store.put(card));
  },

  deleteCard: async (cardId: string) => {
    await dbRequest(STORE_CARDS, 'readwrite', store => store.delete(cardId));
  }
};