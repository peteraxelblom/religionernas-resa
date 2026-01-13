/**
 * Avatar options for player customization
 * Each avatar has an emoji representation and theme colors
 */

export interface Avatar {
  id: string;
  emoji: string;
  name: string;
  description: string;
  primaryColor: string;
  secondaryColor: string;
}

export const avatars: Avatar[] = [
  {
    id: 'explorer',
    emoji: '🧑‍🎓',
    name: 'Utforskaren',
    description: 'Nyfiken och alltid redo att lära sig',
    primaryColor: '#8b5cf6', // purple-500
    secondaryColor: '#a78bfa', // purple-400
  },
  {
    id: 'sage',
    emoji: '🧙',
    name: 'Den vise',
    description: 'Söker visdom från alla traditioner',
    primaryColor: '#3b82f6', // blue-500
    secondaryColor: '#60a5fa', // blue-400
  },
  {
    id: 'pilgrim',
    emoji: '🚶',
    name: 'Pilgrimen',
    description: 'Vandrar på kunskapens väg',
    primaryColor: '#10b981', // emerald-500
    secondaryColor: '#34d399', // emerald-400
  },
  {
    id: 'scholar',
    emoji: '📚',
    name: 'Forskaren',
    description: 'Gräver djupt i texterna',
    primaryColor: '#f59e0b', // amber-500
    secondaryColor: '#fbbf24', // amber-400
  },
  {
    id: 'seeker',
    emoji: '🔍',
    name: 'Sökaren',
    description: 'Letar efter sanningen',
    primaryColor: '#ec4899', // pink-500
    secondaryColor: '#f472b6', // pink-400
  },
  {
    id: 'star',
    emoji: '⭐',
    name: 'Stjärnan',
    description: 'Lyser med kunskap',
    primaryColor: '#eab308', // yellow-500
    secondaryColor: '#facc15', // yellow-400
  },
];

export const getAvatarById = (id: string): Avatar | undefined => {
  return avatars.find(a => a.id === id);
};

export const defaultAvatarId = 'explorer';
