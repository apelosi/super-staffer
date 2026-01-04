import { ThemeDef } from './types';

export const THEMES: ThemeDef[] = [
  { id: 'cyberpunk', name: 'Cyberpunk Neon', description: 'High-tech low-life in a neon city.', icon: 'Zap', color: 'from-pink-500 to-purple-500', colors: { from: '#ec4899', to: '#a855f7' } },
  { id: 'mystic', name: 'Ancient Mystic', description: 'Sorcery and ancient ruins.', icon: 'Sparkles', color: 'from-indigo-500 to-purple-600', colors: { from: '#6366f1', to: '#9333ea' } },
  { id: 'space', name: 'Space Opera', description: 'Intergalactic battles and starships.', icon: 'Rocket', color: 'from-blue-600 to-cyan-400', colors: { from: '#2563eb', to: '#22d3ee' } },
  { id: 'steampunk', name: 'Steampunk Gear', description: 'Steam-powered brass machinery.', icon: 'Settings', color: 'from-amber-700 to-orange-500', colors: { from: '#b45309', to: '#f97316' } },
  { id: 'ninja', name: 'Ninja Shadow', description: 'Stealth and martial arts in the shadows.', icon: 'Sword', color: 'from-gray-800 to-red-600', colors: { from: '#1f2937', to: '#dc2626' } },
  { id: 'elemental', name: 'Elemental Nature', description: 'Wielding the forces of nature.', icon: 'Leaf', color: 'from-green-500 to-emerald-700', colors: { from: '#22c55e', to: '#047857' } },
  { id: 'noir', name: 'Noir Detective', description: 'Gritty mysteries in black and white.', icon: 'Search', color: 'from-gray-600 to-gray-900', colors: { from: '#4b5563', to: '#111827' } },
  { id: 'galactic', name: 'Galactic Guardian', description: 'Defending the galaxy from tyrants.', icon: 'Shield', color: 'from-blue-500 to-indigo-700', colors: { from: '#3b82f6', to: '#4338ca' } },
  { id: 'medieval', name: 'Medieval Knight', description: 'Swords, shields, and dragons.', icon: 'Castle', color: 'from-red-700 to-amber-600', colors: { from: '#b91c1c', to: '#d97706' } },
  { id: 'urban', name: 'Urban Vigilante', description: 'Protecting the streets at night.', icon: 'Building', color: 'from-slate-700 to-slate-900', colors: { from: '#334155', to: '#0f172a' } },
  { id: 'mutant', name: 'Mutant X', description: 'Genetic mutations and super powers.', icon: 'Dna', color: 'from-lime-500 to-green-600', colors: { from: '#84cc16', to: '#16a34a' } },
  { id: 'mecha', name: 'Tech Mecha', description: 'Piloting giant robot suits.', icon: 'Cpu', color: 'from-cyan-600 to-blue-800', colors: { from: '#0891b2', to: '#1e40af' } },
];

export const VIBEZ_LOGO_SVG = `
<svg width="100%" height="100%" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="shield_gradient" x1="50" y1="0" x2="50" y2="100" gradientUnits="userSpaceOnUse">
      <stop stop-color="#00B4D8"/>
      <stop offset="1" stop-color="#7209B7"/>
    </linearGradient>
    
    <!-- Purple Gradient for First S -->
    <linearGradient id="purple_gradient" x1="0" y1="0" x2="0" y2="100" gradientUnits="userSpaceOnUse">
      <stop stop-color="#E0AAFF"/>
      <stop offset="1" stop-color="#7209B7"/>
    </linearGradient>

    <!-- Blue Gradient for Second S -->
    <linearGradient id="blue_gradient" x1="0" y1="0" x2="0" y2="100" gradientUnits="userSpaceOnUse">
      <stop stop-color="#48CAE4"/>
      <stop offset="1" stop-color="#0077B6"/>
    </linearGradient>

    <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
      <feMerge>
        <feMergeNode in="coloredBlur"/>
        <feMergeNode in="SourceGraphic"/>
      </feMerge>
    </filter>
  </defs>
  
  <!-- Shield Background -->
  <path d="M50 5 L90 20 V50 C90 75 50 95 50 95 C50 95 10 75 10 50 V20 L50 5 Z" 
        stroke="url(#shield_gradient)" stroke-width="3" fill="none" filter="url(#glow)"/>
        
  <!-- Side by Side SS (No Overlap) -->
  <g font-family="Arial, Helvetica, sans-serif" font-weight="900" font-size="45" text-anchor="middle">
    <!-- First S (Blue) -->
    <text x="35" y="65" fill="url(#blue_gradient)">S</text>
    
    <!-- Second S (Purple) -->
    <text x="65" y="65" fill="url(#purple_gradient)">S</text>
  </g>
</svg>
`;