'use client';

import { useEffect, useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useGameStore } from '@/stores/gameStore';
import {
  allCards,
  getCardsByReligion,
  getCardsByReligionAndCategory,
  getCategoriesByReligion,
  categoryDisplayNames,
} from '@/data/cards';
import { Religion } from '@/types/card';

interface CategoryStats {
  category: string;
  displayName: string;
  total: number;
  mastered: number;
  learning: number;
  percentage: number;
}

interface ReligionStats {
  religion: Religion;
  displayName: string;
  icon: string;
  color: string;
  bgColor: string;
  categories: CategoryStats[];
  totalCards: number;
  masteredCards: number;
  learningCards: number;
  percentage: number;
}

const religionConfig: Record<Religion, { displayName: string; icon: string; color: string; bgColor: string }> = {
  judaism: { displayName: 'Judendom', icon: '✡️', color: 'text-blue-600', bgColor: 'bg-blue-100' },
  christianity: { displayName: 'Kristendom', icon: '✝️', color: 'text-yellow-600', bgColor: 'bg-yellow-100' },
  islam: { displayName: 'Islam', icon: '☪️', color: 'text-green-600', bgColor: 'bg-green-100' },
  shared: { displayName: 'Gemensamt', icon: '🌟', color: 'text-purple-600', bgColor: 'bg-purple-100' },
};

