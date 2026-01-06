export type ThemeName = 
  | 'Cyberpunk Neon'
  | 'Ancient Mystic'
  | 'Space Opera'
  | 'Steampunk Gear'
  | 'Ninja Shadow'
  | 'Elemental Nature'
  | 'Noir Detective'
  | 'Galactic Guardian'
  | 'Medieval Knight'
  | 'Urban Vigilante'
  | 'Mutant X'
  | 'Tech Mecha';

export type Alignment = 'Hero' | 'Villain';

export interface User {
  clerkId: string;           // Clerk user ID
  name: string;
  selfie: string;            // Cloud storage URL (Cloudinary)
  strengths?: string[];      // Array of up to 5 character strengths
  story?: string;            // Origin story (max 144 characters)
}

export interface CardData {
  id: string;
  timestamp: number;
  imageUrl: string;
  theme: ThemeName;
  alignment: Alignment;
  userName: string;          // User's name at time of creation
  public: boolean;           // Public/private visibility toggle
  active: boolean;           // Soft delete flag (false = deleted)
  saveCount: number;         // Number of users who saved this card
  ownerClerkId?: string;     // Card owner's Clerk ID (for ownership checks)
}

export interface SavedCard {
  userClerkId: string;       // User who saved the card
  cardId: string;            // Reference to original card
  savedAt: number;           // Timestamp when saved
}

export interface ThemeDef {
  id: string;
  name: ThemeName;
  description: string;
  icon: string; // Emoji or Lucide icon name placeholder
  color: string;
  colors: {
    from: string;
    to: string;
  };
}