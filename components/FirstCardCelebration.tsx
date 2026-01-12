'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '@/stores/gameStore';
import { playAchievementSound } from '@/lib/audio';
import { hapticCelebration } from '@/lib/haptics';

// Confetti particle component
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

interface FirstCardCelebrationProps {
  xpEarned: number;
  wasCorrect: boolean;
  onContinue: () => void;
}

export default function FirstCardCelebration({ xpEarned, wasCorrect, onContinue }: FirstCardCelebrationProps) {
  const [showConfetti, setShowConfetti] = useState(true);
  const [xpAnimated, setXpAnimated] = useState(0);

  const playerName = useGameStore((state) => state.playerName);
  const totalXP = useGameStore((state) => state.stats.totalXP);
  const settings = useGameStore((state) => state.settings);

  const confettiColors = ['#8B5CF6', '#EC4899', '#F59E0B', '#10B981', '#3B82F6', '#EF4444'];

  // Pre-computed confetti properties
  const [confettiProps] = useState(() =>
    Array.from({ length: 50 }).map(() => ({
      randomX: Math.random() * 100,
      randomRotate: Math.random() * 720 - 360,
    }))
  );

  useEffect(() => {
    // Play celebration sound and haptic
    if (settings.soundEnabled) {
      playAchievementSound();
    }
    hapticCelebration();

    // Animate XP counter
    const duration = 1000;
    const steps = 20;
    const increment = xpEarned / steps;
    let current = 0;
    const interval = setInterval(() => {
      current += increment;
      if (current >= xpEarned) {
        setXpAnimated(xpEarned);
        clearInterval(interval);
      } else {
        setXpAnimated(Math.floor(current));
      }
    }, duration / steps);

    // Hide confetti after animation
    const confettiTimer = setTimeout(() => setShowConfetti(false), 3000);

    return () => {
      clearInterval(interval);
      clearTimeout(confettiTimer);
    };
  }, [xpEarned, settings.soundEnabled]);

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

      {/* Full screen celebration */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="fixed inset-0 bg-gradient-to-b from-purple-900/95 to-indigo-900/95 flex items-center justify-center z-50 p-4"
      >
        <motion.div
          initial={{ scale: 0.5, opacity: 0, y: 50 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          transition={{ type: 'spring', damping: 20, stiffness: 300 }}
          className="bg-white rounded-3xl shadow-2xl max-w-sm w-full overflow-hidden"
        >
          {/* Header */}
          <div className="bg-gradient-to-br from-purple-500 via-pink-500 to-orange-400 p-8 text-center relative overflow-hidden">
            {/* Decorative circles */}
            <div className="absolute top-0 left-0 w-20 h-20 bg-white/10 rounded-full -ml-10 -mt-10" />
            <div className="absolute bottom-0 right-0 w-24 h-24 bg-white/10 rounded-full -mr-12 -mb-12" />
            <div className="absolute top-1/2 left-1/4 w-8 h-8 bg-white/20 rounded-full" />
            <div className="absolute top-1/3 right-1/4 w-6 h-6 bg-white/20 rounded-full" />

            {/* Celebration text */}
            <motion.div
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <span className="text-6xl block mb-2">
                {wasCorrect ? '🎉' : '💪'}
              </span>
              <h1 className="text-3xl font-black text-white mb-1">
                {wasCorrect ? 'FANTASTISKT!' : 'BRA JOBBAT!'}
              </h1>
              <p className="text-white/90">
                Välkommen, {playerName}!
              </p>
            </motion.div>
          </div>

          {/* Content */}
          <div className="p-6 space-y-5">
            {/* XP earned */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 300, delay: 0.4 }}
              className="bg-gradient-to-br from-amber-50 to-yellow-50 rounded-2xl p-5 border-2 border-amber-200 text-center"
            >
              <motion.div
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 0.5, delay: 0.6 }}
                className="text-4xl font-black text-amber-600 mb-1"
              >
                +{xpAnimated} XP
              </motion.div>
              <p className="text-amber-700 text-sm font-medium">
                Din första poäng!
              </p>
            </motion.div>

            {/* Level badge */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="flex items-center justify-center gap-4"
            >
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-lg ring-4 ring-purple-200">
                <span className="text-2xl font-black text-white">1</span>
              </div>
              <div className="text-left">
                <p className="text-sm text-gray-500">Du är nu</p>
                <p className="font-bold text-lg text-gray-800">Nivå 1</p>
                <p className="text-xs text-purple-600">Nybörjare</p>
              </div>
            </motion.div>

            {/* Progress bar */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.7 }}
              className="space-y-2"
            >
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Framsteg till Nivå 2</span>
                <span className="font-bold text-purple-600">{totalXP}/100 XP</span>
              </div>
              <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min((totalXP / 100) * 100, 100)}%` }}
                  transition={{ duration: 1, delay: 0.8 }}
                  className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full relative"
                >
                  {/* Shimmer effect */}
                  <motion.div
                    animate={{ x: ['-100%', '200%'] }}
                    transition={{ duration: 2, repeat: Infinity, delay: 1.5 }}
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                  />
                </motion.div>
              </div>
            </motion.div>

            {/* Next reward teaser */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.9 }}
              className="flex items-center gap-3 bg-purple-50 rounded-xl p-3"
            >
              <span className="text-2xl">💡</span>
              <div>
                <p className="text-sm text-purple-700">
                  <span className="font-bold">Vid nivå 2:</span> Ledtrådar!
                </p>
              </div>
            </motion.div>

            {/* Continue button with pulse animation */}
            <motion.button
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 1 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={onContinue}
              className="w-full py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white text-lg font-bold rounded-xl shadow-lg hover:shadow-xl transition-shadow relative overflow-hidden"
            >
              {/* Pulse effect */}
              <motion.div
                animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="absolute inset-0 bg-white rounded-xl"
              />
              <span className="relative z-10">Fortsätt spela! 🚀</span>
            </motion.button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
