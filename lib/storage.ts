import { SavedGameData, GameStats } from '@/types/progress';

const STORAGE_KEY = 'religionernas-resa-v1';

const defaultStats: GameStats = {
  totalXP: 0,
  totalCardsAnswered: 0,
  totalCorrect: 0,
  totalTimePlayedMs: 0,
  longestStreak: 0,
  currentDailyStreak: 0,
  lastPlayDate: null,
};

const defaultSettings = {
  soundEnabled: true,
  musicEnabled: true,
  musicVolume: 0.5,
  sfxVolume: 0.7,
};

export function createDefaultSaveData(playerName: string = 'Spelare'): SavedGameData {
  return {
    version: 1,
    lastSaved: new Date().toISOString(),
    playerName,
    levelProgress: {},
    cardProgress: {},
    achievements: [],
    stats: { ...defaultStats },
    settings: { ...defaultSettings },
  };
}

export const storage = {
  save: (data: SavedGameData): boolean => {
    try {
      data.lastSaved = new Date().toISOString();
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      return true;
    } catch (e) {
      console.error('Failed to save game data:', e);
      return false;
    }
  },

  load: (): SavedGameData | null => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return null;

      const data = JSON.parse(raw) as SavedGameData;

      // Ensure all required fields exist (migration support)
      if (!data.settings) data.settings = { ...defaultSettings };
      if (!data.stats) data.stats = { ...defaultStats };
      if (!data.achievements) data.achievements = [];
      if (!data.levelProgress) data.levelProgress = {};
      if (!data.cardProgress) data.cardProgress = {};

      return data;
    } catch (e) {
      console.error('Failed to load game data:', e);
      return null;
    }
  },

  clear: (): void => {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (e) {
      console.error('Failed to clear game data:', e);
    }
  },

  exists: (): boolean => {
    try {
      return localStorage.getItem(STORAGE_KEY) !== null;
    } catch {
      return false;
    }
  },
};

// Helper to check if a day has changed
export function isNewDay(lastPlayDate: string | null): boolean {
  if (!lastPlayDate) return true;

  const last = new Date(lastPlayDate);
  const now = new Date();

  return (
    last.getFullYear() !== now.getFullYear() ||
    last.getMonth() !== now.getMonth() ||
    last.getDate() !== now.getDate()
  );
}

// Helper to check if streak should continue
export function shouldContinueStreak(lastPlayDate: string | null): boolean {
  if (!lastPlayDate) return false;

  const last = new Date(lastPlayDate);
  const now = new Date();

  // Set both to start of day for comparison
  last.setHours(0, 0, 0, 0);
  now.setHours(0, 0, 0, 0);

  const diffDays = Math.floor((now.getTime() - last.getTime()) / (1000 * 60 * 60 * 24));

  // Streak continues if played yesterday or today
  return diffDays <= 1;
}
