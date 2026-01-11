/**
 * Contextual Feedback Messages
 *
 * Based on Dan Cook's Skill Atoms theory:
 * Clear, varied feedback enables accurate mental modeling.
 */

import { CardBucket } from '@/types/card';

export interface FeedbackContext {
  correct: boolean;
  responseTimeMs: number;
  streak: number;
  previousBucket: CardBucket;
  newBucket: CardBucket;
  userAnswer?: string;
  correctAnswer?: string;
  hasDoubleMasteryBonus?: boolean; // Player has Level 12+ reward
  hasSpeedBonus?: boolean; // Player earned speed bonus (Level 20+ fast answer on known card)
  shieldActivated?: boolean; // Shield protected the streak from breaking
}

export interface FeedbackMessage {
  title: string;
  subtitle?: string;
  isMastery?: boolean;
  isShieldActivated?: boolean;
}

// Correct answer messages based on speed
const SPEED_MESSAGES = {
  lightning: ['Blixtsnabbt!', 'Supersnabbt!', 'Som en blixt!'],
  fast: ['Snyggt!', 'Snabb reaktion!', 'Bra tempo!'],
  normal: ['Rätt!', 'Korrekt!', 'Precis!'],
};

// Streak celebration messages
const STREAK_MESSAGES: Record<number, string[]> = {
  3: ['3 i rad!', 'Trepoängare!', 'Hattrick!'],
  5: ['5 i rad!', 'Fantastiskt!', 'Det går bra nu!'],
  7: ['7 i rad!', 'Otroligt!', 'Ostoppbar!'],
  10: ['10 i rad!', 'MÄSTARE!', 'Legendariskt!'],
};

// Mastery celebration (Theory of Fun - "grokking")
const MASTERY_MESSAGES = [
  'BEHÄRSKAD!',
  'BEMÄSTRAD!',
  'DU HAR KOLL!',
];

// Wrong answer messages
const WRONG_MESSAGES = [
  'Inte riktigt',
  'Nästan!',
  'Försök igen nästa gång',
];

// Near-miss detection (for typos)
const NEAR_MISS_MESSAGE = 'Nästan rätt!';

function pickRandom<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

function isNearMiss(userAnswer?: string, correctAnswer?: string): boolean {
  if (!userAnswer || !correctAnswer) return false;

  const user = userAnswer.toLowerCase().trim();
  const correct = correctAnswer.toLowerCase().trim();

  // Check if only 1-2 characters different (simple Levenshtein approximation)
  if (Math.abs(user.length - correct.length) > 2) return false;

  let differences = 0;
  const longer = user.length > correct.length ? user : correct;
  const shorter = user.length > correct.length ? correct : user;

  for (let i = 0; i < longer.length; i++) {
    if (shorter[i] !== longer[i]) differences++;
  }

  return differences <= 2 && differences > 0;
}

export function getFeedbackMessage(context: FeedbackContext): FeedbackMessage {
  const { correct, responseTimeMs, streak, previousBucket, newBucket, userAnswer, correctAnswer, hasDoubleMasteryBonus, hasSpeedBonus } = context;

  // Check for mastery celebration (Theory of Fun - "grokking")
  if (correct && newBucket === 'mastered' && previousBucket !== 'mastered') {
    const xpAmount = hasDoubleMasteryBonus ? 50 : 25;
    const bonusText = hasDoubleMasteryBonus ? ' (2x bonus!)' : '';
    return {
      title: pickRandom(MASTERY_MESSAGES),
      subtitle: `Du behärskar det här kortet! +${xpAmount} XP${bonusText}`,
      isMastery: true,
    };
  }

  if (correct) {
    // Check streak first (higher priority)
    const streakThreshold = [10, 7, 5, 3].find(t => streak >= t);
    if (streakThreshold && STREAK_MESSAGES[streakThreshold]) {
      const speedBonusText = hasSpeedBonus ? ' ⚡+5 XP' : '';
      return {
        title: pickRandom(STREAK_MESSAGES[streakThreshold]),
        subtitle: `${streak} rätt i rad!${speedBonusText}`,
      };
    }

    // Speed-based feedback with optional speed bonus
    const speedBonusSubtitle = hasSpeedBonus ? '⚡ Snabbhetsbonus +5 XP!' : undefined;

    if (responseTimeMs < 2000) {
      return { title: pickRandom(SPEED_MESSAGES.lightning), subtitle: speedBonusSubtitle };
    } else if (responseTimeMs < 4000) {
      return { title: pickRandom(SPEED_MESSAGES.fast), subtitle: speedBonusSubtitle };
    } else {
      return { title: pickRandom(SPEED_MESSAGES.normal), subtitle: speedBonusSubtitle };
    }
  }

  // Wrong answer - check if shield activated
  if (context.shieldActivated) {
    return {
      title: '🛡️ SKÖLDEN SKYDDADE!',
      subtitle: 'Din streak är bevarad! Skölden är förbrukad idag.',
      isShieldActivated: true,
    };
  }

  // Regular wrong answer
  if (isNearMiss(userAnswer, correctAnswer)) {
    return {
      title: NEAR_MISS_MESSAGE,
      subtitle: `Du skrev "${userAnswer}" - rätt svar: "${correctAnswer}"`,
    };
  }

  return { title: pickRandom(WRONG_MESSAGES) };
}

// Get bucket transition message (when bucket changes)
export function getBucketTransitionMessage(previous: CardBucket, next: CardBucket): string | null {
  if (previous === next) return null;

  if (next === 'mastered') {
    return '🏆 Kortet är nu behärskat!';
  }
  if (next === 'reviewing' && previous === 'learning') {
    return '📈 Bra framsteg!';
  }
  if (next === 'learning' && previous === 'new') {
    return '🌱 Du har börjat lära dig det här kortet';
  }
  if (previous === 'mastered' || previous === 'reviewing') {
    return '📉 Dags att repetera det här kortet';
  }

  return null;
}
