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
}

export interface CardData {
  id: string;
  timestamp: number;
  imageUrl: string;
  theme: ThemeName;
  alignment: Alignment;
  userName: string;          // User's name at time of creation
  isPublic: boolean;         // Public/private visibility toggle
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