export default function StatsPage() {
  const { stats, getCategoryMastery, getOverallMasteryStats, cardProgress, levelProgress } = useGameStore();
  const [mounted, setMounted] = useState(false);
  const [selectedReligion, setSelectedReligion] = useState<Religion | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Calculate religion stats
  const religionStats = useMemo((): ReligionStats[] => {
    const religions: Religion[] = ['shared', 'judaism', 'christianity', 'islam'];

    return religions.map(religion => {
      const config = religionConfig[religion];
      const religionCards = getCardsByReligion(religion);
      const categories = getCategoriesByReligion(religion);

      const categoryStats: CategoryStats[] = categories.map(category => {
        const categoryCards = getCardsByReligionAndCategory(religion, category);
        const cardIds = categoryCards.map(c => c.id);
        const mastery = getCategoryMastery(cardIds);

        return {
          category,
          displayName: categoryDisplayNames[category] || category,
          total: mastery.total,
          mastered: mastery.mastered,
          learning: mastery.learning,
          percentage: mastery.percentage,
        };
      });

      const allCardIds = religionCards.map(c => c.id);
      const overallMastery = getCategoryMastery(allCardIds);

      return {
        religion,
        ...config,
        categories: categoryStats,
        totalCards: overallMastery.total,
        masteredCards: overallMastery.mastered,
        learningCards: overallMastery.learning,
        percentage: overallMastery.percentage,
      };
    });
  }, [getCategoryMastery]);

  // Find weak areas (categories with low mastery but some progress)
  const weakAreas = useMemo(() => {
    const allCategories: (CategoryStats & { religion: Religion; religionName: string })[] = [];

    religionStats.forEach(rs => {
      rs.categories.forEach(cat => {
        if (cat.learning > 0 && cat.percentage < 50) {
          allCategories.push({
            ...cat,
            religion: rs.religion,
            religionName: rs.displayName,
          });
        }
      });
    });

    return allCategories
      .sort((a, b) => a.percentage - b.percentage)
      .slice(0, 3);
  }, [religionStats]);

  // Overall stats
  const overallStats = useMemo(() => {
    return getOverallMasteryStats();
  }, [getOverallMasteryStats]);

  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-2xl text-purple-600">Laddar...</div>
      </div>
    );
  }

  const completedLevels = Object.values(levelProgress).filter(l => l.completed).length;

  return (
    <main className="min-h-screen p-4 md:p-8 bg-gradient-to-b from-purple-50 to-indigo-50">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <Link href="/" className="text-purple-600 hover:text-purple-800">
            <span className="text-2xl">←</span>
            <span className="ml-2">Hem</span>
          </Link>

          <h1 className="text-2xl md:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-indigo-600">
            Kunskapskarta
          </h1>

          <div className="w-16" /> {/* Spacer for alignment */}
        </div>

        {/* Overall Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-lg p-6 mb-6"
        >
          <h2 className="text-lg font-bold text-gray-800 mb-4">Översikt</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-purple-50 rounded-xl">
              <div className="text-3xl font-bold text-purple-600">{stats.totalXP}</div>
              <div className="text-sm text-gray-500">Total XP</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-xl">
              <div className="text-3xl font-bold text-green-600">{overallStats.mastered}</div>
              <div className="text-sm text-gray-500">Behärskade kort</div>
            </div>
            <div className="text-center p-4 bg-yellow-50 rounded-xl">
              <div className="text-3xl font-bold text-yellow-600">
                {overallStats.learning + overallStats.reviewing}
              </div>
              <div className="text-sm text-gray-500">Under inlärning</div>
            </div>
            <div className="text-center p-4 bg-blue-50 rounded-xl">
              <div className="text-3xl font-bold text-blue-600">{completedLevels}</div>
              <div className="text-sm text-gray-500">Avklarade nivåer</div>
            </div>
          </div>
        </motion.div>

        {/* Weak Areas */}
        {weakAreas.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-2xl shadow-lg p-6 mb-6 border border-amber-200"
          >
            <h2 className="text-lg font-bold text-amber-800 mb-3 flex items-center gap-2">
              <span>🎯</span> Fokusområden
            </h2>
            <p className="text-sm text-amber-700 mb-4">
              Dessa områden behöver lite extra övning
            </p>
            <div className="space-y-3">
              {weakAreas.map((area, index) => (
                <div
                  key={`${area.religion}-${area.category}`}
                  className="flex items-center justify-between bg-white/50 rounded-lg p-3"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xl">
                      {religionConfig[area.religion].icon}
                    </span>
                    <div>
                      <div className="font-medium text-gray-800">
                        {area.displayName}
                      </div>
                      <div className="text-xs text-gray-500">
                        {area.religionName}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-amber-600">
                      {area.percentage}%
                    </div>
                    <div className="text-xs text-gray-500">
                      {area.mastered}/{area.total} behärskade
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Religion Mastery Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {religionStats.map((rs, index) => (
            <motion.div
              key={rs.religion}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + index * 0.1 }}
              className={`bg-white rounded-2xl shadow-lg p-6 cursor-pointer hover:shadow-xl transition-shadow ${
                selectedReligion === rs.religion ? 'ring-2 ring-purple-400' : ''
              }`}
              onClick={() => setSelectedReligion(
                selectedReligion === rs.religion ? null : rs.religion
              )}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">{rs.icon}</span>
                  <div>
                    <h3 className="font-bold text-gray-800">{rs.displayName}</h3>
                    <p className="text-sm text-gray-500">{rs.totalCards} kort</p>
                  </div>
                </div>
                <div className={`text-2xl font-bold ${rs.color}`}>
                  {rs.percentage}%
                </div>
              </div>

              {/* Progress bar */}
              <div className="h-3 bg-gray-200 rounded-full overflow-hidden mb-2">
                <div className="h-full flex">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${(rs.masteredCards / rs.totalCards) * 100}%` }}
                    transition={{ duration: 0.5, delay: 0.3 }}
                    className="bg-green-500"
                  />
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${(rs.learningCards / rs.totalCards) * 100}%` }}
                    transition={{ duration: 0.5, delay: 0.4 }}
                    className="bg-yellow-400"
                  />
                </div>
              </div>

              <div className="flex justify-between text-xs text-gray-500">
                <span>🟢 {rs.masteredCards} behärskade</span>
                <span>🟡 {rs.learningCards} lär sig</span>
              </div>

              {/* Category breakdown (expanded) */}
              {selectedReligion === rs.religion && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="mt-4 pt-4 border-t border-gray-100"
                >
                  <h4 className="text-sm font-medium text-gray-700 mb-3">
                    Kategorier
                  </h4>
                  <div className="space-y-2">
                    {rs.categories.map(cat => (
                      <div key={cat.category} className="flex items-center gap-2">
                        <div className="flex-1">
                          <div className="flex justify-between text-sm mb-1">
                            <span className="text-gray-700">{cat.displayName}</span>
                            <span className="text-gray-500">
                              {cat.mastered}/{cat.total}
                            </span>
                          </div>
                          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                            <div
                              className={`h-full ${rs.bgColor} transition-all duration-300`}
                              style={{ width: `${cat.percentage}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </motion.div>
          ))}
        </div>

        {/* Legend */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="bg-white rounded-xl shadow p-4"
        >
          <h3 className="text-sm font-medium text-gray-700 mb-2">Förklaring</h3>
          <div className="flex flex-wrap gap-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-green-500 rounded" />
              <span className="text-gray-600">Behärskat (5+ rätt i rad)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-yellow-400 rounded" />
              <span className="text-gray-600">Under inlärning</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-gray-200 rounded" />
              <span className="text-gray-600">Inte börjat</span>
            </div>
          </div>
        </motion.div>

        {/* Back to home */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mt-8 text-center"
        >
          <Link href="/map">
            <button className="px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold rounded-xl hover:opacity-90 transition-opacity">
              Fortsätt lära dig
            </button>
          </Link>
        </motion.div>
      </div>
    </main>
  );
}
