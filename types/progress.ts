import { CardProgress } from './card';

export interface LevelProgress {
  levelId: string;
  completed: boolean;
  stars: number; // 0-3
  bestScore: number;
  attempts: number;
  lastPlayed: string | null;
}

export interface Achievement {
  id: string;
  nameEn: string;
  nameSv: string;
  description: string;
  icon: string;
  unlockedAt: string | null;
}

export interface GameStats {
  totalXP: number;
  totalCardsAnswered: number;
  totalCorrect: number;
  totalTimePlayedMs: number;
  longestStreak: number;
  currentDailyStreak: number;
  lastPlayDate: string | null;
}

export interface SavedGameData {
  version: number;
  lastSaved: string;
  playerName: string;
  levelProgress: Record<string, LevelProgress>;
  cardProgress: Record<string, CardProgress>;
  achievements: string[]; // unlocked achievement IDs
  stats: GameStats;
  settings: {
    soundEnabled: boolean;
    musicEnabled: boolean;
    musicVolume: number;
    sfxVolume: number;
  };
}
