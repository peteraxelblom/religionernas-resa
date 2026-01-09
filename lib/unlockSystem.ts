import { Level, MasteryRequirement } from '@/types/level';
import { CardProgress } from '@/types/card';

/**
 * Phase 3: Mastery-based unlock system for comparison levels
 *
 * Comparison levels can be unlocked in two ways:
 * 1. Linear progression (completing prerequisite levels)
 * 2. Mastery-based unlock (mastering specific cards across religions)
 */

/**
 * Check if mastery requirement is met
 */
export function isMasteryRequirementMet(
  requirement: MasteryRequirement,
  cardProgress: Record<string, CardProgress>
): boolean {
  const masteredCount = requirement.cardIds.filter(cardId => {
    const progress = cardProgress[cardId];
    return progress?.bucket === 'mastered';
  }).length;

  return masteredCount >= requirement.minMasteredCount;
}

/**
 * Get mastery progress for a requirement
 */
export function getMasteryProgress(
  requirement: MasteryRequirement,
  cardProgress: Record<string, CardProgress>
): { mastered: number; required: number; percentage: number } {
  const masteredCount = requirement.cardIds.filter(cardId => {
    const progress = cardProgress[cardId];
    return progress?.bucket === 'mastered';
  }).length;

  return {
    mastered: masteredCount,
    required: requirement.minMasteredCount,
    percentage: Math.round((masteredCount / requirement.minMasteredCount) * 100),
  };
}

/**
 * Check if a level is unlocked (supports both linear and mastery-based unlocks)
 */
export function isLevelUnlockedAdvanced(
  level: Level,
  completedLevels: string[],
  cardProgress: Record<string, CardProgress>
): { unlocked: boolean; unlockMethod: 'linear' | 'mastery' | 'both' | 'none' } {
  const linearUnlocked = !level.requiredLevel || completedLevels.includes(level.requiredLevel);
  const masteryUnlocked = level.masteryRequirement
    ? isMasteryRequirementMet(level.masteryRequirement, cardProgress)
    : false;

  if (linearUnlocked && masteryUnlocked) {
    return { unlocked: true, unlockMethod: 'both' };
  } else if (linearUnlocked) {
    return { unlocked: true, unlockMethod: 'linear' };
  } else if (masteryUnlocked) {
    return { unlocked: true, unlockMethod: 'mastery' };
  }
  return { unlocked: false, unlockMethod: 'none' };
}

// Card IDs for mastery requirements (grouped by topic across religions)
export const topicCardGroups = {
  // Basic concepts from each religion
  basics: {
    judaism: ['jud-001', 'jud-002', 'jud-003', 'jud-004'],
    christianity: ['chr-001', 'chr-002', 'chr-003', 'chr-004'],
    islam: ['isl-001', 'isl-002', 'isl-003', 'isl-004', 'isl-005'],
  },
  // Holy books
  holyBooks: {
    judaism: ['jud-009', 'jud-010', 'jud-011', 'jud-012', 'jud-013'],
    christianity: ['chr-010', 'chr-011', 'chr-012', 'chr-013', 'chr-014'],
    islam: ['isl-011', 'isl-012', 'isl-013', 'isl-014', 'isl-015'],
  },
  // Religious leaders and places
  leadersAndPlaces: {
    judaism: ['jud-014', 'jud-015', 'jud-016', 'jud-017'],
    christianity: ['chr-026', 'chr-027', 'chr-028', 'chr-029'],
    islam: ['isl-022', 'isl-023', 'isl-024', 'isl-025', 'isl-026'],
  },
  // Key figures (Jesus, Muhammed, Moses)
  keyFigures: {
    judaism: ['jud-005', 'jud-006', 'jud-007', 'jud-008'],
    christianity: ['chr-005', 'chr-006', 'chr-007', 'chr-008', 'chr-009'],
    islam: ['isl-006', 'isl-007', 'isl-008', 'isl-009', 'isl-010'],
  },
  // Food rules
  foodRules: {
    judaism: ['jud-018', 'jud-019', 'jud-020', 'jud-021'],
    christianity: [], // Christianity typically has no food rules
    islam: ['isl-027', 'isl-028', 'isl-029', 'isl-030'],
  },
  // Holidays
  holidays: {
    judaism: ['jud-022', 'jud-023', 'jud-024', 'jud-025', 'jud-026'],
    christianity: ['chr-030', 'chr-031', 'chr-032', 'chr-033', 'chr-034'],
    islam: ['isl-031', 'isl-032', 'isl-033', 'isl-034', 'isl-035'],
  },
};

/**
 * Create mastery requirement for a comparison level
 */
export function createMasteryRequirement(
  topic: keyof typeof topicCardGroups,
  minPerReligion: number,
  description: string
): MasteryRequirement {
  const group = topicCardGroups[topic];
  const allCards = [
    ...group.judaism,
    ...group.christianity,
    ...group.islam,
  ];

  // Calculate minimum mastered count (minPerReligion from each religion that has cards)
  const religions = [group.judaism, group.christianity, group.islam].filter(r => r.length > 0);
  const minMasteredCount = religions.length * minPerReligion;

  return {
    cardIds: allCards,
    minMasteredCount,
    description,
  };
}

// Pre-defined mastery requirements for comparison levels
export const comparisonMasteryRequirements: Record<string, MasteryRequirement> = {
  'comparison-1': createMasteryRequirement(
    'basics',
    2,
    'Behärska 2 grundkort från varje religion'
  ),
  'comparison-2': createMasteryRequirement(
    'holyBooks',
    2,
    'Behärska 2 kort om heliga skrifter från varje religion'
  ),
  'comparison-3': createMasteryRequirement(
    'leadersAndPlaces',
    2,
    'Behärska 2 kort om ledare och platser från varje religion'
  ),
  'comparison-4': createMasteryRequirement(
    'keyFigures',
    2,
    'Behärska 2 kort om viktiga personer från varje religion'
  ),
  'comparison-5': {
    cardIds: [
      ...topicCardGroups.foodRules.judaism,
      ...topicCardGroups.foodRules.islam,
      ...topicCardGroups.holidays.judaism,
      ...topicCardGroups.holidays.christianity,
      ...topicCardGroups.holidays.islam,
    ],
    minMasteredCount: 6,
    description: 'Behärska 6 kort om mat och högtider'
  },
};
