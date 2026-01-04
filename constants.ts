import { ThemeDef } from './types';

export const THEMES: ThemeDef[] = [
  { id: 'cyberpunk', name: 'Cyberpunk Neon', description: 'High-tech low-life in a neon city.', icon: 'Zap', color: 'from-pink-500 to-purple-500' },
  { id: 'mystic', name: 'Ancient Mystic', description: 'Sorcery and ancient ruins.', icon: 'Sparkles', color: 'from-indigo-500 to-purple-600' },
  { id: 'space', name: 'Space Opera', description: 'Intergalactic battles and starships.', icon: 'Rocket', color: 'from-blue-600 to-cyan-400' },
  { id: 'steampunk', name: 'Steampunk Gear', description: 'Steam-powered brass machinery.', icon: 'Settings', color: 'from-amber-700 to-orange-500' },
  { id: 'ninja', name: 'Ninja Shadow', description: 'Stealth and martial arts in the shadows.', icon: 'Sword', color: 'from-gray-800 to-red-600' },
  { id: 'elemental', name: 'Elemental Nature', description: 'Wielding the forces of nature.', icon: 'Leaf', color: 'from-green-500 to-emerald-700' },
  { id: 'noir', name: 'Noir Detective', description: 'Gritty mysteries in black and white.', icon: 'Search', color: 'from-gray-600 to-gray-900' },
  { id: 'galactic', name: 'Galactic Guardian', description: 'Defending the galaxy from tyrants.', icon: 'Shield', color: 'from-blue-500 to-indigo-700' },
  { id: 'medieval', name: 'Medieval Knight', description: 'Swords, shields, and dragons.', icon: 'Castle', color: 'from-red-700 to-amber-600' },
  { id: 'urban', name: 'Urban Vigilante', description: 'Protecting the streets at night.', icon: 'Building', color: 'from-slate-700 to-slate-900' },
  { id: 'mutant', name: 'Mutant X', description: 'Genetic mutations and super powers.', icon: 'Dna', color: 'from-lime-500 to-green-600' },
  { id: 'mecha', name: 'Tech Mecha', description: 'Piloting giant robot suits.', icon: 'Cpu', color: 'from-cyan-600 to-blue-800' },
];

export const VIBEZ_LOGO_SVG = `
<svg width="100%" height="100%" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
  <path d="M20 10 L50 80 L80 10" stroke="url(#paint0_linear)" stroke-width="15" stroke-linecap="round" stroke-linejoin="round"/>
  <defs>
    <linearGradient id="paint0_linear" x1="20" y1="10" x2="80" y2="80" gradientUnits="userSpaceOnUse">
      <stop stop-color="#00B4D8"/>
      <stop offset="1" stop-color="#7209B7"/>
    </linearGradient>
  </defs>
</svg>
`;