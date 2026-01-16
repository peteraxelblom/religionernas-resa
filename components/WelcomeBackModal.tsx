'use client';

import { motion, AnimatePresence } from 'framer-motion';

interface WelcomeBackModalProps {
  playerName: string;
  daysAway: number;
  dueCards: number;
  streakStatus: 'maintained' | 'broken' | 'new';
  previousStreak?: number;
  hasDailyReward?: boolean;
  onClose: () => void;
  onClaimReward?: () => void;
}

export default function WelcomeBackModal({
  playerName,
  daysAway,
  dueCards,
  streakStatus,
  previousStreak = 0,
  hasDailyReward = false,
  onClose,
  onClaimReward,
}: WelcomeBackModalProps) {
  function getWelcomeMessage(): string {
    if (daysAway === 1) return 'Kul att se dig igen!';
    if (daysAway <= 3) return 'Välkommen tillbaka!';
    if (daysAway <= 7) return 'Så bra att du är tillbaka!';
    return 'Vi har saknat dig!';
  }

  function getEncouragement(): string {
    if (streakStatus === 'maintained') return 'Din streak lever vidare!';
    if (streakStatus === 'broken' && previousStreak > 0) {
      return `Din ${previousStreak}-dagars streak bröts, men idag börjar en ny!`;
    }
    return 'Dags att börja en ny streak!';
  }

  function getEmoji(): string {
    if (daysAway <= 1) return '👋';
    if (daysAway <= 3) return '🎉';
    if (daysAway <= 7) return '💪';
    return '🌟';
  }

  // Streak status styling lookup
  const streakStyles = {
    maintained: { bg: 'bg-green-50', text: 'text-green-700', emoji: '🔥' },
    broken: { bg: 'bg-amber-50', text: 'text-amber-700', emoji: '💔' },
    new: { bg: 'bg-blue-50', text: 'text-blue-700', emoji: '✨' },
  } as const;
  const currentStreakStyle = streakStyles[streakStatus];

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.8, opacity: 0, y: 50 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.8, opacity: 0, y: 50 }}
          transition={{ type: 'spring', damping: 20, stiffness: 300 }}
          className="bg-white rounded-3xl shadow-2xl max-w-sm w-full overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="bg-gradient-to-br from-purple-500 via-pink-500 to-orange-400 p-8 text-center relative overflow-hidden">
            {/* Decorative circles */}
            <div className="absolute top-0 left-0 w-20 h-20 bg-white/10 rounded-full -ml-10 -mt-10" />
            <div className="absolute bottom-0 right-0 w-24 h-24 bg-white/10 rounded-full -mr-12 -mb-12" />

            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 400, delay: 0.2 }}
              className="text-6xl mb-4"
            >
              {getEmoji()}
            </motion.div>

            <motion.h2
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-2xl font-bold text-white mb-2"
            >
              {getWelcomeMessage()}
            </motion.h2>

            <motion.p
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="text-white/90"
            >
              Hej, <span className="font-semibold">{playerName}</span>!
            </motion.p>
          </div>

          {/* Content */}
          <div className="p-6 space-y-4">
            {/* Days away info */}
            {daysAway > 1 && (
              <motion.div
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="flex items-center gap-3 bg-gray-50 rounded-xl p-3"
              >
                <span className="text-2xl">📅</span>
                <div>
                  <p className="text-sm text-gray-600">
                    {daysAway} dagar sedan sist
                  </p>
                </div>
              </motion.div>
            )}

            {/* Streak status */}
            <motion.div
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.6 }}
              className={`flex items-center gap-3 rounded-xl p-3 ${currentStreakStyle.bg}`}
            >
              <span className="text-2xl">{currentStreakStyle.emoji}</span>
              <div>
                <p className={`text-sm font-medium ${currentStreakStyle.text}`}>
                  {getEncouragement()}
                </p>
              </div>
            </motion.div>

            {/* Daily reward preview */}
            {hasDailyReward && (
              <motion.div
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.7 }}
                className="flex items-center gap-3 bg-gradient-to-r from-amber-50 to-yellow-50 rounded-xl p-3 border-2 border-amber-200"
              >
                <motion.span
                  animate={{ rotate: [0, -10, 10, -10, 10, 0], scale: [1, 1.1, 1] }}
                  transition={{ duration: 2, repeat: Infinity, repeatDelay: 1 }}
                  className="text-3xl"
                >
                  🎁
                </motion.span>
                <div>
                  <p className="text-sm font-bold text-amber-800">
                    Din dagliga belöning väntar!
                  </p>
                  <p className="text-xs text-amber-600">
                    Tryck för att öppna
                  </p>
                </div>
              </motion.div>
            )}

            {/* Due cards reminder */}
            {dueCards > 0 && !hasDailyReward && (
              <motion.div
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.7 }}
                className="flex items-center gap-3 bg-purple-50 rounded-xl p-3"
              >
                <span className="text-2xl">📚</span>
                <div>
                  <p className="text-sm text-purple-700">
                    <span className="font-bold">{dueCards}</span> kort väntar på repetition
                  </p>
                </div>
              </motion.div>
            )}

            {/* Primary action button */}
            {hasDailyReward && onClaimReward ? (
              <motion.button
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.8 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={onClaimReward}
                className="w-full py-4 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-lg font-bold rounded-xl shadow-lg hover:shadow-xl transition-shadow relative overflow-hidden"
              >
                {/* Pulse effect */}
                <motion.div
                  animate={{ scale: [1, 1.5, 1], opacity: [0.3, 0, 0.3] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="absolute inset-0 bg-white rounded-xl"
                />
                <span className="relative z-10">Öppna belöning! 🎁</span>
              </motion.button>
            ) : (
              <motion.button
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.8 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={onClose}
                className="w-full py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white text-lg font-bold rounded-xl shadow-lg hover:shadow-xl transition-shadow"
              >
                Sätt igång! 🚀
              </motion.button>
            )}

            {/* Skip option when reward is available */}
            {hasDailyReward && (
              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1 }}
                onClick={onClose}
                className="w-full text-gray-400 text-sm hover:text-gray-600 transition-colors"
              >
                (eller hoppa över)
              </motion.button>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
