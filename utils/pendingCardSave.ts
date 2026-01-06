/**
 * Utility functions for handling pending card saves through sign-up flow
 */

const PENDING_CARD_KEY = 'pendingCardSave';

export const pendingCardSave = {
  /**
   * Store a card ID to save after sign-up completes
   */
  set: (cardId: string): void => {
    sessionStorage.setItem(PENDING_CARD_KEY, cardId);
  },

  /**
   * Get the pending card ID (if any)
   */
  get: (): string | null => {
    return sessionStorage.getItem(PENDING_CARD_KEY);
  },

  /**
   * Clear the pending card save
   */
  clear: (): void => {
    sessionStorage.removeItem(PENDING_CARD_KEY);
  },
};
