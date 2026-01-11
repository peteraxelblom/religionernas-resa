'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useGameStore } from '@/stores/gameStore';
import { levels, isLevelUnlocked, getLevelById } from '@/data/levels';
import { Level } from '@/types/level';
import { isLevelUnlockedAdvanced, getMasteryProgress } from '@/lib/unlockSystem';
import LockedLevelModal from '@/components/LockedLevelModal';
import { STRINGS } from '@/lib/strings/sv';

export default function MapPage() {
  const { levelProgress, isLevelCompleted, cardProgress } = useGameStore();
  const [mounted, setMounted] = useState(false);
  const [selectedLockedLevel, setSelectedLockedLevel] = useState<Level | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-2xl text-purple-600">{STRINGS.LOADING_MAP}</div>
      </div>
    );
  }

  const completedLevelIds = Object.keys(levelProgress).filter(
    id => levelProgress[id]?.completed
  );

  const getReligionColor = (religion: Level['religion']) => {
    switch (religion) {
      case 'judaism': return 'from-blue-400 to-blue-600';
      case 'christianity': return 'from-yellow-400 to-orange-500';
      case 'islam': return 'from-green-400 to-green-600';
      case 'shared': return 'from-purple-400 to-purple-600';
    }
  };

  const getReligionBg = (religion: Level['religion']) => {
    switch (religion) {
      case 'judaism': return 'bg-blue-100';
      case 'christianity': return 'bg-yellow-100';
      case 'islam': return 'bg-green-100';
      case 'shared': return 'bg-purple-100';
    }
  };

  const getReligionEmoji = (religion: Level['religion']) => {
    switch (religion) {
      case 'judaism': return '✡️';
      case 'christianity': return '✝️';
      case 'islam': return '☪️';
      case 'shared': return '🌟';
    }
  };

  const getLevelStatus = (level: Level) => {
    // Use advanced unlock for comparison levels (supports mastery-based unlock)
    const unlockResult = level.type === 'comparison'
      ? isLevelUnlockedAdvanced(level, completedLevelIds, cardProgress)
      : { unlocked: isLevelUnlocked(level.id, completedLevelIds), unlockMethod: 'linear' as const };

    const isCompleted = isLevelCompleted(level.id);
    const progress = levelProgress[level.id];

    // Get mastery progress for comparison levels with mastery requirements
    const masteryProgress = level.masteryRequirement
      ? getMasteryProgress(level.masteryRequirement, cardProgress)
      : null;

    return {
      isUnlocked: unlockResult.unlocked,
      unlockMethod: unlockResult.unlockMethod,
      isCompleted,
      stars: progress?.stars || 0,
      masteryProgress,
    };
  };

  // Find the next unlocked but not completed level
  const nextLevel = levels.find(level => {
    const { isUnlocked, isCompleted } = getLevelStatus(level);
    return isUnlocked && !isCompleted;
  });

  return (
    <main className="min-h-screen p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <Link href="/" className="text-purple-600 hover:text-purple-800">
            <span className="text-2xl">←</span>
            <span className="ml-2">Hem</span>
          </Link>
          <h1 className="text-2xl md:text-3xl font-bold text-purple-800">
            Världskartan
          </h1>
          <div className="w-20"></div>
        </div>

        {/* Level Grid */}
        <div className="space-y-4">
          {/* Group levels by religion */}
          {['shared', 'judaism', 'christianity', 'islam'].map((religion) => {
            const religionLevels = levels.filter(l =>
              l.religion === religion ||
              (religion === 'shared' && l.religion === 'shared')
            );

            if (religionLevels.length === 0) return null;

            const religionName = {
              shared: 'Gemensamt ursprung',
              judaism: 'Judendom',
              christianity: 'Kristendom',
              islam: 'Islam',
            }[religion];

            return (
              <div key={religion} className={`rounded-2xl p-4 ${getReligionBg(religion as Level['religion'])}`}>
                <h2 className="text-lg font-bold mb-3 flex items-center gap-2">
                  <span>{getReligionEmoji(religion as Level['religion'])}</span>
                  {religionName}
                </h2>

                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 auto-rows-fr">
                  {religionLevels.map((level, index) => {
                    const { isUnlocked, isCompleted, stars, masteryProgress, unlockMethod } = getLevelStatus(level);
                    const isCurrent = nextLevel?.id === level.id;
                    const isBoss = level.type === 'boss';
                    const isComparison = level.type === 'comparison';

                    return (
                      <motion.div
                        key={level.id}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: index * 0.05 }}
                        className="h-full"
                      >
                        {isUnlocked ? (
                          <Link href={`/level/${level.id}`} className="block h-full">
                            <div
                              className={`
                                relative p-4 rounded-xl text-center cursor-pointer
                                transition-all duration-200 hover:scale-105 h-full min-h-[130px]
                                ${isCompleted
                                  ? 'bg-white shadow-md border-2 border-green-400'
                                  : isCurrent
                                    ? 'bg-white shadow-lg border-2 border-purple-500 animate-pulse-glow'
                                    : 'bg-white shadow-md border-2 border-gray-200 hover:border-purple-300'
                                }
                                ${isBoss ? 'border-4 border-red-400' : ''}
                              `}
                            >
                              {/* Level icon */}
                              <div className={`
                                w-12 h-12 mx-auto mb-2 rounded-full flex items-center justify-center
                                ${isCompleted
                                  ? 'bg-green-100 text-green-600'
                                  : `bg-gradient-to-br ${getReligionColor(level.religion)} text-white`
                                }
                                ${isBoss ? 'text-2xl' : 'text-xl'}
                              `}>
                                {isBoss ? '👹' : isCompleted ? '✓' : level.order}
                              </div>

                              {/* Level name */}
                              <h3 className="font-medium text-sm text-gray-800 mb-1">
                                {level.name}
                              </h3>

                              {/* Stars */}
                              {isCompleted && (
                                <div className="flex justify-center gap-0.5">
                                  {[1, 2, 3].map((star) => (
                                    <span
                                      key={star}
                                      className={`text-lg ${
                                        star <= stars ? 'text-yellow-400' : 'text-gray-300'
                                      }`}
                                    >
                                      ★
                                    </span>
                                  ))}
                                </div>
                              )}

                              {/* Current indicator */}
                              {isCurrent && !isCompleted && (
                                <span className="absolute -top-1 -right-1 bg-purple-500 text-white text-xs px-2 py-1 rounded-full">
                                  Nästa!
                                </span>
                              )}

                              {/* Mastery unlock badge for comparison levels */}
                              {isComparison && unlockMethod === 'mastery' && !isCompleted && (
                                <span className="absolute -top-1 -left-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs px-2 py-1 rounded-full">
                                  🔮 Upplåst!
                                </span>
                              )}
                            </div>
                          </Link>
                        ) : (
                          <button
                            onClick={() => setSelectedLockedLevel(level)}
                            className={`w-full p-4 rounded-xl text-center transition-all duration-200 hover:scale-105 cursor-pointer h-full min-h-[130px] ${
                              isComparison && masteryProgress
                                ? 'bg-purple-50 border-2 border-purple-200 hover:border-purple-400 hover:bg-purple-100'
                                : isBoss
                                  ? 'bg-red-50 border-2 border-red-200 hover:border-red-300 hover:bg-red-100 opacity-70'
                                  : 'bg-gray-100 border-2 border-transparent hover:border-gray-300 hover:bg-gray-200 opacity-60 hover:opacity-80'
                            }`}
                          >
                            <div className={`w-12 h-12 mx-auto mb-2 rounded-full flex items-center justify-center ${
                              isComparison
                                ? 'bg-purple-200 text-purple-600'
                                : isBoss
                                  ? 'bg-red-200 text-red-600'
                                  : 'bg-gray-300 text-gray-500'
                            }`}>
                              {isComparison ? '🔮' : isBoss ? '👹' : '🔒'}
                            </div>
                            <h3 className={`font-medium text-sm ${
                              isComparison
                                ? 'text-purple-700'
                                : isBoss
                                  ? 'text-red-700'
                                  : 'text-gray-500'
                            }`}>
                              {level.name}
                            </h3>
                            {/* Show mastery progress for comparison levels */}
                            {isComparison && masteryProgress && (
                              <div className="mt-2">
                                <div className="h-1.5 bg-purple-200 rounded-full overflow-hidden mb-1">
                                  <div
                                    className="h-full bg-purple-500 rounded-full transition-all duration-300"
                                    style={{ width: `${Math.min(masteryProgress.percentage, 100)}%` }}
                                  />
                                </div>
                                <p className="text-xs text-purple-600">
                                  {masteryProgress.mastered}/{masteryProgress.required} behärskade
                                </p>
                              </div>
                            )}
                            {/* Tap hint */}
                            <p className="text-xs text-gray-400 mt-2">Tryck för info</p>
                          </button>
                        )}
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {/* Quick play button */}
        {nextLevel && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2"
          >
            <Link href={`/level/${nextLevel.id}`}>
              <button className="px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold rounded-full shadow-xl hover:shadow-2xl transition-shadow flex items-center gap-2">
                <span>▶</span>
                <span>Fortsätt: {nextLevel.name}</span>
              </button>
            </Link>
          </motion.div>
        )}

        {/* Locked level modal */}
        {selectedLockedLevel && (
          <LockedLevelModal
            level={selectedLockedLevel}
            masteryProgress={
              selectedLockedLevel.masteryRequirement
                ? getMasteryProgress(selectedLockedLevel.masteryRequirement, cardProgress)
                : null
            }
            requiredLevelName={
              selectedLockedLevel.requiredLevel
                ? getLevelById(selectedLockedLevel.requiredLevel)?.name || null
                : null
            }
            completedLevelsCount={completedLevelIds.length}
            onClose={() => setSelectedLockedLevel(null)}
          />
        )}
      </div>
    </main>
  );
}
