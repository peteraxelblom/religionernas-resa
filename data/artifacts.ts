import { Religion } from '@/types/card';

export interface Artifact {
  id: string;
  name: string;
  description: string;
  religion: Religion;
  emoji: string;
  requiredMasteredCards: number;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

export const artifacts: Artifact[] = [
  // Shared/Beginning artifacts
  {
    id: 'scroll',
    name: 'Forntida Skriftrulle',
    description: 'En skriftrulle med de abrahamitiska religionernas ursprung',
    religion: 'shared',
    emoji: '📜',
    requiredMasteredCards: 5,
    rarity: 'common',
  },
  {
    id: 'star',
    name: 'Abrahamsstjärnan',
    description: 'Symbolen för de tre religionernas gemensamma ursprung',
    religion: 'shared',
    emoji: '⭐',
    requiredMasteredCards: 15,
    rarity: 'rare',
  },

  // Judaism artifacts
  {
    id: 'menorah',
    name: 'Menora',
    description: 'Den sjuarmade ljusstaken - judisk symbol',
    religion: 'judaism',
    emoji: '🕎',
    requiredMasteredCards: 10,
    rarity: 'common',
  },
  {
    id: 'torah-scroll',
    name: 'Torahrulle',
    description: 'Den heliga skriften med Mose fem böcker',
    religion: 'judaism',
    emoji: '📖',
    requiredMasteredCards: 25,
    rarity: 'rare',
  },
  {
    id: 'star-of-david',
    name: 'Davidsstjärnan',
    description: 'Den sexuddiga stjärnan - symbol för judendom',
    religion: 'judaism',
    emoji: '✡️',
    requiredMasteredCards: 40,
    rarity: 'epic',
  },

  // Christianity artifacts
  {
    id: 'cross',
    name: 'Korset',
    description: 'Kristendomens viktigaste symbol',
    religion: 'christianity',
    emoji: '✝️',
    requiredMasteredCards: 10,
    rarity: 'common',
  },
  {
    id: 'bible',
    name: 'Bibeln',
    description: 'Gamla och Nya Testamentet samlade',
    religion: 'christianity',
    emoji: '📕',
    requiredMasteredCards: 25,
    rarity: 'rare',
  },
  {
    id: 'dove',
    name: 'Fredsduvan',
    description: 'Symbol för den Helige Ande och fred',
    religion: 'christianity',
    emoji: '🕊️',
    requiredMasteredCards: 40,
    rarity: 'epic',
  },

  // Islam artifacts
  {
    id: 'crescent',
    name: 'Halvmånen',
    description: 'Symbol för islam och den muslimska tron',
    religion: 'islam',
    emoji: '☪️',
    requiredMasteredCards: 10,
    rarity: 'common',
  },
  {
    id: 'quran',
    name: 'Koranen',
    description: 'Islams heliga bok med Allahs ord',
    religion: 'islam',
    emoji: '📗',
    requiredMasteredCards: 25,
    rarity: 'rare',
  },
  {
    id: 'kaaba',
    name: 'Kaba',
    description: 'Den heliga byggnaden i Mecka',
    religion: 'islam',
    emoji: '🕋',
    requiredMasteredCards: 40,
    rarity: 'epic',
  },

  // Legendary cross-religion artifacts
  {
    id: 'wisdom-lamp',
    name: 'Vishetens Lampa',
    description: 'Symbol för kunskap som lyser genom alla religioner',
    religion: 'shared',
    emoji: '🪔',
    requiredMasteredCards: 60,
    rarity: 'legendary',
  },
  {
    id: 'unity-globe',
    name: 'Enhetens Glob',
    description: 'Världen förenad genom förståelse',
    religion: 'shared',
    emoji: '🌍',
    requiredMasteredCards: 80,
    rarity: 'legendary',
  },
  {
    id: 'master-key',
    name: 'Mästarens Nyckel',
    description: 'Låser upp alla religionernas hemligheter',
    religion: 'shared',
    emoji: '🗝️',
    requiredMasteredCards: 100,
    rarity: 'legendary',
  },
];

// Get artifacts unlocked by mastered card count
export function getUnlockedArtifacts(masteredCardCount: number): Artifact[] {
  return artifacts.filter(a => masteredCardCount >= a.requiredMasteredCards);
}

// Get next artifact to unlock
export function getNextArtifact(masteredCardCount: number): Artifact | null {
  const locked = artifacts
    .filter(a => masteredCardCount < a.requiredMasteredCards)
    .sort((a, b) => a.requiredMasteredCards - b.requiredMasteredCards);
  return locked[0] || null;
}

// Get progress toward next artifact
export function getArtifactProgress(masteredCardCount: number): {
  current: number;
  required: number;
  percentage: number;
  artifact: Artifact | null;
} {
  const next = getNextArtifact(masteredCardCount);
  if (!next) {
    return { current: masteredCardCount, required: masteredCardCount, percentage: 100, artifact: null };
  }

  // Find previous milestone
  const unlocked = getUnlockedArtifacts(masteredCardCount);
  const prevMilestone = unlocked.length > 0
    ? Math.max(...unlocked.map(a => a.requiredMasteredCards))
    : 0;

  const current = masteredCardCount - prevMilestone;
  const required = next.requiredMasteredCards - prevMilestone;
  const percentage = Math.round((current / required) * 100);

  return { current, required, percentage, artifact: next };
}

// Get rarity color
export function getRarityColor(rarity: Artifact['rarity']): string {
  switch (rarity) {
    case 'common': return 'text-gray-600 bg-gray-100 border-gray-300';
    case 'rare': return 'text-blue-600 bg-blue-100 border-blue-300';
    case 'epic': return 'text-purple-600 bg-purple-100 border-purple-300';
    case 'legendary': return 'text-amber-600 bg-amber-100 border-amber-300';
  }
}

// Get rarity label
export function getRarityLabel(rarity: Artifact['rarity']): string {
  switch (rarity) {
    case 'common': return 'Vanlig';
    case 'rare': return 'Sällsynt';
    case 'epic': return 'Episk';
    case 'legendary': return 'Legendarisk';
  }
}
