import { Level } from '@/types/level';

export interface ReligionTheme {
  // Background
  bgGradient: string;
  bgFrom: string;
  bgVia?: string;
  bgTo: string;

  // Card styling
  cardBorder: string;
  cardAccent: string;
  cardGlow: string;

  // Progress bar
  progressFrom: string;
  progressTo: string;

  // Text colors
  textPrimary: string;
  textSecondary: string;

  // Particles
  particleColors: string[];
  particleEmojis: string[];
}

export const religionThemes: Record<Level['religion'], ReligionTheme> = {
  judaism: {
    bgGradient: 'from-amber-50 via-yellow-50 to-blue-50',
    bgFrom: 'rgb(255 251 235)', // amber-50
    bgVia: 'rgb(254 252 232)', // yellow-50
    bgTo: 'rgb(239 246 255)', // blue-50
    cardBorder: 'border-blue-400',
    cardAccent: 'from-blue-400 to-blue-600',
    cardGlow: 'shadow-blue-200',
    progressFrom: 'from-blue-500',
    progressTo: 'to-yellow-500',
    textPrimary: 'text-blue-800',
    textSecondary: 'text-blue-600',
    particleColors: ['bg-blue-300', 'bg-yellow-300', 'bg-blue-400', 'bg-amber-300'],
    particleEmojis: ['✡️', '🌟', '✨', '💫'],
  },

  christianity: {
    bgGradient: 'from-yellow-50 via-orange-50 to-amber-50',
    bgFrom: 'rgb(254 252 232)', // yellow-50
    bgVia: 'rgb(255 247 237)', // orange-50
    bgTo: 'rgb(255 251 235)', // amber-50
    cardBorder: 'border-yellow-500',
    cardAccent: 'from-yellow-400 to-orange-500',
    cardGlow: 'shadow-yellow-200',
    progressFrom: 'from-yellow-400',
    progressTo: 'to-orange-500',
    textPrimary: 'text-orange-800',
    textSecondary: 'text-orange-600',
    particleColors: ['bg-yellow-300', 'bg-orange-300', 'bg-amber-300', 'bg-yellow-400'],
    particleEmojis: ['✝️', '🕊️', '✨', '🌟'],
  },

  islam: {
    bgGradient: 'from-green-50 via-emerald-50 to-teal-50',
    bgFrom: 'rgb(240 253 244)', // green-50
    bgVia: 'rgb(236 253 245)', // emerald-50
    bgTo: 'rgb(240 253 250)', // teal-50
    cardBorder: 'border-green-500',
    cardAccent: 'from-green-400 to-green-600',
    cardGlow: 'shadow-green-200',
    progressFrom: 'from-green-500',
    progressTo: 'to-emerald-500',
    textPrimary: 'text-green-800',
    textSecondary: 'text-green-600',
    particleColors: ['bg-green-300', 'bg-emerald-300', 'bg-teal-300', 'bg-green-400'],
    particleEmojis: ['☪️', '🌙', '✨', '🌟'],
  },

  shared: {
    bgGradient: 'from-purple-50 via-indigo-50 to-pink-50',
    bgFrom: 'rgb(250 245 255)', // purple-50
    bgVia: 'rgb(238 242 255)', // indigo-50
    bgTo: 'rgb(253 242 248)', // pink-50
    cardBorder: 'border-purple-400',
    cardAccent: 'from-purple-400 to-purple-600',
    cardGlow: 'shadow-purple-200',
    progressFrom: 'from-purple-500',
    progressTo: 'to-pink-500',
    textPrimary: 'text-purple-800',
    textSecondary: 'text-purple-600',
    particleColors: ['bg-purple-300', 'bg-indigo-300', 'bg-pink-300', 'bg-violet-300'],
    particleEmojis: ['🌟', '✨', '💫', '⭐'],
  },
};

export function getThemeForReligion(religion: Level['religion']): ReligionTheme {
  return religionThemes[religion];
}
