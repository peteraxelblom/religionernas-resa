import { Card } from '@/types/card';
import { sharedCards } from './shared';
import { judaismCards } from './judaism';
import { christianityCards } from './christianity';
import { islamCards } from './islam';
import { comparisonCards } from './comparisons';

// Export all cards combined
export const allCards: Card[] = [
  ...sharedCards,
  ...judaismCards,
  ...christianityCards,
  ...islamCards,
  ...comparisonCards,
];

// Export individual card sets
export { sharedCards, judaismCards, christianityCards, islamCards, comparisonCards };

// Helper functions
export function getCardById(id: string): Card | undefined {
  return allCards.find(card => card.id === id);
}

export function getCardsByLevel(levelId: string): Card[] {
  return allCards.filter(card => card.levelId === levelId);
}

export function getCardsByReligion(religion: Card['religion']): Card[] {
  return allCards.filter(card => card.religion === religion);
}

export function getCardsByDifficulty(difficulty: Card['difficulty']): Card[] {
  return allCards.filter(card => card.difficulty === difficulty);
}

export function getCardsByCategory(category: string): Card[] {
  return allCards.filter(card => card.category === category);
}

export function getCardsByReligionAndCategory(religion: Card['religion'], category: string): Card[] {
  return allCards.filter(card => card.religion === religion && card.category === category);
}

// Get all unique categories
export function getAllCategories(): string[] {
  return [...new Set(allCards.map(card => card.category))].sort();
}

// Get categories for a specific religion
export function getCategoriesByReligion(religion: Card['religion']): string[] {
  return [...new Set(
    allCards
      .filter(card => card.religion === religion)
      .map(card => card.category)
  )].sort();
}

// Category display names in Swedish
export const categoryDisplayNames: Record<string, string> = {
  historia: 'Historia',
  tro: 'Tro & lära',
  regler: 'Regler & lagar',
  skrifter: 'Heliga skrifter',
  platser: 'Heliga platser',
  personer: 'Viktiga personer',
  symboler: 'Symboler',
  hogtider: 'Högtider',
  ceremonier: 'Ceremonier',
  riktningar: 'Riktningar',
  grundbegrepp: 'Grundbegrepp',
  profeter: 'Profeter',
  bocker: 'Böcker',
  gudstjanst: 'Gudstjänst',
  livscykel: 'Livscykel',
  heliga_platser: 'Heliga platser',
  viktiga_personer: 'Viktiga personer',
  jamforelser: 'Jämförelser',
};

// Card statistics
export const cardStats = {
  total: allCards.length,
  byReligion: {
    shared: sharedCards.length,
    judaism: judaismCards.length,
    christianity: christianityCards.length,
    islam: islamCards.length,
    comparison: comparisonCards.length,
  },
  byCategory: getAllCategories().reduce((acc, cat) => {
    acc[cat] = getCardsByCategory(cat).length;
    return acc;
  }, {} as Record<string, number>),
};
