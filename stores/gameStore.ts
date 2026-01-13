'use client';

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { SavedGameData, LevelProgress } from '@/types/progress';
import { CardProgress, CardBucket } from '@/types/card';
import { createDefaultSaveData, shouldContinueStreak, isNewDay } from '@/lib/storage';
import { createInitialCardProgress, updateCardProgress, isDueForReview } from '@/lib/spacedRepetition';
import { calculatePlayerLevel, PlayerLevel, applyXPBoost, applyMasteryBonus, calculateSpeedBonus, calculatePerfectLevelBonus, hasRewardEffect } from '@/lib/playerLevel';

// Daily reward result type
export interface DailyRewardResult {
  xp: number;
  bonusItem: 'streakShield' | 'hint' | null;
  streakDay: number;
}

interface GameState extends SavedGameData {
  // Session state (not persisted)
  currentStreak: number;
  sessionStartTime: number | null;
  newlyUnlockedAchievement: string | null; // For toast notification

  // Avatar selection (persisted)
  avatarId: string;

  // Daily challenge tracking (persisted)
  dailyChallengeCompletions: Record<string, string>; // challengeId -> date completed

  // Streak Shield state (persisted - resets daily)
  shieldUsedToday: boolean;
  shieldLastUsedDate: string | null; // ISO date string to track when to reset
  lastShieldActivation: boolean; // True if shield just activated (for UI feedback)

  // Onboarding state (persisted)
  hasCompletedOnboarding: boolean;
  onboardingStep: 'naming' | 'firstCard' | 'celebration' | null;

  // Daily reward state (persisted)
  dailyReward: {
    lastClaimedDate: string | null;
    consecutiveDaysClaimed: number;
  };

  // Actions
  initGame: (playerName?: string) => void;
  setPlayerName: (name: string) => void;
  setAvatar: (avatarId: string) => void;

  // Level progress
  completeLevel: (levelId: string, stars: number, score: number, correctCount?: number, totalQuestions?: number) => void;
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
  hasReward: (effect: 'freeHintPerLevel' | 'streakShield' | 'xpBoost10' | 'bossExtraLife' | 'doubleMasteryXP' | 'speedBonus' | 'perfectLevelBonus' | 'dailyChallengeBoost') => boolean;

  // Streak Shield
  isShieldAvailable: () => boolean; // Shield unlocked AND not used today
  clearShieldActivation: () => void; // Clear the lastShieldActivation flag after showing UI

  // Onboarding
  completeOnboarding: () => void;
  setOnboardingStep: (step: 'naming' | 'firstCard' | 'celebration' | null) => void;
  startOnboarding: (name: string) => void; // Combined action: set name + advance to firstCard

  // Daily Reward
  canClaimDailyReward: () => boolean;
  claimDailyReward: () => DailyRewardResult;
  getDailyRewardStreak: () => number;

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
      playerName: '',
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

      // Avatar selection
      avatarId: 'explorer',

      // Streak Shield state
      shieldUsedToday: false,
      shieldLastUsedDate: null,
      lastShieldActivation: false,

      // Onboarding state
      hasCompletedOnboarding: false,
      onboardingStep: 'naming' as const,

      // Daily reward state
      dailyReward: {
        lastClaimedDate: null,
        consecutiveDaysClaimed: 0,
      },

      // Actions
      initGame: (playerName?: string) => {
        const state = get();
        if (!state.sessionStartTime) {
          set({
            // Only update playerName if explicitly provided
            ...(playerName !== undefined ? { playerName } : {}),
            sessionStartTime: Date.now(),
          });
          // Update daily streak on game start
          get().updateDailyStreak();
        }
      },

      setPlayerName: (name) => set({ playerName: name }),
      setAvatar: (avatarId) => set({ avatarId }),

