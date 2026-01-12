import { Card, Religion } from '@/types/card';
import { allCards, getCardsByReligion } from '@/data/cards';

export type ChallengeType = 'random_mix' | 'speed_run' | 'perfect_streak' | 'religion_focus' | 'themed_event';

export interface DailyChallenge {
  id: string;
  type: ChallengeType;
  name: string;
  description: string;
  icon: string;
  targetCount: number;
  bonusXP: number;
  religion?: Religion;
  isSpecialEvent?: boolean;
  eventName?: string;
}

// Themed events/holidays for special challenges
interface ThemedEvent {
  name: string;
  icon: string;
  religion: Religion;
  description: string;
  bonusMultiplier: number; // Extra XP during event
  // Date range: month (1-12), day
  startMonth: number;
  startDay: number;
  endMonth: number;
  endDay: number;
}

// Religious holidays and special events (approximate dates)
const THEMED_EVENTS: ThemedEvent[] = [
  // Judaism
  {
    name: 'Chanukka',
    icon: '🕎',
    religion: 'judaism',
    description: 'Ljusets fest - 8 dagar av firande',
    bonusMultiplier: 1.5,
    startMonth: 12,
    startDay: 10,
    endMonth: 12,
    endDay: 18,
  },
  {
    name: 'Pesach',
    icon: '🍷',
    religion: 'judaism',
    description: 'Påskhögtiden - firande av befrielsen',
    bonusMultiplier: 1.5,
    startMonth: 4,
    startDay: 5,
    endMonth: 4,
    endDay: 13,
  },
  {
    name: 'Rosh Hashana',
    icon: '🍎',
    religion: 'judaism',
    description: 'Judiskt nyår',
    bonusMultiplier: 1.5,
    startMonth: 9,
    startDay: 15,
    endMonth: 9,
    endDay: 17,
  },

  // Christianity
  {
    name: 'Jul',
    icon: '🎄',
    religion: 'christianity',
    description: 'Firande av Jesu födelse',
    bonusMultiplier: 1.5,
    startMonth: 12,
    startDay: 20,
    endMonth: 12,
    endDay: 26,
  },
  {
    name: 'Påsk',
    icon: '🐣',
    religion: 'christianity',
    description: 'Firande av uppståndelsen',
    bonusMultiplier: 1.5,
    startMonth: 3,
    startDay: 28,
    endMonth: 4,
    endDay: 5,
  },
  {
    name: 'Pingst',
    icon: '🕊️',
    religion: 'christianity',
    description: 'Den heliga andens utgjutelse',
    bonusMultiplier: 1.3,
    startMonth: 5,
    startDay: 15,
    endMonth: 5,
    endDay: 20,
  },

  // Islam
  {
    name: 'Ramadan',
    icon: '🌙',
    religion: 'islam',
    description: 'Fastemånaden - tid för reflektion',
    bonusMultiplier: 1.5,
    startMonth: 3,
    startDay: 10,
    endMonth: 4,
    endDay: 9,
  },
  {
    name: 'Eid al-Fitr',
    icon: '🎊',
    religion: 'islam',
    description: 'Festen efter Ramadan',
    bonusMultiplier: 2.0,
    startMonth: 4,
    startDay: 10,
    endMonth: 4,
    endDay: 12,
  },
  {
    name: 'Eid al-Adha',
    icon: '🐑',
    religion: 'islam',
    description: 'Offerfesten',
    bonusMultiplier: 1.5,
    startMonth: 6,
    startDay: 16,
    endMonth: 6,
    endDay: 19,
  },

  // Shared/Educational
  {
    name: 'Interreligiös vecka',
    icon: '🤝',
    religion: 'shared',
    description: 'Utforska likheter mellan religionerna',
    bonusMultiplier: 1.3,
    startMonth: 2,
    startDay: 1,
    endMonth: 2,
    endDay: 7,
  },
];

// Check if a date falls within an event's range
function isDateInEventRange(date: Date, event: ThemedEvent): boolean {
  const month = date.getMonth() + 1; // 1-12
  const day = date.getDate();

  // Handle events that don't cross year boundary
  if (event.startMonth <= event.endMonth) {
    if (month < event.startMonth || month > event.endMonth) return false;
    if (month === event.startMonth && day < event.startDay) return false;
    if (month === event.endMonth && day > event.endDay) return false;
    return true;
  }

  // Handle events crossing year boundary (e.g., Dec-Jan)
  if (month >= event.startMonth) {
    if (month === event.startMonth && day < event.startDay) return false;
    return true;
  }
  if (month <= event.endMonth) {
    if (month === event.endMonth && day > event.endDay) return false;
    return true;
  }

  return false;
}

// Get active themed events for today
export function getActiveThemedEvents(date: Date = new Date()): ThemedEvent[] {
  return THEMED_EVENTS.filter(event => isDateInEventRange(date, event));
}

// Get today's date as YYYY-MM-DD string
function getTodayString(): string {
  return new Date().toISOString().split('T')[0];
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
  const today = new Date();
  const activeEvents = getActiveThemedEvents(today);

  // Rotate through religions based on day
  const religions: Religion[] = ['judaism', 'christianity', 'islam'];
  const todaysReligion = religions[seed % 3];

  const challenges: DailyChallenge[] = [];

  // Add themed event challenges first (they're special!)
  activeEvents.forEach((event, index) => {
    const bonusXP = Math.round(150 * event.bonusMultiplier);
    challenges.push({
      id: `event-${event.name.toLowerCase().replace(/\s+/g, '-')}-${seed}`,
      type: 'themed_event',
      name: `${event.name} Special`,
      description: event.description,
      icon: event.icon,
      targetCount: 12,
      bonusXP,
      religion: event.religion,
      isSpecialEvent: true,
      eventName: event.name,
    });

    // Add a second themed challenge for major events
    if (event.bonusMultiplier >= 1.5 && index === 0) {
      challenges.push({
        id: `event-master-${event.name.toLowerCase().replace(/\s+/g, '-')}-${seed}`,
        type: 'themed_event',
        name: `${event.name} Mästare`,
        description: `Klara 15 kort utan fel - ${event.name} edition`,
        icon: '🏆',
        targetCount: 15,
        bonusXP: Math.round(250 * event.bonusMultiplier),
        religion: event.religion,
        isSpecialEvent: true,
        eventName: event.name,
      });
    }
  });

  // Add standard challenges
  challenges.push(
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
  );

  return challenges;
}

// Get cards for a specific challenge
export function getChallengeCards(challenge: DailyChallenge): Card[] {
  const seed = getTodaySeed();
  const random = seededRandom(seed + challenge.id.length);

  // Religion-specific challenges use filtered cards, others use all cards
  const usesReligionFilter =
    challenge.type === 'religion_focus' || challenge.type === 'themed_event';
  const hasSpecificReligion =
    challenge.religion && challenge.religion !== 'shared';

  const cardPool =
    usesReligionFilter && hasSpecificReligion
      ? getCardsByReligion(challenge.religion!)
      : [...allCards];

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
  return completedChallenges[challengeId] === getTodayString();
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
