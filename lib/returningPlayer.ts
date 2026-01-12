// Helper functions for detecting and handling returning players

export interface ReturningPlayerStatus {
  isReturning: boolean;
  daysAway: number;
  streakStatus: 'maintained' | 'broken' | 'new';
  previousStreak: number;
}

// Get today's date as YYYY-MM-DD string
function getTodayString(): string {
  return new Date().toISOString().split('T')[0];
}

// Calculate days between two dates (ignoring time)
function daysBetween(date1: Date, date2: Date): number {
  const oneDay = 24 * 60 * 60 * 1000;
  const d1 = new Date(date1.getFullYear(), date1.getMonth(), date1.getDate());
  const d2 = new Date(date2.getFullYear(), date2.getMonth(), date2.getDate());
  return Math.round(Math.abs((d2.getTime() - d1.getTime()) / oneDay));
}

// Get returning player status
export function getReturningPlayerStatus(
  lastPlayDate: string | null,
  currentDailyStreak: number
): ReturningPlayerStatus {
  // First time player
  if (!lastPlayDate) {
    return {
      isReturning: false,
      daysAway: 0,
      streakStatus: 'new',
      previousStreak: 0,
    };
  }

  const last = new Date(lastPlayDate);
  const now = new Date();
  const daysAway = daysBetween(last, now);

  // Same day - not a returning player
  if (daysAway === 0) {
    return {
      isReturning: false,
      daysAway: 0,
      streakStatus: 'maintained',
      previousStreak: currentDailyStreak,
    };
  }

  // Streak maintained only if played yesterday (daysAway === 1)
  const streakMaintained = daysAway === 1;

  let streakStatus: 'maintained' | 'broken' | 'new';
  if (streakMaintained) {
    streakStatus = 'maintained';
  } else if (currentDailyStreak > 0) {
    streakStatus = 'broken';
  } else {
    streakStatus = 'new';
  }

  return {
    isReturning: true,
    daysAway,
    streakStatus,
    previousStreak: currentDailyStreak,
  };
}

// Storage key for welcome back modal shown today
const WELCOME_BACK_KEY = 'welcomeBackShownDate';

// Check if welcome back modal was already shown today
export function wasWelcomeBackShownToday(): boolean {
  if (typeof window === 'undefined') return true;

  const shownDate = localStorage.getItem(WELCOME_BACK_KEY);
  return shownDate === getTodayString();
}

// Mark welcome back modal as shown today
export function markWelcomeBackShown(): void {
  if (typeof window === 'undefined') return;

  localStorage.setItem(WELCOME_BACK_KEY, getTodayString());
}
