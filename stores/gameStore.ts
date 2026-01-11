'use client';

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { SavedGameData, LevelProgress, GameStats } from '@/types/progress';
import { CardProgress, CardBucket } from '@/types/card';
import { createDefaultSaveData, shouldContinueStreak, isNewDay } from '@/lib/storage';
import { createInitialCardProgress, updateCardProgress, isDueForReview } from '@/lib/spacedRepetition';
import { calculatePlayerLevel, PlayerLevel, applyXPBoost, applyMasteryBonus, hasRewardEffect } from '@/lib/playerLevel';

interface GameState extends SavedGameData {
  // Session state (not persisted)
  currentStreak: number;
  sessionStartTime: number | null;
  newlyUnlockedAchievement: string | null; // For toast notification

  // Daily challenge tracking (persisted)
  dailyChallengeCompletions: Record<string, string>; // challengeId -> date completed

  // Actions
  initGame: (playerName?: string) => void;
  setPlayerName: (name: string) => void;

  // Level progress
  completeLevel: (levelId: string, stars: number, score: number) => void;
  isLevelCompleted: (levelId: string) => boolean;
  getLevelProgress: (levelId: string) => LevelProgress | undefined;

  // Card progress
  recordCardAnswer: (cardId: string, correct: boolean, responseTimeMs: number) => void;
  getCardProgress: (cardId: string) => CardProgress;
  getCardBucket: (cardId: string) => CardBucket;
  getDueCardsCount: () => number;
  getDueCardIds: () => string[];
  getMasteredCardsCount: () => number;

  // Topic mastery (Phase 2)
  getCategoryMastery: (cardIds: string[]) => { total: number; mastered: number; learning: number; percentage: number };
  getOverallMasteryStats: () => { total: number; mastered: number; learning: number; reviewing: number; new_cards: number };

  // Achievements
  unlockAchievement: (achievementId: string) => void;
  hasAchievement: (achievementId: string) => boolean;
  clearNewlyUnlockedAchievement: () => void;

  // Daily challenges
  completeDailyChallenge: (challengeId: string) => void;
  isDailyChallengeCompleted: (challengeId: string) => boolean;
  getDailyCompletionCount: () => number;

  // Player Level
  getPlayerLevel: () => PlayerLevel;
  hasReward: (effect: 'freeHintPerLevel' | 'streakShield' | 'xpBoost10' | 'bossExtraLife' | 'doubleMasteryXP' | 'speedBonus') => boolean;

  // Stats
  addXP: (amount: number) => void;
  incrementStreak: () => void;
  resetStreak: () => void;
  updatePlayTime: () => void;
  updateDailyStreak: () => void;

  // Settings
  setSoundEnabled: (enabled: boolean) => void;
  setMusicEnabled: (enabled: boolean) => void;
  setMusicVolume: (volume: number) => void;
  setSfxVolume: (volume: number) => void;

  // Reset
  resetGame: () => void;
}

