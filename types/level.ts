import { Religion } from './card';

export type LevelType = 'normal' | 'boss' | 'tutorial' | 'comparison';

// Mastery requirement for unlocking comparison levels (Phase 3)
export interface MasteryRequirement {
  cardIds: string[]; // Cards that must be mastered
  minMasteredCount: number; // Minimum number of mastered cards required
  description: string; // User-facing description of the requirement
}

export interface Level {
  id: string;
  name: string;
  description: string;
  religion: Religion;
  type: LevelType;
  order: number; // position in the world map
  requiredLevel: string | null; // level that must be completed first
  cardIds: string[];
  passingScore: number; // percentage needed for 1 star
  timeBonus?: number; // seconds for time bonus (3 stars)
  masteryRequirement?: MasteryRequirement; // Phase 3: Alternative unlock via mastery
}

export interface Boss {
  id: string;
  name: string;
  description: string;
  religion: Religion;
  levelId: string;
  health: number; // number of questions to defeat
  lives: number; // player lives
  cardIds: string[];
  rewardBadge: string;
}
