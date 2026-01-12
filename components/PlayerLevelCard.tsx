'use client';

import { motion } from 'framer-motion';
import { useGameStore } from '@/stores/gameStore';
import { getNextReward, getUnlockedRewards } from '@/lib/playerLevel';

interface PlayerLevelCardProps {
  compact?: boolean;
}

export default function PlayerLevelCard({ compact = false }: PlayerLevelCardProps) {
  const { getPlayerLevel, playerName } = useGameStore();
  const playerLevel = getPlayerLevel();
  const nextReward = getNextReward(playerLevel.level);
  const unlockedRewards = getUnlockedRewards(playerLevel.level);

  // Gradient colors based on level tier
  const getLevelGradient = () => {
    if (playerLevel.level >= 20) return 'from-yellow-400 via-amber-500 to-orange-500'; // Expert
    if (playerLevel.level >= 15) return 'from-purple-500 via-pink-500 to-red-500'; // Master
    if (playerLevel.level >= 10) return 'from-blue-500 via-purple-500 to-pink-500'; // Advanced
    if (playerLevel.level >= 5) return 'from-green-400 via-emerald-500 to-teal-500'; // Intermediate
    return 'from-blue-400 via-indigo-500 to-purple-500'; // Beginner
  };

  if (compact) {
    return (
      <div className="flex items-center gap-3 bg-white/80 backdrop-blur rounded-xl px-4 py-2 shadow-sm">
        <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${getLevelGradient()} flex items-center justify-center text-white font-bold shadow-md`}>
          {playerLevel.level}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-800 truncate">{playerLevel.title}</p>
          <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden mt-1">
            <div
              className={`h-full bg-gradient-to-r ${getLevelGradient()} rounded-full transition-all duration-300`}
              style={{ width: `${playerLevel.progressPercent}%` }}
            />
          </div>
        </div>
        <span className="text-xs text-gray-500">{playerLevel.xpInCurrentLevel}/{playerLevel.xpRequiredForNext}</span>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl shadow-xl overflow-hidden"
    >
      {/* Header gradient with level badge */}
      <div className={`bg-gradient-to-br ${getLevelGradient()} p-6 text-center relative overflow-hidden`}>
        {/* Decorative circles */}
        <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -mr-8 -mt-8" />
        <div className="absolute bottom-0 left-0 w-16 h-16 bg-white/10 rounded-full -ml-4 -mb-4" />

        {/* Level badge with pulse glow */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 300, delay: 0.1 }}
          className="relative mx-auto"
        >
          {/* Pulsing glow effect behind badge */}
          <motion.div
            animate={{ scale: [1, 1.15, 1], opacity: [0.3, 0.1, 0.3] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute inset-0 w-24 h-24 rounded-full bg-white mx-auto"
          />
          <div className="relative w-24 h-24 rounded-full bg-white/20 backdrop-blur flex items-center justify-center mx-auto mb-3 ring-4 ring-white/30">
            <div className="w-20 h-20 rounded-full bg-white flex items-center justify-center shadow-lg">
              <span className="text-4xl font-bold bg-gradient-to-br from-purple-600 to-pink-600 bg-clip-text text-transparent">
                {playerLevel.level}
              </span>
            </div>
          </div>
        </motion.div>

        {/* Player name and title */}
        <h2 className="text-white font-bold text-xl mb-1">{playerName}</h2>
        <p className="text-white/90 font-medium">{playerLevel.title}</p>
      </div>

      {/* XP Progress section */}
      <div className="p-5">
        {/* XP bar */}
        <div className="mb-4">
          <div className="flex justify-between text-sm mb-2">
            <span className="text-gray-600 font-medium">Till nästa nivå</span>
            <span className="text-purple-600 font-bold">
              {playerLevel.xpInCurrentLevel} / {playerLevel.xpRequiredForNext} XP
            </span>
          </div>
          <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${playerLevel.progressPercent}%` }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
              className={`h-full bg-gradient-to-r ${getLevelGradient()} rounded-full relative overflow-hidden`}
            >
              {/* Shimmer effect on progress bar */}
              <motion.div
                animate={{ x: ['-100%', '200%'] }}
                transition={{ duration: 2, repeat: Infinity, repeatDelay: 3, ease: 'easeInOut' }}
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent"
              />
            </motion.div>
          </div>
          <p className="text-xs text-gray-400 mt-1 text-center">
            Totalt {playerLevel.totalXP.toLocaleString('sv-SE')} XP
          </p>
        </div>

        {/* Next reward preview */}
        {nextReward && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-gradient-to-r from-amber-50 to-yellow-50 rounded-xl p-4 border border-amber-100"
          >
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center text-2xl">
                {nextReward.icon}
              </div>
              <div className="flex-1">
                <p className="text-xs text-amber-600 font-medium uppercase tracking-wide">
                  Nivå {nextReward.unlockedAtLevel} belöning
                </p>
                <p className="font-bold text-gray-800">{nextReward.name}</p>
                <p className="text-xs text-gray-500">{nextReward.description}</p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Unlocked rewards */}
        {unlockedRewards.length > 0 && (
          <div className="mt-4">
            <p className="text-xs text-gray-500 uppercase tracking-wide mb-2">Upplåsta bonusar</p>
            <div className="flex flex-wrap gap-2">
              {unlockedRewards.map((reward) => (
                <motion.div
                  key={reward.id}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="flex items-center gap-1.5 bg-green-50 text-green-700 px-3 py-1.5 rounded-full text-sm"
                  title={reward.description}
                >
                  <span>{reward.icon}</span>
                  <span className="font-medium">{reward.name}</span>
                </motion.div>
              ))}
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}
