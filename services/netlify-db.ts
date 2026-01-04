import { User, CardData } from '../types';

/**
 * Netlify DB client service
 * All database operations go through Netlify Functions to keep DATABASE_URL server-side
 */

export const db = {
  /**
   * Get user profile by Clerk ID
   */
  getUser: async (clerkId: string): Promise<{ user: User | null }> => {
    const response = await fetch('/.netlify/functions/db-get-user', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ clerkId }),
    });

    if (!response.ok) {
      throw new Error('Failed to get user');
    }

    return response.json();
  },

  /**
   * Save or update user profile
   */
  saveUser: async (user: { clerkId: string; name: string; selfieUrl: string }): Promise<{ success: boolean }> => {
    const response = await fetch('/.netlify/functions/db-save-user', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(user),
    });

    if (!response.ok) {
      throw new Error('Failed to save user');
    }

    return response.json();
  },

  /**
   * Get all cards for a user
   */
  getCards: async (clerkId: string): Promise<{ cards: CardData[] }> => {
    const response = await fetch('/.netlify/functions/db-get-cards', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ clerkId }),
    });

    if (!response.ok) {
      throw new Error('Failed to get cards');
    }

    return response.json();
  },

  /**
   * Save a new card
   */
  saveCard: async (card: CardData, clerkId: string): Promise<{ success: boolean }> => {
    const response = await fetch('/.netlify/functions/db-save-card', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ card, clerkId }),
    });

    if (!response.ok) {
      throw new Error('Failed to save card');
    }

    return response.json();
  },

  /**
   * Delete a card
   */
  deleteCard: async (cardId: string): Promise<{ success: boolean }> => {
    console.log('netlify-db.deleteCard: Calling API with cardId:', cardId);
    const response = await fetch('/.netlify/functions/db-delete-card', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ cardId }),
    });

    console.log('netlify-db.deleteCard: Response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('netlify-db.deleteCard: Error response:', errorText);
      throw new Error('Failed to delete card');
    }

    const result = await response.json();
    console.log('netlify-db.deleteCard: Success response:', result);
    return result;
  },

  /**
   * Toggle card public/private status
   */
  toggleCardVisibility: async (cardId: string, isPublic: boolean): Promise<{ success: boolean }> => {
    const response = await fetch('/.netlify/functions/db-toggle-card-visibility', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ cardId, isPublic }),
    });

    if (!response.ok) {
      throw new Error('Failed to toggle card visibility');
    }

    return response.json();
  },
};