export const useGameStore = create<GameState>()(
  persist(
    (set, get) => ({
      // Default state
      version: 1,
      lastSaved: new Date().toISOString(),
      playerName: 'Astor',
      levelProgress: {},
      cardProgress: {},
      achievements: [],
      stats: {
        totalXP: 0,
        totalCardsAnswered: 0,
        totalCorrect: 0,
        totalTimePlayedMs: 0,
        longestStreak: 0,
        currentDailyStreak: 0,
        lastPlayDate: null,
      },
      settings: {
        soundEnabled: true,
        musicEnabled: true,
        musicVolume: 0.5,
        sfxVolume: 0.7,
      },

      // Session state
      currentStreak: 0,
      sessionStartTime: null,
      newlyUnlockedAchievement: null,
      dailyChallengeCompletions: {},

      // Actions
      initGame: (playerName = 'Astor') => {
        const state = get();
        if (!state.sessionStartTime) {
          set({
            playerName,
            sessionStartTime: Date.now(),
          });
          // Update daily streak on game start
          get().updateDailyStreak();
        }
      },

      setPlayerName: (name) => set({ playerName: name }),

      // Level progress
      completeLevel: (levelId, stars, score) => {
        set((state) => {
          const existing = state.levelProgress[levelId];
          const isFirstTime = !existing?.completed;

          const progress: LevelProgress = {
            levelId,
            completed: true,
            stars: Math.max(existing?.stars || 0, stars),
            bestScore: Math.max(existing?.bestScore || 0, score),
            attempts: (existing?.attempts || 0) + 1,
            lastPlayed: new Date().toISOString(),
          };

          // Calculate XP reward
          let xpReward = 50; // Base XP for completing
          xpReward += stars * 25; // Bonus for stars
          if (isFirstTime) xpReward += 100; // First time bonus

          return {
            levelProgress: {
              ...state.levelProgress,
              [levelId]: progress,
            },
            stats: {
              ...state.stats,
              totalXP: state.stats.totalXP + xpReward,
            },
          };
        });

        // Check for first level achievement
        const state = get();
        if (Object.keys(state.levelProgress).length === 1) {
          state.unlockAchievement('first-steps');
        }
        if (stars === 3) {
          state.unlockAchievement('three-stars');
        }
      },

      isLevelCompleted: (levelId) => {
        return get().levelProgress[levelId]?.completed || false;
      },

      getLevelProgress: (levelId) => {
        return get().levelProgress[levelId];
      },

      // Card progress
      recordCardAnswer: (cardId, correct, responseTimeMs) => {
        const MASTERY_XP_BONUS = 25; // XP awarded when card reaches mastered bucket

        set((state) => {
          const existing = state.cardProgress[cardId] || createInitialCardProgress(cardId);
          const updated = updateCardProgress(existing, correct, responseTimeMs);

          // Check if card just became mastered (bucket transition)
          const justMastered = updated.bucket === 'mastered' && existing.bucket !== 'mastered';

          // Update stats (including XP for mastery)
          const newStats = {
            ...state.stats,
            totalCardsAnswered: state.stats.totalCardsAnswered + 1,
            totalCorrect: correct ? state.stats.totalCorrect + 1 : state.stats.totalCorrect,
            totalXP: justMastered ? state.stats.totalXP + MASTERY_XP_BONUS : state.stats.totalXP,
          };

          return {
            cardProgress: {
              ...state.cardProgress,
              [cardId]: updated,
            },
            stats: newStats,
            currentStreak: correct ? state.currentStreak + 1 : 0,
          };
        });

        // Check for achievements
        const state = get();
        if (state.currentStreak >= 5) {
          state.unlockAchievement('combo-5');
        }
        if (state.currentStreak >= 10) {
          state.unlockAchievement('combo-10');
        }
        if (state.stats.totalCardsAnswered >= 100) {
          state.unlockAchievement('hundred-cards');
        }

        // Check for memory master
        const progress = state.cardProgress[cardId];
        if (progress?.bucket === 'mastered') {
          state.unlockAchievement('memory-master');
        }
      },

      getCardProgress: (cardId) => {
        return get().cardProgress[cardId] || createInitialCardProgress(cardId);
      },

      getCardBucket: (cardId) => {
        return get().cardProgress[cardId]?.bucket || 'new';
      },

      getDueCardsCount: () => {
        const progress = get().cardProgress;
        return Object.values(progress).filter(
          (p) => p.bucket !== 'new' && isDueForReview(p)
        ).length;
      },

      getDueCardIds: () => {
        const progress = get().cardProgress;
        return Object.values(progress)
          .filter((p) => p.bucket !== 'new' && isDueForReview(p))
          .map((p) => p.cardId);
      },

      getMasteredCardsCount: () => {
        const progress = get().cardProgress;
        return Object.values(progress).filter((p) => p.bucket === 'mastered').length;
      },

      // Topic mastery (Phase 2)
      getCategoryMastery: (cardIds: string[]) => {
        const progress = get().cardProgress;
        let mastered = 0;
        let learning = 0;

        for (const cardId of cardIds) {
          const cardProgress = progress[cardId];
          if (cardProgress) {
            if (cardProgress.bucket === 'mastered') mastered++;
            else if (cardProgress.bucket === 'learning' || cardProgress.bucket === 'reviewing') learning++;
          }
        }

        const total = cardIds.length;
        const percentage = total > 0 ? Math.round((mastered / total) * 100) : 0;

        return { total, mastered, learning, percentage };
      },

      getOverallMasteryStats: () => {
        const progress = get().cardProgress;
        const values = Object.values(progress);

        return {
          total: values.length,
          mastered: values.filter(p => p.bucket === 'mastered').length,
          learning: values.filter(p => p.bucket === 'learning').length,
          reviewing: values.filter(p => p.bucket === 'reviewing').length,
          new_cards: values.filter(p => p.bucket === 'new').length,
        };
      },

      // Achievements
      unlockAchievement: (achievementId) => {
        set((state) => {
          if (state.achievements.includes(achievementId)) {
            return state;
          }
          return {
            achievements: [...state.achievements, achievementId],
            newlyUnlockedAchievement: achievementId, // Trigger toast notification
          };
        });
      },

      hasAchievement: (achievementId) => {
        return get().achievements.includes(achievementId);
      },

      clearNewlyUnlockedAchievement: () => {
        set({ newlyUnlockedAchievement: null });
      },

      // Daily challenges
      completeDailyChallenge: (challengeId) => {
        const today = new Date().toISOString().split('T')[0];
        set((state) => ({
          dailyChallengeCompletions: {
            ...state.dailyChallengeCompletions,
            [challengeId]: today,
          },
        }));
      },

      isDailyChallengeCompleted: (challengeId) => {
        const today = new Date().toISOString().split('T')[0];
        return get().dailyChallengeCompletions[challengeId] === today;
      },

      getDailyCompletionCount: () => {
        const today = new Date().toISOString().split('T')[0];
        return Object.values(get().dailyChallengeCompletions).filter(d => d === today).length;
      },

      // Player Level
      getPlayerLevel: () => {
        return calculatePlayerLevel(get().stats.totalXP);
      },

      hasReward: (effect) => {
        const playerLevel = calculatePlayerLevel(get().stats.totalXP);
        return hasRewardEffect(playerLevel.level, effect);
      },

      // Stats
      addXP: (amount) => {
        set((state) => {
          // Apply XP boost if player has unlocked it (level 6+)
          const playerLevel = calculatePlayerLevel(state.stats.totalXP);
          const boostedAmount = applyXPBoost(amount, playerLevel.level);
          return {
            stats: {
              ...state.stats,
              totalXP: state.stats.totalXP + boostedAmount,
            },
          };
        });
      },

      incrementStreak: () => {
        set((state) => {
          const newStreak = state.currentStreak + 1;
          return {
            currentStreak: newStreak,
            stats: {
              ...state.stats,
              longestStreak: Math.max(state.stats.longestStreak, newStreak),
            },
          };
        });
      },

      resetStreak: () => {
        set({ currentStreak: 0 });
      },

      updatePlayTime: () => {
        const state = get();
        if (state.sessionStartTime) {
          const elapsed = Date.now() - state.sessionStartTime;
          set((s) => ({
            stats: {
              ...s.stats,
              totalTimePlayedMs: s.stats.totalTimePlayedMs + elapsed,
            },
            sessionStartTime: Date.now(), // Reset for next interval
          }));

          // Check for dedicated achievement (30 minutes)
          if (state.stats.totalTimePlayedMs >= 30 * 60 * 1000) {
            state.unlockAchievement('dedicated');
          }
        }
      },

      updateDailyStreak: () => {
        set((state) => {
          const { lastPlayDate, currentDailyStreak } = state.stats;
          const today = new Date().toISOString();

          if (shouldContinueStreak(lastPlayDate)) {
            // Continue or start streak
            const newStreak = isNewDay(lastPlayDate) ? currentDailyStreak + 1 : currentDailyStreak;

            // Check streak achievements
            if (newStreak >= 3) {
              get().unlockAchievement('streak-3');
            }
            if (newStreak >= 5) {
              get().unlockAchievement('streak-5');
            }

            return {
              stats: {
                ...state.stats,
                currentDailyStreak: newStreak,
                lastPlayDate: today,
              },
            };
          } else {
            // Streak broken
            return {
              stats: {
                ...state.stats,
                currentDailyStreak: 1,
                lastPlayDate: today,
              },
            };
          }
        });
      },

      // Settings
      setSoundEnabled: (enabled) => {
        set((state) => ({
          settings: { ...state.settings, soundEnabled: enabled },
        }));
      },

      setMusicEnabled: (enabled) => {
        set((state) => ({
          settings: { ...state.settings, musicEnabled: enabled },
        }));
      },

      setMusicVolume: (volume) => {
        set((state) => ({
          settings: { ...state.settings, musicVolume: volume },
        }));
      },

      setSfxVolume: (volume) => {
        set((state) => ({
          settings: { ...state.settings, sfxVolume: volume },
        }));
      },

      // Reset
      resetGame: () => {
        set({
          ...createDefaultSaveData('Astor'),
          currentStreak: 0,
          sessionStartTime: null,
        });
      },
    }),
    {
      name: 'religionernas-resa-v1',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        version: state.version,
        lastSaved: state.lastSaved,
        playerName: state.playerName,
        levelProgress: state.levelProgress,
        cardProgress: state.cardProgress,
        achievements: state.achievements,
        stats: state.stats,
        settings: state.settings,
        dailyChallengeCompletions: state.dailyChallengeCompletions,
      }),
    }
  )
);
