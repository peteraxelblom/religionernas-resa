export type Religion = 'judaism' | 'christianity' | 'islam' | 'shared';
export type CardType = 'basic' | 'multiple_choice' | 'true_false' | 'fill_blank';
export type Difficulty = 1 | 2 | 3;

export interface Card {
  id: string;
  religion: Religion;
  category: string;
  difficulty: Difficulty;
  type: CardType;
  question: string;
  answer: string;
  options?: string[]; // for multiple choice
  hint?: string;
  funFact?: string;
  levelId: string;
  // Smart answer matching fields
  /** Alternative accepted phrasings of the answer */
  acceptedAnswers?: string[];
  /** Concept groups - answer must match at least one pattern from each group */
  conceptGroups?: string[][];
  /** Minimum n-gram similarity threshold (0-1, default 0.75) */
  ngramThreshold?: number;
}

export type CardBucket = 'new' | 'learning' | 'reviewing' | 'mastered';

export interface CardProgress {
  cardId: string;
  bucket: CardBucket;
  correctStreak: number;
  totalAttempts: number;
  correctAttempts: number;
  lastSeen: string | null;
  nextReview: string | null;
}
