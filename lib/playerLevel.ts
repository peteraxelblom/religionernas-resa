/**
 * Player Level System
 *
 * Converts XP into meaningful player levels with rewards.
 * Based on Dan Cook's Skill Atoms and Raph Koster's Theory of Fun.
 */

export interface PlayerLevel {
  level: number;
  title: string;
  xpInCurrentLevel: number;
  xpRequiredForNext: number;
  progressPercent: number;
  totalXP: number;
}

export interface Reward {
  id: string;
  name: string;
  description: string;
  effect: RewardEffect;
  icon: string;
  unlockedAtLevel: number;
}

export type RewardEffect =
  | 'freeHintPerLevel'    // Level 2: One free hint per level
  | 'streakShield'        // Level 4: One streak protection per session
  | 'xpBoost10'           // Level 6: +10% XP from all sources
  | 'bossExtraLife'       // Level 8: Start boss with 4 lives
  | 'doubleMasteryXP'     // Level 12: 2x XP when mastering cards
  | 'speedBonus'          // Level 20: Bonus XP for fast answers
  | 'perfectLevelBonus'   // Level 22: Bonus XP for 100% on a level
  | 'dailyChallengeBoost';// Level 24: Double XP from daily challenges

// XP required to reach each level (cumulative)
// Gentle exponential curve - early levels come fast
const LEVEL_THRESHOLDS: number[] = [
  0,      // Level 1
  100,    // Level 2  (~1 level completed)
  250,    // Level 3  (~2 levels)
  450,    // Level 4  (~3 levels)
  750,    // Level 5  (~5 levels + some mastery)
  1100,   // Level 6
  1500,   // Level 7
  2000,   // Level 8
  2600,   // Level 9
  3300,   // Level 10 (~15 levels)
  4100,   // Level 11
  5000,   // Level 12
  6000,   // Level 13
  7100,   // Level 14
  8300,   // Level 15 (~25 levels)
  9600,   // Level 16
  11000,  // Level 17
  12500,  // Level 18
  14100,  // Level 19
  15800,  // Level 20 (near completion)
  17600,  // Level 21
  19500,  // Level 22
  21500,  // Level 23
  23600,  // Level 24
  25800,  // Level 25 (full mastery)
];

// Titles unlocked at specific levels
const LEVEL_TITLES: Record<number, string> = {
  1: 'Nybörjare',        // Beginner
  3: 'Läsare',           // Reader
  5: 'Student',          // Student
  7: 'Forskare',         // Researcher
  10: 'Kunskapsälskare', // Knowledge Lover
  15: 'Mästare',         // Master
  20: 'Visdomssökare',   // Wisdom Seeker
  21: 'Tänkare',         // Thinker
  22: 'Filosof',         // Philosopher
  23: 'Vägledare',       // Guide
  24: 'Mentor',          // Mentor
  25: 'Religionsexpert', // Religion Expert
};

// Functional rewards unlocked at specific levels
const LEVEL_REWARDS: Reward[] = [
  {
    id: 'bonus-hint',
    name: 'Bonustips',
    description: 'Få ett gratis tips varje nivå',
    effect: 'freeHintPerLevel',
    icon: '💡',
    unlockedAtLevel: 2,
  },
  {
    id: 'streak-shield',
    name: 'Streak-sköld',
    description: 'Skydda din streak mot en miss en gång',
    effect: 'streakShield',
    icon: '🛡️',
    unlockedAtLevel: 4,
  },
  {
    id: 'xp-boost',
    name: 'XP-boost',
    description: '+10% XP från alla aktiviteter',
    effect: 'xpBoost10',
    icon: '⚡',
    unlockedAtLevel: 6,
  },
  {
    id: 'extra-life',
    name: 'Extraliv',
    description: 'Börja bossstrider med 4 liv istället för 3',
    effect: 'bossExtraLife',
    icon: '❤️',
    unlockedAtLevel: 8,
  },
  {
    id: 'double-mastery',
    name: 'Dubbel behärskning',
    description: '2x XP när du behärskar kort',
    effect: 'doubleMasteryXP',
    icon: '🎯',
    unlockedAtLevel: 12,
  },
  {
    id: 'speed-bonus',
    name: 'Snabbhetsbonus',
    description: 'Extra XP för snabba rätta svar',
    effect: 'speedBonus',
    icon: '⏱️',
    unlockedAtLevel: 20,
  },
  {
    id: 'perfect-level-bonus',
    name: 'Perfektionsbonus',
    description: '+25 XP när du klarar en nivå med 100%',
    effect: 'perfectLevelBonus',
    icon: '💎',
    unlockedAtLevel: 22,
  },
  {
    id: 'daily-challenge-boost',
    name: 'Utmaningsexpert',
    description: '2x XP från dagliga utmaningar',
    effect: 'dailyChallengeBoost',
    icon: '🏆',
    unlockedAtLevel: 24,
  },
];

/**
 * Calculate player level from total XP
 */
