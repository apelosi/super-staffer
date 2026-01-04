import { User, CardData } from '../types';

const USER_KEY = 'superstaffer_user';
const CARDS_KEY = 'superstaffer_cards';

export const storage = {
  getUser: (): User | null => {
    const data = localStorage.getItem(USER_KEY);
    return data ? JSON.parse(data) : null;
  },

  saveUser: (user: User) => {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  },

  clearUser: () => {
    localStorage.removeItem(USER_KEY);
  },

  getCards: (): CardData[] => {
    const data = localStorage.getItem(CARDS_KEY);
    return data ? JSON.parse(data) : [];
  },

  saveCard: (card: CardData) => {
    const cards = storage.getCards();
    cards.push(card);
    localStorage.setItem(CARDS_KEY, JSON.stringify(cards));
  },

  deleteCard: (cardId: string) => {
    const cards = storage.getCards().filter(c => c.id !== cardId);
    localStorage.setItem(CARDS_KEY, JSON.stringify(cards));
  }
};