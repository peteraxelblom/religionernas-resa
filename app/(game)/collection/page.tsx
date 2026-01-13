'use client';

import { useEffect, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { useGameStore } from '@/stores/gameStore';
import { allCards } from '@/data/cards';
import { artifacts, getUnlockedArtifacts, getArtifactProgress } from '@/data/artifacts';
import CollectionCard from '@/components/CollectionCard';
import { ArtifactShowcase, ArtifactProgressBar } from '@/components/ArtifactDisplay';
import { Religion } from '@/types/card';
import { achievements, getAchievementById } from '@/data/achievements';

type TabType = 'cards' | 'artifacts' | 'achievements';
type FilterType = 'all' | Religion;

export default function CollectionPage() {
  const { cardProgress, unlockedAchievements } = useGameStore();
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>('cards');
  const [filter, setFilter] = useState<FilterType>('all');
  const [showOnlyMastered, setShowOnlyMastered] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- Standard Next.js hydration pattern
    setMounted(true);
  }, []);

  // Calculate mastered cards
  const masteredCardIds = useMemo(() => {
    return new Set(
      Object.entries(cardProgress)
        .filter(([, progress]) => progress.bucket === 'mastered')
        .map(([id]) => id)
    );
  }, [cardProgress]);

  // Get cards with mastery status
  const cardsWithStatus = useMemo(() => {
    return allCards.map(card => ({
      card,
      isMastered: masteredCardIds.has(card.id),
      // Golden cards: deterministic based on card id hash (1 in 20)
      isGolden: card.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % 20 === 0,
    }));
  }, [masteredCardIds]);

  // Filter cards
  const filteredCards = useMemo(() => {
    return cardsWithStatus.filter(({ card, isMastered }) => {
      if (filter !== 'all' && card.religion !== filter) return false;
      if (showOnlyMastered && !isMastered) return false;
      return true;
    });
  }, [cardsWithStatus, filter, showOnlyMastered]);

  // Calculate stats
  const stats = useMemo(() => {
    const total = allCards.length;
    const mastered = masteredCardIds.size;
    const golden = cardsWithStatus.filter(c => c.isGolden && c.isMastered).length;
    const totalGolden = cardsWithStatus.filter(c => c.isGolden).length;

    return { total, mastered, golden, totalGolden };
  }, [masteredCardIds, cardsWithStatus]);

  // Get artifact progress
  const artifactProgress = useMemo(() => {
    return getArtifactProgress(stats.mastered);
  }, [stats.mastered]);

  const unlockedArtifacts = useMemo(() => {
    return getUnlockedArtifacts(stats.mastered);
  }, [stats.mastered]);

  // Get unlocked achievement details
  const unlockedAchievementsList = useMemo(() => {
    return (unlockedAchievements || [])
      .map(id => getAchievementById(id))
      .filter((a): a is NonNullable<typeof a> => a !== undefined);
  }, [unlockedAchievements]);

  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-2xl text-purple-600">Laddar samling...</div>
      </div>
    );
  }

  const religionFilters: { value: FilterType; label: string; emoji: string }[] = [
    { value: 'all', label: 'Alla', emoji: '📚' },
    { value: 'shared', label: 'Gemensamt', emoji: '🌟' },
    { value: 'judaism', label: 'Judendom', emoji: '✡️' },
    { value: 'christianity', label: 'Kristendom', emoji: '✝️' },
    { value: 'islam', label: 'Islam', emoji: '☪️' },
  ];

  return (
    <main className="min-h-screen p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <Link href="/" className="text-purple-600 hover:text-purple-800">
            <span className="text-2xl">←</span>
            <span className="ml-2">Hem</span>
          </Link>
          <h1 className="text-2xl md:text-3xl font-bold text-purple-800">
            Din Samling
          </h1>
          <div className="w-20"></div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 text-center"
          >
            <div className="text-3xl font-black text-purple-600">
              {stats.mastered}/{stats.total}
            </div>
            <div className="text-sm text-gray-500">Behärskade kort</div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-gradient-to-br from-yellow-50 to-amber-50 rounded-xl p-4 shadow-sm border border-yellow-200 text-center"
          >
            <div className="text-3xl font-black text-amber-600">
              {stats.golden}/{stats.totalGolden}
            </div>
            <div className="text-sm text-amber-700">Guldkort</div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 text-center"
          >
            <div className="text-3xl font-black text-green-600">
              {unlockedArtifacts.length}/{artifacts.length}
            </div>
            <div className="text-sm text-gray-500">Artefakter</div>
          </motion.div>
        </div>

        {/* Artifact Progress */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-6"
        >
          <ArtifactProgressBar
            current={artifactProgress.current}
            required={artifactProgress.required}
            nextArtifact={artifactProgress.artifact}
          />
        </motion.div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 flex-wrap">
          <button
            onClick={() => setActiveTab('cards')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'cards'
                ? 'bg-purple-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            📚 Kort ({stats.mastered}/{stats.total})
          </button>
          <button
            onClick={() => setActiveTab('achievements')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'achievements'
                ? 'bg-purple-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            🏅 Prestationer ({unlockedAchievementsList.length}/{achievements.length})
          </button>
          <button
            onClick={() => setActiveTab('artifacts')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'artifacts'
                ? 'bg-purple-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            🏆 Artefakter ({unlockedArtifacts.length}/{artifacts.length})
          </button>
        </div>

        {/* Tab Content */}
        <AnimatePresence mode="wait">
          {activeTab === 'cards' ? (
            <motion.div
              key="cards"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
            >
              {/* Filters */}
              <div className="flex flex-wrap gap-2 mb-4">
                {religionFilters.map(({ value, label, emoji }) => (
                  <button
                    key={value}
                    onClick={() => setFilter(value)}
                    className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                      filter === value
                        ? 'bg-purple-100 text-purple-700 border-2 border-purple-300'
                        : 'bg-gray-100 text-gray-600 border-2 border-transparent hover:bg-gray-200'
                    }`}
                  >
                    {emoji} {label}
                  </button>
                ))}

                <button
                  onClick={() => setShowOnlyMastered(!showOnlyMastered)}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium ml-auto transition-colors ${
                    showOnlyMastered
                      ? 'bg-green-100 text-green-700 border-2 border-green-300'
                      : 'bg-gray-100 text-gray-600 border-2 border-transparent hover:bg-gray-200'
                  }`}
                >
                  {showOnlyMastered ? '✓ Endast behärskade' : 'Visa alla'}
                </button>
              </div>

              {/* Card Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {filteredCards.map(({ card, isMastered, isGolden }, index) => (
                  <motion.div
                    key={card.id}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: Math.min(index * 0.02, 0.5) }}
                  >
                    <CollectionCard
                      card={card}
                      isMastered={isMastered}
                      isGolden={isGolden}
                    />
                  </motion.div>
                ))}
              </div>

              {filteredCards.length === 0 && (
                <div className="text-center py-12 text-gray-500">
                  <span className="text-4xl block mb-4">🔍</span>
                  <p>Inga kort matchar dina filter</p>
                </div>
              )}
            </motion.div>
          ) : activeTab === 'achievements' ? (
            <motion.div
              key="achievements"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              {/* Achievement categories */}
              <div className="space-y-6">
                {['progress', 'skill', 'streak', 'special'].map((category) => {
                  const categoryAchievements = achievements.filter(a => a.category === category);
                  const categoryLabel = {
                    progress: { name: 'Framsteg', emoji: '📈' },
                    skill: { name: 'Skicklighet', emoji: '⚡' },
                    streak: { name: 'Streak', emoji: '🔥' },
                    special: { name: 'Speciella', emoji: '✨' },
                  }[category]!;

                  return (
                    <div key={category}>
                      <h2 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
                        <span>{categoryLabel.emoji}</span>
                        {categoryLabel.name}
                      </h2>
                      <div className="grid gap-3 md:grid-cols-2">
                        {categoryAchievements.map((achievement, index) => {
                          const isUnlocked = unlockedAchievementsList.some(a => a.id === achievement.id);

                          return (
                            <motion.div
                              key={achievement.id}
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: index * 0.03 }}
                              className={`
                                p-4 rounded-xl border-2 flex items-center gap-4
                                ${isUnlocked
                                  ? 'bg-gradient-to-br from-amber-50 to-yellow-50 border-amber-200'
                                  : 'bg-gray-50 border-gray-200 opacity-60'
                                }
                              `}
                            >
                              <div className={`
                                w-14 h-14 rounded-full flex items-center justify-center text-3xl
                                ${isUnlocked
                                  ? 'bg-gradient-to-br from-amber-400 to-yellow-400 shadow-lg'
                                  : 'bg-gray-200'
                                }
                              `}>
                                {isUnlocked ? achievement.icon : '🔒'}
                              </div>

                              <div className="flex-1">
                                <h3 className={`font-bold ${isUnlocked ? 'text-gray-800' : 'text-gray-400'}`}>
                                  {achievement.nameSv}
                                </h3>
                                <p className="text-sm text-gray-500">
                                  {achievement.description}
                                </p>
                              </div>

                              {isUnlocked && (
                                <motion.span
                                  initial={{ scale: 0 }}
                                  animate={{ scale: 1 }}
                                  className="text-green-500 text-2xl"
                                >
                                  ✓
                                </motion.span>
                              )}
                            </motion.div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>

              {unlockedAchievementsList.length === 0 && (
                <div className="text-center py-12 text-gray-500 bg-white rounded-2xl border border-gray-100 mt-4">
                  <span className="text-4xl block mb-4">🏅</span>
                  <p className="font-medium">Inga prestationer ännu!</p>
                  <p className="text-sm mt-2">Fortsätt spela för att låsa upp prestationer</p>
                </div>
              )}
            </motion.div>
          ) : (
            <motion.div
              key="artifacts"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              {/* Artifacts Showcase */}
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <h2 className="text-lg font-bold text-gray-800 mb-4">
                  Dina Artefakter
                </h2>
                <ArtifactShowcase
                  unlockedArtifacts={unlockedArtifacts}
                  allArtifacts={artifacts}
                />
              </div>

              {/* Artifact Details */}
              <div className="mt-6 grid gap-4 md:grid-cols-2">
                {artifacts.map((artifact, index) => {
                  const isUnlocked = unlockedArtifacts.some(a => a.id === artifact.id);

                  return (
                    <motion.div
                      key={artifact.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className={`
                        p-4 rounded-xl border-2 flex items-center gap-4
                        ${isUnlocked
                          ? 'bg-white border-gray-200'
                          : 'bg-gray-50 border-gray-200 opacity-60'
                        }
                      `}
                    >
                      <div className={`
                        w-14 h-14 rounded-xl flex items-center justify-center text-3xl
                        ${isUnlocked ? 'bg-purple-50' : 'bg-gray-200'}
                      `}>
                        {isUnlocked ? artifact.emoji : '?'}
                      </div>

                      <div className="flex-1">
                        <h3 className={`font-bold ${isUnlocked ? 'text-gray-800' : 'text-gray-400'}`}>
                          {isUnlocked ? artifact.name : '???'}
                        </h3>
                        <p className="text-sm text-gray-500">
                          {isUnlocked
                            ? artifact.description
                            : `Behärska ${artifact.requiredMasteredCards} kort för att låsa upp`
                          }
                        </p>
                      </div>

                      {isUnlocked && (
                        <span className="text-green-500 text-xl">✓</span>
                      )}
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </main>
  );
}