export function calculatePlayerLevel(totalXP: number): PlayerLevel {
  let level = 1;

  // Find the highest level the player has reached
  for (let i = 0; i < LEVEL_THRESHOLDS.length; i++) {
    if (totalXP >= LEVEL_THRESHOLDS[i]) {
      level = i + 1;
    } else {
      break;
    }
  }

  // Cap at max level
  const maxLevel = LEVEL_THRESHOLDS.length;
  level = Math.min(level, maxLevel);

  // Calculate XP within current level
  const currentLevelThreshold = LEVEL_THRESHOLDS[level - 1] || 0;
  const nextLevelThreshold = LEVEL_THRESHOLDS[level] || LEVEL_THRESHOLDS[maxLevel - 1];

  const xpInCurrentLevel = totalXP - currentLevelThreshold;
  const xpRequiredForNext = nextLevelThreshold - currentLevelThreshold;

  // At max level, show 100% progress
  const progressPercent = level >= maxLevel
    ? 100
    : Math.min(100, Math.round((xpInCurrentLevel / xpRequiredForNext) * 100));

  return {
    level,
    title: getTitleForLevel(level),
    xpInCurrentLevel,
    xpRequiredForNext,
    progressPercent,
    totalXP,
  };
}

/**
 * Get the title for a given level
 */
export function getTitleForLevel(level: number): string {
  // Find the highest title at or below the current level
  let title = LEVEL_TITLES[1];

  for (const [lvl, t] of Object.entries(LEVEL_TITLES)) {
    if (parseInt(lvl) <= level) {
      title = t;
    }
  }

  return title;
}

/**
 * Get XP required to reach a specific level
 */
export function getXPForLevel(level: number): number {
  if (level <= 1) return 0;
  if (level > LEVEL_THRESHOLDS.length) return LEVEL_THRESHOLDS[LEVEL_THRESHOLDS.length - 1];
  return LEVEL_THRESHOLDS[level - 1];
}

/**
 * Get all rewards unlocked at or below a level
 */
export function getUnlockedRewards(level: number): Reward[] {
  return LEVEL_REWARDS.filter(reward => reward.unlockedAtLevel <= level);
}

/**
 * Get the reward unlocked at a specific level (if any)
 */
export function getRewardAtLevel(level: number): Reward | null {
  return LEVEL_REWARDS.find(reward => reward.unlockedAtLevel === level) || null;
}

/**
 * Check if a specific reward effect is unlocked
 */
export function hasRewardEffect(level: number, effect: RewardEffect): boolean {
  return LEVEL_REWARDS.some(
    reward => reward.effect === effect && reward.unlockedAtLevel <= level
  );
}

/**
 * Get the next reward the player will unlock
 */
export function getNextReward(level: number): Reward | null {
  return LEVEL_REWARDS.find(reward => reward.unlockedAtLevel > level) || null;
}

/**
 * Get all level titles
 */
export function getAllTitles(): { level: number; title: string }[] {
  return Object.entries(LEVEL_TITLES).map(([level, title]) => ({
    level: parseInt(level),
    title,
  }));
}

/**
 * Get max level
 */
export function getMaxLevel(): number {
  return LEVEL_THRESHOLDS.length;
}

/**
 * Apply XP boost if player has the reward
 */
export function applyXPBoost(xp: number, playerLevel: number): number {
  if (hasRewardEffect(playerLevel, 'xpBoost10')) {
    return Math.round(xp * 1.1);
  }
  return xp;
}

/**
 * Apply double mastery XP if player has the reward
 */
export function applyMasteryBonus(xp: number, playerLevel: number): number {
  if (hasRewardEffect(playerLevel, 'doubleMasteryXP')) {
    return xp * 2;
  }
  return xp;
}

/**
 * Calculate speed bonus for fast answers on known cards
 * Only applies to cards in 'reviewing' or 'mastered' bucket to prevent gaming
 *
 * @returns Object with bonus XP amount and whether bonus was applied
 */
export function calculateSpeedBonus(
  baseXP: number,
  playerLevel: number,
  responseTimeMs: number,
  cardBucket: string
): { bonusXP: number; wasSpeedBonus: boolean } {
  const SPEED_THRESHOLD_MS = 3000; // 3 seconds
  const SPEED_BONUS_AMOUNT = 5; // Flat bonus for fast answers on known cards

  // Only apply speed bonus if:
  // 1. Player has unlocked the reward (Level 20+)
  // 2. Answer was fast enough
  // 3. Card is in reviewing or mastered bucket (player already knows it)
  if (
    hasRewardEffect(playerLevel, 'speedBonus') &&
    responseTimeMs < SPEED_THRESHOLD_MS &&
    (cardBucket === 'reviewing' || cardBucket === 'mastered')
  ) {
    return { bonusXP: SPEED_BONUS_AMOUNT, wasSpeedBonus: true };
  }

  return { bonusXP: 0, wasSpeedBonus: false };
}

/**
 * Calculate perfect level bonus for 100% accuracy
 * @returns Bonus XP amount (25 XP if reward unlocked and player got 100%)
 */
export function calculatePerfectLevelBonus(
  playerLevel: number,
  correctAnswers: number,
  totalQuestions: number
): number {
  const PERFECT_BONUS_AMOUNT = 25;

  if (
    hasRewardEffect(playerLevel, 'perfectLevelBonus') &&
    correctAnswers === totalQuestions &&
    totalQuestions > 0
  ) {
    return PERFECT_BONUS_AMOUNT;
  }

  return 0;
}

/**
 * Apply daily challenge XP boost if player has the reward
 * @returns XP amount (doubled if reward unlocked)
 */
export function applyDailyChallengeBoost(xp: number, playerLevel: number): number {
  if (hasRewardEffect(playerLevel, 'dailyChallengeBoost')) {
    return xp * 2;
  }
  return xp;
}
