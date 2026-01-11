'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useGameStore } from '@/stores/gameStore';
import { cardStats } from '@/data/cards';
import { levels } from '@/data/levels';
import PlayerLevelCard from '@/components/PlayerLevelCard';
import { STRINGS } from '@/lib/strings/sv';

export default function Home() {
  const { playerName, initGame, stats, levelProgress, getDueCardsCount, getMasteredCardsCount, resetGame } = useGameStore();
  const [mounted, setMounted] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  useEffect(() => {
    setMounted(true);
    initGame('Astor');
  }, [initGame]);

  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-2xl text-purple-600">{STRINGS.LOADING}</div>
      </div>
    );
  }

  const completedLevels = Object.values(levelProgress).filter(l => l.completed).length;
  const totalLevels = levels.length;
  const dueCards = getDueCardsCount();
  const masteredCards = getMasteredCardsCount();

  return (
    <main className="min-h-screen p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-6"
        >
          <h1 className="text-4xl md:text-5xl font-bold text-purple-800 mb-2">
            Religionernas Resa
          </h1>
          <p className="text-gray-600">
            Lär dig om judendom, kristendom och islam!
          </p>
        </motion.div>

        {/* Hero: Player Level Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="mb-6"
        >
          <PlayerLevelCard />
        </motion.div>

        {/* Main action card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-2xl shadow-lg p-5 mb-6"
        >
          {/* Quick stats row */}
          <div className="flex items-center justify-between mb-4 pb-4 border-b border-gray-100">
            <div className="flex items-center gap-6">
              <div className="text-center">
                <div className="text-xl font-bold text-orange-600">{stats.currentDailyStreak}</div>
                <div className="text-xs text-gray-500">dagar i rad</div>
              </div>
              <div className="text-center">
                <div className="text-xl font-bold text-green-600">{completedLevels}/{totalLevels}</div>
                <div className="text-xs text-gray-500">nivåer klara</div>
              </div>
              <div className="text-center">
                <div className="text-xl font-bold text-blue-600">{masteredCards}</div>
                <div className="text-xs text-gray-500">behärskade</div>
              </div>
            </div>
          </div>

          {/* Review Reminder */}
          {dueCards > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-4 p-3 bg-gradient-to-r from-amber-50 to-yellow-50 rounded-xl border border-amber-200"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-xl">🔔</span>
                  <div>
                    <p className="font-bold text-amber-800 text-sm">
                      {dueCards} kort att repetera
                    </p>
                    <p className="text-xs text-amber-600">
                      Repetera för +50 XP bonus!
                    </p>
                  </div>
                </div>
                <Link href="/review">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="px-3 py-1.5 bg-amber-500 text-white font-bold rounded-lg text-xs hover:bg-amber-600"
                  >
                    Repetera
                  </motion.button>
                </Link>
              </div>
            </motion.div>
          )}

          {/* Main play button */}
          <Link href="/map">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full py-4 px-6 bg-gradient-to-r from-purple-600 to-pink-600 text-white text-xl font-bold rounded-xl shadow-lg hover:shadow-xl transition-shadow"
            >
              🎮 Spela nu!
            </motion.button>
          </Link>

          {/* Secondary actions */}
          <div className="grid grid-cols-2 gap-3 mt-3">
            <Link href="/daily">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full py-2.5 px-4 bg-gradient-to-r from-orange-500 to-yellow-500 text-white font-bold rounded-xl text-sm shadow hover:shadow-lg transition-shadow"
              >
                🎯 Dagliga utmaningar
              </motion.button>
            </Link>
            <Link href="/stats">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full py-2.5 px-4 bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-bold rounded-xl text-sm shadow hover:shadow-lg transition-shadow"
              >
                🧘 Lägeskoll
              </motion.button>
            </Link>
          </div>
        </motion.div>

        {/* Religion categories */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-3"
        >
          <div className="bg-blue-100 rounded-xl p-3 text-center">
            <div className="text-2xl mb-1">✡️</div>
            <div className="text-sm font-medium text-blue-800">Judendom</div>
            <div className="text-xs text-blue-600">{cardStats.byReligion.judaism} kort</div>
          </div>
          <div className="bg-yellow-100 rounded-xl p-3 text-center">
            <div className="text-2xl mb-1">✝️</div>
            <div className="text-sm font-medium text-yellow-800">Kristendom</div>
            <div className="text-xs text-yellow-600">{cardStats.byReligion.christianity} kort</div>
          </div>
          <div className="bg-green-100 rounded-xl p-3 text-center">
            <div className="text-2xl mb-1">☪️</div>
            <div className="text-sm font-medium text-green-800">Islam</div>
            <div className="text-xs text-green-600">{cardStats.byReligion.islam} kort</div>
          </div>
          <div className="bg-purple-100 rounded-xl p-3 text-center">
            <div className="text-2xl mb-1">📚</div>
            <div className="text-sm font-medium text-purple-800">Totalt</div>
            <div className="text-xs text-purple-600">{cardStats.total} kort</div>
          </div>
        </motion.div>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-center mt-6 text-gray-500 text-sm"
        >
          <p>Lycklig resa genom religionernas värld!</p>
          <button
            onClick={() => setShowResetConfirm(true)}
            className="mt-2 text-xs text-gray-400 hover:text-red-500 transition-colors"
          >
            Börja om från början
          </button>
        </motion.div>

        {/* Reset confirmation modal */}
        {showResetConfirm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-xl"
            >
              <div className="text-center mb-4">
                <span className="text-4xl">⚠️</span>
                <h3 className="text-xl font-bold text-gray-800 mt-2">Börja om?</h3>
                <p className="text-gray-600 text-sm mt-2">
                  Detta raderar all din framgång: nivåer, XP, kort och prestationer. Det går inte att ångra.
                </p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowResetConfirm(false)}
                  className="flex-1 py-2 px-4 bg-gray-100 text-gray-700 font-medium rounded-xl hover:bg-gray-200 transition-colors"
                >
                  Avbryt
                </button>
                <button
                  onClick={() => {
                    resetGame();
                    setShowResetConfirm(false);
                  }}
                  className="flex-1 py-2 px-4 bg-red-500 text-white font-medium rounded-xl hover:bg-red-600 transition-colors"
                >
                  Radera allt
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </main>
  );
}
