'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getRewardAtLevel, getTitleForLevel } from '@/lib/playerLevel';

interface LevelUpModalProps {
  newLevel: number;
  previousLevel: number;
  onClose: () => void;
  playerName?: string;
}

// Simple confetti particle component
function ConfettiParticle({ delay, color, randomX, randomRotate }: { delay: number; color: string; randomX: number; randomRotate: number }) {
  return (
    <motion.div
      initial={{ y: -20, x: `${randomX}vw`, opacity: 1, rotate: 0 }}
      animate={{
        y: '100vh',
        rotate: randomRotate,
        opacity: [1, 1, 0],
      }}
      transition={{
        duration: 3,
        delay: delay,
        ease: 'easeOut',
      }}
      className="fixed top-0 w-3 h-3 pointer-events-none z-50"
      style={{ backgroundColor: color, left: 0 }}
    />
  );
}

export default function LevelUpModal({ newLevel, previousLevel, onClose, playerName }: LevelUpModalProps) {
  const [showConfetti, setShowConfetti] = useState(true);
  const reward = getRewardAtLevel(newLevel);
  const newTitle = getTitleForLevel(newLevel);
  const oldTitle = getTitleForLevel(previousLevel);
  const titleChanged = newTitle !== oldTitle;

  const confettiColors = ['#8B5CF6', '#EC4899', '#F59E0B', '#10B981', '#3B82F6', '#EF4444'];

  // Pre-computed confetti properties for stable rendering
  const [confettiProps] = useState(() =>
    Array.from({ length: 50 }).map(() => ({
      randomX: Math.random() * 100,
      randomRotate: Math.random() * 720 - 360,
    }))
  );

  useEffect(() => {
    // Auto-hide confetti after animation
    const timer = setTimeout(() => setShowConfetti(false), 3000);
    return () => clearTimeout(timer);
  }, []);

  // Gradient based on level
  const getLevelGradient = () => {
    if (newLevel >= 20) return 'from-yellow-400 via-amber-500 to-orange-500';
    if (newLevel >= 15) return 'from-purple-500 via-pink-500 to-red-500';
    if (newLevel >= 10) return 'from-blue-500 via-purple-500 to-pink-500';
    if (newLevel >= 5) return 'from-green-400 via-emerald-500 to-teal-500';
    return 'from-blue-400 via-indigo-500 to-purple-500';
  };

  return (
    <AnimatePresence>
      {/* Confetti */}
      {showConfetti && (
        <>
          {confettiProps.map((props, i) => (
            <ConfettiParticle
              key={i}
              delay={i * 0.05}
              color={confettiColors[i % confettiColors.length]}
              randomX={props.randomX}
              randomRotate={props.randomRotate}
            />
          ))}
        </>
      )}

      {/* Modal backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
        onClick={onClose}
      >
        {/* Modal content */}
        <motion.div
          initial={{ scale: 0.5, opacity: 0, y: 50 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.5, opacity: 0, y: 50 }}
          transition={{ type: 'spring', damping: 20, stiffness: 300 }}
          className="bg-white rounded-3xl shadow-2xl max-w-sm w-full overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Celebration header */}
          <div className={`bg-gradient-to-br ${getLevelGradient()} p-8 text-center relative overflow-hidden`}>
            {/* Decorative elements */}
            <div className="absolute top-0 left-0 w-20 h-20 bg-white/10 rounded-full -ml-10 -mt-10" />
            <div className="absolute bottom-0 right-0 w-24 h-24 bg-white/10 rounded-full -mr-12 -mb-12" />
            <div className="absolute top-1/2 left-1/4 w-8 h-8 bg-white/20 rounded-full" />
            <div className="absolute top-1/3 right-1/4 w-6 h-6 bg-white/20 rounded-full" />

            {/* Level up text */}
            <motion.div
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="relative"
            >
              <p className="text-white/90 font-bold text-lg uppercase tracking-widest mb-2">
                {playerName ? `Grattis, ${playerName}!` : 'Level up!'}
              </p>
            </motion.div>

            {/* Big level number */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 400, delay: 0.3 }}
              className="relative"
            >
              <div className="w-28 h-28 mx-auto rounded-full bg-white/20 backdrop-blur flex items-center justify-center ring-4 ring-white/30">
                <div className="w-24 h-24 rounded-full bg-white flex items-center justify-center shadow-xl">
                  <span className="text-5xl font-black bg-gradient-to-br from-purple-600 to-pink-600 bg-clip-text text-transparent">
                    {newLevel}
                  </span>
                </div>
              </div>
            </motion.div>

            {/* Title */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="mt-4"
            >
              {titleChanged ? (
                <div className="space-y-1">
                  <p className="text-white/70 text-sm line-through">{oldTitle}</p>
                  <p className="text-white font-bold text-xl flex items-center justify-center gap-2">
                    <span>✨</span>
                    {newTitle}
                    <span>✨</span>
                  </p>
                </div>
              ) : (
                <p className="text-white font-bold text-xl">{newTitle}</p>
              )}
            </motion.div>
          </div>

          {/* Reward section */}
          <div className="p-6">
            {reward ? (
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="bg-gradient-to-br from-amber-50 to-yellow-50 rounded-2xl p-5 border-2 border-amber-200 text-center"
              >
                <motion.div
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: 'spring', stiffness: 300, delay: 0.8 }}
                  className="text-5xl mb-3"
                >
                  {reward.icon}
                </motion.div>
                <p className="text-amber-600 font-bold text-sm uppercase tracking-wide mb-1">
                  Ny belöning upplåst!
                </p>
                <h3 className="font-bold text-xl text-gray-800 mb-2">{reward.name}</h3>
                <p className="text-gray-600 text-sm">{reward.description}</p>
              </motion.div>
            ) : (
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="text-center py-4"
              >
                <p className="text-gray-500">
                  Fortsätt spela för fler belöningar!
                </p>
              </motion.div>
            )}

            {/* Continue button */}
            <motion.button
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.8 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={onClose}
              className={`w-full mt-5 py-4 rounded-xl font-bold text-white text-lg shadow-lg bg-gradient-to-r ${getLevelGradient()} hover:shadow-xl transition-shadow`}
            >
              Fantastiskt! 🎉
            </motion.button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
