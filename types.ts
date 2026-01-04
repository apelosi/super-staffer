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
  name: string;
  selfie: string; // Base64 string
}

export interface CardData {
  id: string;
  timestamp: number;
  imageUrl: string;
  theme: ThemeName;
  alignment: Alignment;
}

export interface ThemeDef {
  id: string;
  name: ThemeName;
  description: string;
  icon: string; // Emoji or Lucide icon name placeholder
  color: string;
}