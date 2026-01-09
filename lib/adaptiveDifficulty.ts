import { Card, Difficulty, CardProgress } from '@/types/card';

export interface PerformanceMetrics {
  recentAccuracy: number; // Last 10 answers accuracy (0-100)
  averageResponseTime: number; // Average response time in ms
  currentStreak: number;
  totalAnswered: number;
}

export interface DifficultySettings {
  // Time bonus thresholds (ms)
  fastThreshold: number; // Time to get "fast" bonus
  mediumThreshold: number; // Time to get "medium" bonus

  // Card selection
  preferDifficulty: Difficulty | null; // Prefer certain difficulty
  includeHarder: boolean; // Include cards above current level
  showHints: boolean; // Show hints more prominently

  // Feedback
  encouragementLevel: 'high' | 'medium' | 'low';
}

export type FlowState = 'bored' | 'flow' | 'anxious';

/**
 * Calculate performance metrics from recent answers
 */
export function calculatePerformanceMetrics(
  recentAnswers: { correct: boolean; responseTimeMs: number }[]
): PerformanceMetrics {
  if (recentAnswers.length === 0) {
    return {
      recentAccuracy: 50, // Neutral starting point
      averageResponseTime: 5000,
      currentStreak: 0,
      totalAnswered: 0,
    };
  }

  const correct = recentAnswers.filter(a => a.correct).length;
  const accuracy = (correct / recentAnswers.length) * 100;
  const avgTime = recentAnswers.reduce((sum, a) => sum + a.responseTimeMs, 0) / recentAnswers.length;

  // Calculate current streak (from end)
  let streak = 0;
  for (let i = recentAnswers.length - 1; i >= 0; i--) {
    if (recentAnswers[i].correct) streak++;
    else break;
  }

  return {
    recentAccuracy: Math.round(accuracy),
    averageResponseTime: Math.round(avgTime),
    currentStreak: streak,
    totalAnswered: recentAnswers.length,
  };
}

/**
 * Determine the player's current flow state
 * Based on Theory of Fun - optimal learning happens in "flow"
 */
export function determineFlowState(metrics: PerformanceMetrics): FlowState {
  const { recentAccuracy, averageResponseTime } = metrics;

  // Bored: Too easy (high accuracy + fast responses)
  if (recentAccuracy >= 95 && averageResponseTime < 3000) {
    return 'bored';
  }

  // Anxious: Too hard (low accuracy or very slow)
  if (recentAccuracy < 50 || (recentAccuracy < 70 && averageResponseTime > 10000)) {
    return 'anxious';
  }

  // Flow: Just right
  return 'flow';
}

/**
 * Get adaptive difficulty settings based on flow state
 */
export function getAdaptiveSettings(flowState: FlowState): DifficultySettings {
  switch (flowState) {
    case 'bored':
      // Make it harder - reduce time bonuses, prefer harder cards
      return {
        fastThreshold: 2000, // Tighter time for fast bonus
        mediumThreshold: 4000,
        preferDifficulty: 3, // Prefer hard cards
        includeHarder: true,
        showHints: false,
        encouragementLevel: 'low', // Less praise needed
      };

    case 'anxious':
      // Make it easier - generous time bonuses, show hints
      return {
        fastThreshold: 5000, // More generous
        mediumThreshold: 8000,
        preferDifficulty: 1, // Prefer easy cards
        includeHarder: false,
        showHints: true,
        encouragementLevel: 'high', // More encouragement
      };

    case 'flow':
    default:
      // Balanced settings
      return {
        fastThreshold: 3000,
        mediumThreshold: 5000,
        preferDifficulty: null, // Mix of difficulties
        includeHarder: true,
        showHints: false,
        encouragementLevel: 'medium',
      };
  }
}

/**
 * Sort cards by adaptive priority
 * - When struggling: easier cards first, cards they've seen before
 * - When bored: harder cards, new cards, cards they've struggled with
 */
export function sortCardsByAdaptivePriority(
  cards: Card[],
  cardProgress: Record<string, CardProgress>,
  flowState: FlowState
): Card[] {
  return [...cards].sort((a, b) => {
    const progressA = cardProgress[a.id];
    const progressB = cardProgress[b.id];

    if (flowState === 'anxious') {
      // Easier cards first, then cards they've gotten right before
      if (a.difficulty !== b.difficulty) {
        return a.difficulty - b.difficulty;
      }
      // Prefer cards they've seen and gotten right
      const correctA = progressA?.correctAttempts || 0;
      const correctB = progressB?.correctAttempts || 0;
      return correctB - correctA;
    }

    if (flowState === 'bored') {
      // Harder cards first, then cards they've struggled with
      if (a.difficulty !== b.difficulty) {
        return b.difficulty - a.difficulty;
      }
      // Prefer cards with lower success rate
      const rateA = progressA ? progressA.correctAttempts / Math.max(1, progressA.totalAttempts) : 0.5;
      const rateB = progressB ? progressB.correctAttempts / Math.max(1, progressB.totalAttempts) : 0.5;
      return rateA - rateB;
    }

    // Flow state: balanced mix
    // Prioritize cards that need review or haven't been mastered
    const bucketPriority = { new: 2, learning: 3, reviewing: 4, mastered: 1 };
    const priorityA = bucketPriority[progressA?.bucket || 'new'];
    const priorityB = bucketPriority[progressB?.bucket || 'new'];
    return priorityB - priorityA;
  });
}

/**
 * Calculate points with adaptive bonuses
 */
export function calculateAdaptivePoints(
  correct: boolean,
  responseTimeMs: number,
  streak: number,
  settings: DifficultySettings
): { points: number; bonusType: string | null } {
  if (!correct) {
    return { points: 0, bonusType: null };
  }

  let points = 100;
  let bonusType: string | null = null;

  // Time bonus with adaptive thresholds
  if (responseTimeMs < settings.fastThreshold) {
    points += 50;
    bonusType = 'Blixtsnabbt!';
  } else if (responseTimeMs < settings.mediumThreshold) {
    points += 25;
    bonusType = 'Snabbt!';
  }

  // Streak bonus (always applies)
  const streakBonus = Math.min(streak * 10, 100);
  points += streakBonus;

  if (streak >= 5 && !bonusType) {
    bonusType = `${streak}x combo!`;
  }

  return { points, bonusType };
}

/**
 * Get encouragement message based on performance
 */
export function getEncouragementMessage(
  flowState: FlowState,
  metrics: PerformanceMetrics
): string | null {
  if (flowState === 'anxious') {
    if (metrics.currentStreak >= 2) {
      return 'Bra jobbat! Du är på rätt väg!';
    }
    if (metrics.totalAnswered >= 3 && metrics.recentAccuracy < 40) {
      return 'Tips: Ta din tid och läs frågan noggrant.';
    }
    return null;
  }

  if (flowState === 'bored' && metrics.currentStreak >= 5) {
    return 'Du behärskar detta! Redo för svårare utmaningar?';
  }

  return null;
}

/**
 * Determine if we should show a hint for this card
 */
export function shouldShowHint(
  card: Card,
  cardProgress: CardProgress | undefined,
  settings: DifficultySettings
): boolean {
  // Always show hint if settings say so
  if (settings.showHints && card.hint) {
    return true;
  }

  // Show hint if player has failed this card before
  if (cardProgress && cardProgress.totalAttempts > 0) {
    const successRate = cardProgress.correctAttempts / cardProgress.totalAttempts;
    if (successRate < 0.5 && card.hint) {
      return true;
    }
  }

  return false;
}