      // Level progress
      completeLevel: (levelId, stars, score, correctCount, totalQuestions) => {
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
          const playerLevel = calculatePlayerLevel(state.stats.totalXP);
          let xpReward = 50; // Base XP for completing
          xpReward += stars * 25; // Bonus for stars
          if (isFirstTime) xpReward += 100; // First time bonus

          // Perfect level bonus (Level 22+): +25 XP for 100% accuracy
          if (correctCount !== undefined && totalQuestions !== undefined) {
            xpReward += calculatePerfectLevelBonus(playerLevel.level, correctCount, totalQuestions);
          }

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
        const BASE_MASTERY_XP = 25; // Base XP awarded when card reaches mastered bucket

        set((state) => {
          const existing = state.cardProgress[cardId] || createInitialCardProgress(cardId);
          const updated = updateCardProgress(existing, correct, responseTimeMs);

          // Check if card just became mastered (bucket transition)
          const justMastered = updated.bucket === 'mastered' && existing.bucket !== 'mastered';

          // Apply mastery bonus if player has unlocked it (level 12+)
          const playerLevel = calculatePlayerLevel(state.stats.totalXP);
          const masteryXP = justMastered
            ? applyMasteryBonus(BASE_MASTERY_XP, playerLevel.level)
            : 0;

          // Calculate speed bonus for fast correct answers on known cards (Level 20+)
          const speedBonusResult = correct
            ? calculateSpeedBonus(0, playerLevel.level, responseTimeMs, existing.bucket)
            : { bonusXP: 0, wasSpeedBonus: false };

          // Total XP from this answer
          const totalBonusXP = masteryXP + speedBonusResult.bonusXP;

          // Update stats (including XP for mastery and speed bonus)
          const newStats = {
            ...state.stats,
            totalCardsAnswered: state.stats.totalCardsAnswered + 1,
            totalCorrect: correct ? state.stats.totalCorrect + 1 : state.stats.totalCorrect,
            totalXP: state.stats.totalXP + totalBonusXP,
          };

          // Check if shield should activate (wrong answer with streak, shield available)
          const today = new Date().toISOString().split('T')[0];
          const shieldIsAvailable =
            hasRewardEffect(playerLevel.level, 'streakShield') &&
            !state.shieldUsedToday &&
            state.shieldLastUsedDate !== today;

          const shouldUseShield =
            !correct &&
            state.currentStreak > 0 &&
            shieldIsAvailable;

          // Calculate new streak (preserved if shield activates)
          let newStreak: number;
          let shieldActivated = false;
          let shieldUsed = state.shieldUsedToday;
          let shieldDate = state.shieldLastUsedDate;

          if (correct) {
            newStreak = state.currentStreak + 1;
          } else if (shouldUseShield) {
            // Shield protects the streak!
            newStreak = state.currentStreak;
            shieldActivated = true;
            shieldUsed = true;
            shieldDate = today;
          } else {
            newStreak = 0;
          }

          return {
            cardProgress: {
              ...state.cardProgress,
              [cardId]: updated,
            },
            stats: newStats,
            currentStreak: newStreak,
            shieldUsedToday: shieldUsed,
            shieldLastUsedDate: shieldDate,
            lastShieldActivation: shieldActivated,
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

      // Streak Shield
      isShieldAvailable: () => {
        const state = get();
        const playerLevel = calculatePlayerLevel(state.stats.totalXP);
        const today = new Date().toISOString().split('T')[0];
        return (
          hasRewardEffect(playerLevel.level, 'streakShield') &&
          !state.shieldUsedToday &&
          state.shieldLastUsedDate !== today
        );
      },

      clearShieldActivation: () => {
        set({ lastShieldActivation: false });
      },

      // Onboarding
      completeOnboarding: () => {
        set({ hasCompletedOnboarding: true, onboardingStep: null });
      },

      setOnboardingStep: (step) => {
        set({ onboardingStep: step });
      },

      startOnboarding: (name) => {
        // Atomic update: set both playerName and onboardingStep in single state change
        // This prevents race conditions with persist middleware
        set({ playerName: name, onboardingStep: 'firstCard' });
      },

      // Daily Reward
      canClaimDailyReward: () => {
        const state = get();
        const today = new Date().toISOString().split('T')[0];
        return state.dailyReward.lastClaimedDate !== today;
      },

      claimDailyReward: () => {
        const state = get();
        const today = new Date().toISOString().split('T')[0];
        const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

        // Calculate streak
        const wasClaimedYesterday = state.dailyReward.lastClaimedDate === yesterday;
        const newStreak = wasClaimedYesterday
          ? state.dailyReward.consecutiveDaysClaimed + 1
          : 1;

        // Calculate reward based on streak tier
        // Tier 1 (day 1-2): 25-50 XP, 0% bonus chance
        // Tier 2 (day 3-4): 40-75 XP, 10% bonus chance
        // Tier 3 (day 5-6): 50-100 XP, 20% bonus chance
        // Tier 4 (day 7+): 75-150 XP, 30% bonus chance
        let minXP = 25, maxXP = 50, bonusChance = 0;
        if (newStreak >= 7) {
          minXP = 75; maxXP = 150; bonusChance = 0.3;
        } else if (newStreak >= 5) {
          minXP = 50; maxXP = 100; bonusChance = 0.2;
        } else if (newStreak >= 3) {
          minXP = 40; maxXP = 75; bonusChance = 0.1;
        }

        // Random XP within range
        const xp = Math.floor(Math.random() * (maxXP - minXP + 1)) + minXP;

        // Random bonus item
        const bonusRoll = Math.random();
        let bonusItem: 'streakShield' | 'hint' | null = null;
        if (bonusRoll < bonusChance) {
          bonusItem = Math.random() < 0.5 ? 'streakShield' : 'hint';
        }

        // Update state
        set((s) => ({
          dailyReward: {
            lastClaimedDate: today,
            consecutiveDaysClaimed: newStreak,
          },
          stats: {
            ...s.stats,
            totalXP: s.stats.totalXP + xp,
          },
        }));

        return { xp, bonusItem, streakDay: newStreak };
      },

      getDailyRewardStreak: () => {
        const state = get();
        const today = new Date().toISOString().split('T')[0];
        const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

        // If claimed today, return current streak
        if (state.dailyReward.lastClaimedDate === today) {
          return state.dailyReward.consecutiveDaysClaimed;
        }
        // If claimed yesterday, would continue streak
        if (state.dailyReward.lastClaimedDate === yesterday) {
          return state.dailyReward.consecutiveDaysClaimed + 1;
        }
        // Otherwise streak resets
        return 1;
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
          ...createDefaultSaveData(''),
          currentStreak: 0,
          sessionStartTime: null,
          hasCompletedOnboarding: false,
          onboardingStep: 'naming',
          dailyReward: {
            lastClaimedDate: null,
            consecutiveDaysClaimed: 0,
          },
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
        // Streak Shield state (resets daily via shieldLastUsedDate comparison)
        shieldUsedToday: state.shieldUsedToday,
        shieldLastUsedDate: state.shieldLastUsedDate,
        // Onboarding state
        hasCompletedOnboarding: state.hasCompletedOnboarding,
        onboardingStep: state.onboardingStep,
        // Daily reward state
        dailyReward: state.dailyReward,
      }),
    }
  )
);
