import { Card, Religion } from '@/types/card';
import { allCards, getCardsByReligion } from '@/data/cards';

export type ChallengeType = 'random_mix' | 'speed_run' | 'perfect_streak' | 'religion_focus';

export interface DailyChallenge {
  id: string;
  type: ChallengeType;
  name: string;
  description: string;
  icon: string;
  targetCount: number;
  bonusXP: number;
  religion?: Religion;
}

// Generate a seeded random number for consistent daily challenges
function seededRandom(seed: number): () => number {
  return () => {
    seed = (seed * 1103515245 + 12345) & 0x7fffffff;
    return seed / 0x7fffffff;
  };
}

// Get today's date as a seed number
function getTodaySeed(): number {
  const today = new Date();
  return today.getFullYear() * 10000 + (today.getMonth() + 1) * 100 + today.getDate();
}

// Get the daily challenges for today
export function getDailyChallenges(): DailyChallenge[] {
  const seed = getTodaySeed();

  // Rotate through religions based on day
  const religions: Religion[] = ['judaism', 'christianity', 'islam'];
  const todaysReligion = religions[seed % 3];

  const challenges: DailyChallenge[] = [
    {
      id: `daily-mix-${seed}`,
      type: 'random_mix',
      name: 'Dagens utmaning',
      description: '10 slumpmässiga kort från alla religioner',
      icon: '🎯',
      targetCount: 10,
      bonusXP: 100,
    },
    {
      id: `daily-speed-${seed}`,
      type: 'speed_run',
      name: 'Snabbaste tiden',
      description: 'Svara på 5 kort så snabbt som möjligt',
      icon: '⚡',
      targetCount: 5,
      bonusXP: 75,
    },
    {
      id: `daily-perfect-${seed}`,
      type: 'perfect_streak',
      name: 'Felfritt',
      description: 'Klara 10 kort i rad utan fel',
      icon: '✨',
      targetCount: 10,
      bonusXP: 150,
    },
    {
      id: `daily-religion-${seed}`,
      type: 'religion_focus',
      name: getReligionDisplayName(todaysReligion),
      description: `Fokusera på ${getReligionDisplayName(todaysReligion).toLowerCase()} idag`,
      icon: getReligionIcon(todaysReligion),
      targetCount: 8,
      bonusXP: 100,
      religion: todaysReligion,
    },
  ];

  return challenges;
}

// Get cards for a specific challenge
export function getChallengeCards(challenge: DailyChallenge): Card[] {
  const seed = getTodaySeed();
  const random = seededRandom(seed + challenge.id.length);

  let cardPool: Card[];

  switch (challenge.type) {
    case 'religion_focus':
      cardPool = challenge.religion ? getCardsByReligion(challenge.religion) : allCards;
      break;
    case 'random_mix':
    case 'speed_run':
    case 'perfect_streak':
    default:
      cardPool = [...allCards];
      break;
  }

  // Shuffle using seeded random
  const shuffled = cardPool
    .map(card => ({ card, sort: random() }))
    .sort((a, b) => a.sort - b.sort)
    .map(({ card }) => card);

  return shuffled.slice(0, challenge.targetCount);
}

// Helper functions
function getReligionDisplayName(religion: Religion): string {
  const names: Record<Religion, string> = {
    judaism: 'Judendom',
    christianity: 'Kristendom',
    islam: 'Islam',
    shared: 'Gemensamt',
  };
  return names[religion];
}

function getReligionIcon(religion: Religion): string {
  const icons: Record<Religion, string> = {
    judaism: '✡️',
    christianity: '✝️',
    islam: '☪️',
    shared: '🌟',
  };
  return icons[religion];
}

// Check if a challenge has been completed today
export function isChallengeCompletedToday(
  challengeId: string,
  completedChallenges: Record<string, string>
): boolean {
  const today = new Date().toISOString().split('T')[0];
  return completedChallenges[challengeId] === today;
}

// Get time until next daily reset (midnight)
export function getTimeUntilReset(): { hours: number; minutes: number } {
  const now = new Date();
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(0, 0, 0, 0);

  const diff = tomorrow.getTime() - now.getTime();
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

  return { hours, minutes };
}
