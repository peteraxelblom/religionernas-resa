'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore, DailyRewardResult } from '@/stores/gameStore';
import { playMysteryBoxOpen, playRewardReveal } from '@/lib/audio';
import { hapticCelebration, hapticMedium } from '@/lib/haptics';

// Confetti particle for the reveal
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

interface DailyRewardModalProps {
  onClose: () => void;
  onSkip?: () => void;
}

export default function DailyRewardModal({ onClose, onSkip }: DailyRewardModalProps) {
  const [phase, setPhase] = useState<'teaser' | 'opening' | 'reveal'>('teaser');
  const [reward, setReward] = useState<DailyRewardResult | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const [xpAnimated, setXpAnimated] = useState(0);

  const { claimDailyReward, getDailyRewardStreak, playerName } = useGameStore();
  const settings = useGameStore((state) => state.settings);
  const nextStreakDay = getDailyRewardStreak();

  const confettiColors = ['#8B5CF6', '#EC4899', '#F59E0B', '#10B981', '#3B82F6', '#EF4444'];

  // Pre-computed confetti properties
  const [confettiProps] = useState(() =>
    Array.from({ length: 40 }).map(() => ({
      randomX: Math.random() * 100,
      randomRotate: Math.random() * 720 - 360,
    }))
  );

  const handleOpen = () => {
    hapticMedium();
    setPhase('opening');

    // Play mystery box opening sound
    if (settings.soundEnabled) {
      playMysteryBoxOpen();
    }

    // After shake animation, reveal the reward
    setTimeout(() => {
      const result = claimDailyReward();
      setReward(result);
      setPhase('reveal');
      setShowConfetti(true);

      if (settings.soundEnabled) {
        playRewardReveal();
      }
      hapticCelebration();

      // Animate XP counter
      const duration = 1000;
      const steps = 20;
      const increment = result.xp / steps;
      let current = 0;
      const interval = setInterval(() => {
        current += increment;
        if (current >= result.xp) {
          setXpAnimated(result.xp);
          clearInterval(interval);
        } else {
          setXpAnimated(Math.floor(current));
        }
      }, duration / steps);

      // Hide confetti after animation
      setTimeout(() => setShowConfetti(false), 3000);
    }, 1500);
  };

  // Get streak tier info for teaser
  const getStreakTierInfo = (day: number) => {
    if (day >= 7) return { tier: 'Guld', color: 'from-yellow-400 to-amber-500', emoji: '🏆' };
    if (day >= 5) return { tier: 'Silver', color: 'from-gray-300 to-gray-400', emoji: '🥈' };
    if (day >= 3) return { tier: 'Brons', color: 'from-amber-600 to-orange-700', emoji: '🥉' };
    return { tier: 'Start', color: 'from-purple-500 to-pink-500', emoji: '🎁' };
  };

  const tierInfo = getStreakTierInfo(nextStreakDay);

  return (
    <AnimatePresence>
      {/* Confetti */}
      {showConfetti && (
        <>
          {confettiProps.map((props, i) => (
            <ConfettiParticle
              key={i}
              delay={i * 0.04}
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
        onClick={phase === 'teaser' && onSkip ? onSkip : undefined}
      >
        <motion.div
          initial={{ scale: 0.8, opacity: 0, y: 50 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.8, opacity: 0, y: 50 }}
          transition={{ type: 'spring', damping: 20, stiffness: 300 }}
          className="bg-white rounded-3xl shadow-2xl max-w-sm w-full overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Teaser phase - show mystery box */}
          {phase === 'teaser' && (
            <>
              {/* Header */}
              <div className={`bg-gradient-to-br ${tierInfo.color} p-6 text-center relative overflow-hidden`}>
                {/* Decorative circles */}
                <div className="absolute top-0 left-0 w-16 h-16 bg-white/10 rounded-full -ml-8 -mt-8" />
                <div className="absolute bottom-0 right-0 w-20 h-20 bg-white/10 rounded-full -mr-10 -mb-10" />

                <motion.div
                  initial={{ y: -10, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  <p className="text-white/90 font-bold text-sm uppercase tracking-wide mb-2">
                    Daglig belöning
                  </p>
                  <h2 className="text-2xl font-black text-white">
                    {playerName ? `Hej, ${playerName}!` : 'Välkommen!'}
                  </h2>
                </motion.div>
              </div>

              {/* Content */}
              <div className="p-6 space-y-5">
                {/* Mystery box */}
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 300, delay: 0.3 }}
                  className="flex justify-center"
                >
                  <motion.div
                    animate={{
                      rotate: [0, -5, 5, -5, 5, 0],
                      scale: [1, 1.05, 1],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      repeatDelay: 1,
                    }}
                    className="text-8xl"
                  >
                    🎁
                  </motion.div>
                </motion.div>

                {/* Streak info */}
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  className={`bg-gradient-to-r ${tierInfo.color} bg-opacity-10 rounded-xl p-4 text-center`}
                >
                  <div className="flex items-center justify-center gap-2 mb-1">
                    <span className="text-xl">{tierInfo.emoji}</span>
                    <span className="font-bold text-gray-800">
                      Dag {nextStreakDay} i rad!
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">
                    {nextStreakDay >= 7
                      ? 'Maximal belöning!'
                      : `Dag ${7 - nextStreakDay + 1} för maxbelöning 🏆`}
                  </p>
                </motion.div>

                {/* Open button */}
                <motion.button
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.6 }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleOpen}
                  className={`w-full py-4 rounded-xl font-bold text-white text-lg shadow-lg bg-gradient-to-r ${tierInfo.color} hover:shadow-xl transition-shadow`}
                >
                  Öppna belöning! 🎁
                </motion.button>

                {/* Skip option */}
                {onSkip && (
                  <motion.button
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.8 }}
                    onClick={onSkip}
                    className="w-full text-gray-400 text-sm hover:text-gray-600 transition-colors"
                  >
                    (eller hoppa över)
                  </motion.button>
                )}
              </div>
            </>
          )}

          {/* Opening phase - shaking box */}
          {phase === 'opening' && (
            <div className="p-12 flex flex-col items-center justify-center">
              <motion.div
                animate={{
                  rotate: [0, -15, 15, -15, 15, -10, 10, -5, 5, 0],
                  scale: [1, 1.1, 1.1, 1.1, 1.1, 1.2, 1.2, 1.3, 1.3, 1.5],
                }}
                transition={{ duration: 1.5, ease: 'easeInOut' }}
                className="text-9xl"
              >
                🎁
              </motion.div>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: [0, 1, 0] }}
                transition={{ duration: 1.5, times: [0, 0.5, 1] }}
                className="mt-4 text-xl font-bold text-purple-600"
              >
                Öppnar...
              </motion.p>
            </div>
          )}

          {/* Reveal phase - show reward */}
          {phase === 'reveal' && reward && (
            <>
              {/* Header */}
              <div className="bg-gradient-to-br from-amber-400 via-yellow-400 to-orange-400 p-6 text-center relative overflow-hidden">
                {/* Decorative circles */}
                <div className="absolute top-0 left-0 w-16 h-16 bg-white/20 rounded-full -ml-8 -mt-8" />
                <div className="absolute bottom-0 right-0 w-20 h-20 bg-white/20 rounded-full -mr-10 -mb-10" />

                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 300 }}
                >
                  <span className="text-6xl block mb-2">🎉</span>
                  <h2 className="text-2xl font-black text-white">
                    GRATTIS!
                  </h2>
                </motion.div>
              </div>

              {/* Content */}
              <div className="p-6 space-y-4">
                {/* XP reward */}
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 300, delay: 0.2 }}
                  className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-2xl p-5 text-center border-2 border-purple-200"
                >
                  <motion.div
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 0.5, delay: 0.4 }}
                    className="text-5xl font-black text-purple-600 mb-1"
                  >
                    +{xpAnimated} XP
                  </motion.div>
                  <p className="text-purple-700 text-sm font-medium">
                    Dag {reward.streakDay} belöning
                  </p>
                </motion.div>

                {/* Bonus item if any */}
                {reward.bonusItem && (
                  <motion.div
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: 'spring', stiffness: 300, delay: 0.5 }}
                    className="bg-gradient-to-br from-amber-50 to-yellow-50 rounded-2xl p-4 text-center border-2 border-amber-200"
                  >
                    <span className="text-4xl block mb-2">
                      {reward.bonusItem === 'streakShield' ? '🛡️' : '💡'}
                    </span>
                    <p className="font-bold text-amber-800">
                      {reward.bonusItem === 'streakShield' ? 'Bonusskydd!' : 'Bonusledtråd!'}
                    </p>
                    <p className="text-sm text-amber-600">
                      {reward.bonusItem === 'streakShield'
                        ? 'Extra skydd för din streak'
                        : 'Extra hjälp när du behöver det'}
                    </p>
                  </motion.div>
                )}

                {/* Next day teaser */}
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.7 }}
                  className="bg-gray-50 rounded-xl p-3 text-center"
                >
                  <p className="text-sm text-gray-600">
                    🌟 Kom tillbaka imorgon för dag {reward.streakDay + 1}!
                  </p>
                </motion.div>

                {/* Continue button */}
                <motion.button
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.8 }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={onClose}
                  className="w-full py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white text-lg font-bold rounded-xl shadow-lg hover:shadow-xl transition-shadow"
                >
                  Fantastiskt! 🚀
                </motion.button>
              </div>
            </>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
