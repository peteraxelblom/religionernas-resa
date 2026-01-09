import { Card, CardProgress } from '@/types/card';

/**
 * Phase 3: Boss Battle Special Mechanics
 *
 * Features:
 * - Speed rounds: Time-limited questions for bonus damage
 * - Critical hits: Random chance for extra damage on streaks
 * - Shield rounds: Answer correctly to block boss attack
 * - Boss attacks: Lose life faster when struggling
 */

export type BossEventType = 'speed_round' | 'critical_hit' | 'shield_round' | 'boss_rage' | 'normal';

export interface BossEvent {
  type: BossEventType;
  description: string;
  timeLimit?: number; // milliseconds for speed rounds
  bonusDamage?: number;
  requiredStreak?: number; // for shield rounds
}

export interface BossRoundResult {
  damage: number;
  bonusPoints: number;
  eventTriggered: BossEventType | null;
  criticalHit: boolean;
  shieldActive: boolean;
  message: string | null;
}

// Random events that can occur during boss battles
export function generateBossEvent(
  streak: number,
  bossHealthPercent: number,
  roundNumber: number
): BossEvent {
  // Speed round - every 5th question with increasing frequency
  if (roundNumber > 0 && roundNumber % 5 === 0) {
    return {
      type: 'speed_round',
      description: '⚡ SNABBFRÅGA! Svara inom 5 sekunder för dubbel skada!',
      timeLimit: 5000,
      bonusDamage: 1,
    };
  }

  // Shield round - when on a 3+ streak
  if (streak >= 3 && Math.random() < 0.3) {
    return {
      type: 'shield_round',
      description: '🛡️ SKYDDSFRÅGA! Svara rätt för att blockera bossens nästa attack!',
      requiredStreak: 1,
    };
  }

  // Boss rage - when boss is low health
  if (bossHealthPercent < 30 && Math.random() < 0.4) {
    return {
      type: 'boss_rage',
      description: '😤 BOSSENS RASERI! Bossen attackerar hårdare - var försiktig!',
    };
  }

  return { type: 'normal', description: '' };
}

/**
 * Calculate damage and bonuses for a correct answer
 */
export function calculateBossDamage(
  correct: boolean,
  responseTimeMs: number,
  streak: number,
  currentEvent: BossEvent,
  hasShield: boolean
): BossRoundResult {
  if (!correct) {
    return {
      damage: 0,
      bonusPoints: 0,
      eventTriggered: currentEvent.type !== 'normal' ? currentEvent.type : null,
      criticalHit: false,
      shieldActive: false,
      message: hasShield ? '🛡️ Skölden blockerade bossens attack!' : null,
    };
  }

  let damage = 1;
  let bonusPoints = 0;
  let criticalHit = false;
  let message: string | null = null;

  // Speed round bonus
  if (currentEvent.type === 'speed_round' && currentEvent.timeLimit) {
    if (responseTimeMs < currentEvent.timeLimit) {
      damage += currentEvent.bonusDamage || 1;
      bonusPoints += 100;
      message = '⚡ SNABBT! Dubbel skada!';
    }
  }

  // Critical hit chance (increases with streak)
  const critChance = Math.min(0.1 + streak * 0.05, 0.5); // 10% base + 5% per streak, max 50%
  if (Math.random() < critChance) {
    criticalHit = true;
    damage += 1;
    bonusPoints += 75;
    message = '💥 KRITISK TRÄFF! Extra skada!';
  }

  // Streak bonus points
  if (streak >= 5) {
    bonusPoints += 50;
    if (!message) message = `🔥 ${streak}x combo!`;
  }

  return {
    damage,
    bonusPoints,
    eventTriggered: currentEvent.type !== 'normal' ? currentEvent.type : null,
    criticalHit,
    shieldActive: currentEvent.type === 'shield_round',
    message,
  };
}

/**
 * Calculate boss attack damage based on event type
 */
export function calculateBossAttackDamage(
  currentEvent: BossEvent,
  hasShield: boolean
): { livesLost: number; message: string | null } {
  if (hasShield) {
    return { livesLost: 0, message: '🛡️ Skölden blockerade attacken!' };
  }

  if (currentEvent.type === 'boss_rage') {
    return { livesLost: 2, message: '😤 Rasande attack! -2 liv!' };
  }

  return { livesLost: 1, message: null };
}

/**
 * Get difficulty modifier based on player mastery (Phase 3)
 *
 * REBALANCED: Higher mastery now gives BONUS REWARDS instead of harder fights.
 * This rewards learning rather than punishing it. (Theory of Fun alignment)
 */
export function getBossDifficultyModifier(
  bossReligion: string,
  cardProgress: Record<string, CardProgress>,
  religionCardIds: string[]
): {
  healthModifier: number;
  damageResistance: number;
  description: string;
  bonusXPMultiplier: number; // NEW: Reward mastery with XP bonus
} {
  // Calculate player's mastery of this religion's cards
  const masteredCount = religionCardIds.filter(id =>
    cardProgress[id]?.bucket === 'mastered'
  ).length;
  const totalCards = religionCardIds.length;
  const masteryPercent = totalCards > 0 ? (masteredCount / totalCards) * 100 : 0;

  // Reward mastery with bonus XP, keep boss difficulty constant
  if (masteryPercent >= 80) {
    return {
      healthModifier: 1.0, // Standard health (victory lap, not punishment)
      damageResistance: 0,
      description: 'MÄSTARE',
      bonusXPMultiplier: 2.0, // 2x XP bonus for mastery!
    };
  } else if (masteryPercent >= 50) {
    return {
      healthModifier: 1.0,
      damageResistance: 0,
      description: 'EXPERT',
      bonusXPMultiplier: 1.5, // 1.5x XP bonus
    };
  } else if (masteryPercent >= 25) {
    return {
      healthModifier: 1.0,
      damageResistance: 0,
      description: 'NORMAL',
      bonusXPMultiplier: 1.0,
    };
  }

  // New player - slightly easier boss to encourage learning
  return {
    healthModifier: 0.75, // 25% less health to help beginners
    damageResistance: 0,
    description: 'NYBÖRJARE',
    bonusXPMultiplier: 1.0,
  };
}

/**
 * Sort cards for boss battle (harder cards when player is doing well)
 */
export function sortBossCards(
  cards: Card[],
  cardProgress: Record<string, CardProgress>,
  currentStreak: number
): Card[] {
  return [...cards].sort((a, b) => {
    const progressA = cardProgress[a.id];
    const progressB = cardProgress[b.id];

    // When on a streak, prioritize harder cards
    if (currentStreak >= 3) {
      // Prefer cards with lower success rate
      const rateA = progressA ? progressA.correctAttempts / Math.max(1, progressA.totalAttempts) : 0.5;
      const rateB = progressB ? progressB.correctAttempts / Math.max(1, progressB.totalAttempts) : 0.5;
      return rateA - rateB;
    }

    // Otherwise, balanced mix
    if (a.difficulty !== b.difficulty) {
      return a.difficulty - b.difficulty;
    }

    return Math.random() - 0.5;
  });
}
