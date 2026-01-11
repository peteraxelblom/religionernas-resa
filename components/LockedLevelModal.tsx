'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Level } from '@/types/level';
import { getLevelById } from '@/data/levels';

interface MasteryProgress {
  mastered: number;
  required: number;
  percentage: number;
}

interface LockedLevelModalProps {
  level: Level | null;
  masteryProgress: MasteryProgress | null;
  requiredLevelName: string | null;
  completedLevelsCount: number;
  onClose: () => void;
}

export default function LockedLevelModal({
  level,
  masteryProgress,
  requiredLevelName,
  completedLevelsCount,
  onClose,
}: LockedLevelModalProps) {
  if (!level) return null;

  const isComparison = level.type === 'comparison';
  const isBoss = level.type === 'boss';

  // Fun messages based on level type and progress
  const getEncouragingMessage = () => {
    if (isComparison && masteryProgress) {
      const percent = masteryProgress.percentage;
      if (percent >= 80) return { emoji: '🔥', text: 'Nästan där! Du är på väg att låsa upp en hemlig genväg!' };
      if (percent >= 50) return { emoji: '⚡', text: 'Halvvägs! Fortsätt bemästra kort för att öppna den magiska portalen!' };
      if (percent >= 25) return { emoji: '✨', text: 'Bra start! Kristallkulan börjar glöda...' };
      return { emoji: '🔮', text: 'En hemlig väg väntar den som bemästrar sitt lärande!' };
    }
    if (isBoss) {
      return { emoji: '👹', text: 'En mäktig utmaning väntar! Slutför alla nivåer först för att möta bossen.' };
    }
    return { emoji: '🗺️', text: 'Varje stor resa börjar med ett enda steg!' };
  };

  const getUnlockHint = () => {
    if (isComparison && masteryProgress) {
      return {
        primary: `Bemästra ${masteryProgress.required - masteryProgress.mastered} kort till`,
        secondary: 'eller slutför tidigare nivåer för att låsa upp',
        icon: '🎯',
      };
    }
    if (requiredLevelName) {
      return {
        primary: `Slutför "${requiredLevelName}"`,
        secondary: 'för att fortsätta äventyret',
        icon: '🔓',
      };
    }
    return {
      primary: 'Slutför tidigare nivåer',
      secondary: 'för att låsa upp denna nivå',
      icon: '🔓',
    };
  };

  const encouragement = getEncouragingMessage();
  const unlockHint = getUnlockHint();

  // Fun facts about the level topic to tease content
  const getLevelTeaser = () => {
    if (level.description) {
      return level.description;
    }
    return 'Spännande kunskaper väntar!';
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.8, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.8, opacity: 0, y: 20 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="bg-white rounded-2xl shadow-2xl max-w-sm w-full overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header with level info */}
          <div className={`p-6 text-center ${
            isComparison
              ? 'bg-gradient-to-br from-purple-500 to-pink-500'
              : isBoss
                ? 'bg-gradient-to-br from-red-500 to-orange-500'
                : 'bg-gradient-to-br from-gray-400 to-gray-500'
          }`}>
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 400 }}
              className="text-6xl mb-3"
            >
              {isComparison ? '🔮' : isBoss ? '👹' : '🔒'}
            </motion.div>
            <h2 className="text-xl font-bold text-white mb-1">{level.name}</h2>
            <p className="text-white/80 text-sm">{getLevelTeaser()}</p>
          </div>

          {/* Body with unlock info */}
          <div className="p-6">
            {/* Encouraging message */}
            <motion.div
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="flex items-start gap-3 mb-4 p-3 bg-amber-50 rounded-xl"
            >
              <span className="text-2xl">{encouragement.emoji}</span>
              <p className="text-amber-800 text-sm font-medium">{encouragement.text}</p>
            </motion.div>

            {/* Mastery progress for comparison levels */}
            {isComparison && masteryProgress && (
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="mb-4"
              >
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-purple-700 font-medium">Mästarframsteg</span>
                  <span className="text-purple-600">
                    {masteryProgress.mastered}/{masteryProgress.required} kort
                  </span>
                </div>
                <div className="h-3 bg-purple-100 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min(masteryProgress.percentage, 100)}%` }}
                    transition={{ delay: 0.5, duration: 0.8, ease: 'easeOut' }}
                    className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"
                  />
                </div>
                {masteryProgress.percentage >= 50 && (
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.8 }}
                    className="text-xs text-purple-600 mt-2 text-center"
                  >
                    ✨ Du är på god väg att låsa upp genvägen!
                  </motion.p>
                )}
              </motion.div>
            )}

            {/* Unlock requirement */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="bg-gray-50 rounded-xl p-4 text-center"
            >
              <span className="text-3xl mb-2 block">{unlockHint.icon}</span>
              <p className="font-bold text-gray-800 mb-1">{unlockHint.primary}</p>
              <p className="text-sm text-gray-500">{unlockHint.secondary}</p>
            </motion.div>

            {/* Progress indicator for normal levels */}
            {!isComparison && !isBoss && completedLevelsCount > 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="mt-4 text-center"
              >
                <p className="text-xs text-gray-400">
                  Du har klarat {completedLevelsCount} nivåer hittills - fortsätt så!
                </p>
              </motion.div>
            )}
          </div>

          {/* Footer with action */}
          <div className="px-6 pb-6">
            <motion.button
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.6 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={onClose}
              className={`w-full py-3 rounded-xl font-bold text-white transition-colors ${
                isComparison
                  ? 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700'
                  : 'bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800'
              }`}
            >
              {isComparison ? '🔮 Jag förstår!' : '💪 Jag fixar det!'}
            </motion.button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
