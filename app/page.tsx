'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useGameStore } from '@/stores/gameStore';
import { cardStats } from '@/data/cards';
import { levels } from '@/data/levels';

export default function Home() {
  const { playerName, initGame, stats, levelProgress, getDueCardsCount, getMasteredCardsCount } = useGameStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    initGame('Astor');
  }, [initGame]);

  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-2xl text-purple-600">Laddar...</div>
      </div>
    );
  }

  const completedLevels = Object.values(levelProgress).filter(l => l.completed).length;
  const totalLevels = levels.length;
  const progressPercent = Math.round((completedLevels / totalLevels) * 100);
  const dueCards = getDueCardsCount();
  const masteredCards = getMasteredCardsCount();

  return (
    <main className="min-h-screen p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl md:text-6xl font-bold text-purple-800 mb-2">
            Religionernas Resa
          </h1>
          <p className="text-lg text-gray-600">
            Lär dig om judendom, kristendom och islam!
          </p>
        </motion.div>

        {/* Welcome Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-3xl shadow-xl p-6 md:p-8 mb-6 card-shadow"
        >
          <div className="flex items-center gap-4 mb-6">
            <div className="text-5xl">👋</div>
            <div>
              <h2 className="text-2xl font-bold text-gray-800">
                Hej {playerName}!
              </h2>
              <p className="text-gray-600">
                Redo att fortsätta din resa?
              </p>
            </div>
          </div>

          {/* Progress bar */}
          <div className="mb-6">
            <div className="flex justify-between text-sm text-gray-600 mb-2">
              <span>Din framgång</span>
              <span>{completedLevels} av {totalLevels} nivåer</span>
            </div>
            <div className="h-4 bg-gray-200 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progressPercent}%` }}
                transition={{ duration: 1, ease: 'easeOut' }}
                className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"
              />
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="text-center p-3 bg-purple-50 rounded-xl">
              <div className="text-2xl font-bold text-purple-600">{stats.totalXP}</div>
              <div className="text-xs text-gray-500">XP</div>
            </div>
            <div className="text-center p-3 bg-orange-50 rounded-xl">
              <div className="text-2xl font-bold text-orange-600">{stats.currentDailyStreak}</div>
              <div className="text-xs text-gray-500">Dagars rad</div>
            </div>
            <div className="text-center p-3 bg-green-50 rounded-xl">
              <div className="text-2xl font-bold text-green-600">{stats.totalCorrect}</div>
              <div className="text-xs text-gray-500">Rätta svar</div>
            </div>
          </div>

          {/* Review Reminders - Skill Atoms: Spaced repetition visibility */}
          {(dueCards > 0 || masteredCards > 0) && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 p-4 bg-gradient-to-r from-amber-50 to-yellow-50 rounded-xl border border-amber-200"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {dueCards > 0 ? (
                    <>
                      <span className="text-2xl">🔔</span>
                      <div>
                        <p className="font-bold text-amber-800">
                          {dueCards} kort att repetera
                        </p>
                        <p className="text-sm text-amber-600">
                          Repetera för +50 XP bonus!
                        </p>
                      </div>
                    </>
                  ) : (
                    <>
                      <span className="text-2xl">🏆</span>
                      <div>
                        <p className="font-bold text-green-700">
                          {masteredCards} kort behärskade
                        </p>
                        <p className="text-sm text-green-600">
                          Du är på väg att bli expert!
                        </p>
                      </div>
                    </>
                  )}
                </div>
                {dueCards > 0 && (
                  <Link href="/review">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="px-4 py-2 bg-amber-500 text-white font-bold rounded-lg text-sm hover:bg-amber-600"
                    >
                      Repetera nu
                    </motion.button>
                  </Link>
                )}
              </div>
            </motion.div>
          )}

          {/* Play button */}
          <Link href="/map">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full py-4 px-6 bg-gradient-to-r from-purple-600 to-pink-600 text-white text-xl font-bold rounded-2xl shadow-lg hover:shadow-xl transition-shadow"
            >
              🎮 Spela nu!
            </motion.button>
          </Link>

          {/* Quick action buttons */}
          <div className="grid grid-cols-2 gap-4 mt-4">
            <Link href="/daily">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full py-3 px-4 bg-gradient-to-r from-orange-500 to-yellow-500 text-white font-bold rounded-xl shadow hover:shadow-lg transition-shadow"
              >
                🎯 Dagliga utmaningar
              </motion.button>
            </Link>
            <Link href="/stats">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full py-3 px-4 bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-bold rounded-xl shadow hover:shadow-lg transition-shadow"
              >
                📊 Kunskapskarta
              </motion.button>
            </Link>
          </div>
        </motion.div>

        {/* Quick stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4"
        >
          <div className="bg-blue-100 rounded-2xl p-4 text-center">
            <div className="text-3xl mb-1">✡️</div>
            <div className="text-sm font-medium text-blue-800">Judendom</div>
            <div className="text-xs text-blue-600">{cardStats.byReligion.judaism} kort</div>
          </div>
          <div className="bg-yellow-100 rounded-2xl p-4 text-center">
            <div className="text-3xl mb-1">✝️</div>
            <div className="text-sm font-medium text-yellow-800">Kristendom</div>
            <div className="text-xs text-yellow-600">{cardStats.byReligion.christianity} kort</div>
          </div>
          <div className="bg-green-100 rounded-2xl p-4 text-center">
            <div className="text-3xl mb-1">☪️</div>
            <div className="text-sm font-medium text-green-800">Islam</div>
            <div className="text-xs text-green-600">{cardStats.byReligion.islam} kort</div>
          </div>
          <div className="bg-purple-100 rounded-2xl p-4 text-center">
            <div className="text-3xl mb-1">📚</div>
            <div className="text-sm font-medium text-purple-800">Totalt</div>
            <div className="text-xs text-purple-600">{cardStats.total} kort</div>
          </div>
        </motion.div>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="text-center mt-8 text-gray-500 text-sm"
        >
          <p>Lycklig resa genom religionernas värld!</p>
        </motion.div>
      </div>
    </main>
  );
}
