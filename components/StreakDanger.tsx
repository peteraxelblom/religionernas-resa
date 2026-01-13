'use client';

import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

interface StreakDangerProps {
  streak: number;
  isVisible: boolean;
}

// Streak danger indicator that shows when streak is at risk
export default function StreakDanger({ streak, isVisible }: StreakDangerProps) {
  if (!isVisible || streak < 3) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="flex items-center gap-2 px-3 py-1.5 bg-orange-100 border border-orange-300 rounded-full"
    >
      <motion.span
        animate={{ scale: [1, 1.2, 1] }}
        transition={{ duration: 0.5, repeat: Infinity }}
        className="text-orange-500"
      >
        🔥
      </motion.span>
      <span className="text-sm font-medium text-orange-700">
        {streak}x streak i fara!
      </span>
    </motion.div>
  );
}

// Streak break animation (glass shatter effect)
export function StreakBreakAnimation({
  lostStreak,
  isVisible,
  onComplete,
}: {
  lostStreak: number;
  isVisible: boolean;
  onComplete?: () => void;
}) {
  useEffect(() => {
    if (isVisible && onComplete) {
      const timer = setTimeout(onComplete, 2000);
      return () => clearTimeout(timer);
    }
  }, [isVisible, onComplete]);

  // Pre-compute shatter pieces using useState initializer (only runs once)
  const [pieces] = useState(() =>
    [...Array(12)].map((_, i) => ({
      id: i,
      angle: (i / 12) * 360,
      distance: 50 + Math.random() * 100,
      rotation: Math.random() * 720 - 360,
      size: 8 + Math.random() * 8,
      delay: Math.random() * 0.2,
    }))
  );

  if (!isVisible || lostStreak < 3) return null;

  return (
    <motion.div
      initial={{ opacity: 1 }}
      animate={{ opacity: 0 }}
      transition={{ duration: 2, delay: 0.5 }}
      className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none"
    >
      <div className="relative">
        {/* Original streak number shattering */}
        <motion.div
          initial={{ scale: 1, opacity: 1 }}
          animate={{ scale: 0.5, opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="text-6xl font-black text-orange-500"
        >
          {lostStreak}x
        </motion.div>

        {/* Shatter pieces */}
        {pieces.map((piece) => (
          <motion.div
            key={piece.id}
            initial={{ x: 0, y: 0, rotate: 0, opacity: 1, scale: 1 }}
            animate={{
              x: Math.cos((piece.angle * Math.PI) / 180) * piece.distance,
              y: Math.sin((piece.angle * Math.PI) / 180) * piece.distance + 100, // Fall down
              rotate: piece.rotation,
              opacity: 0,
              scale: 0.5,
            }}
            transition={{
              duration: 1,
              delay: piece.delay,
              ease: 'easeOut',
            }}
            className="absolute top-1/2 left-1/2"
            style={{
              width: piece.size,
              height: piece.size,
              background: `linear-gradient(135deg, #f97316, #ea580c)`,
              borderRadius: '2px',
              boxShadow: '0 0 10px rgba(249, 115, 22, 0.5)',
            }}
          />
        ))}

        {/* "Streak lost!" text */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="absolute top-full left-1/2 -translate-x-1/2 mt-4 whitespace-nowrap"
        >
          <span className="text-xl font-bold text-red-500">Streak förlorad! 💔</span>
        </motion.div>
      </div>
    </motion.div>
  );
}

// Close call celebration (narrow escape)
export function CloseCallCelebration({
  type,
  isVisible,
  onComplete,
}: {
  type: 'time' | 'streak' | 'lastLife';
  isVisible: boolean;
  onComplete?: () => void;
}) {
  useEffect(() => {
    if (isVisible && onComplete) {
      const timer = setTimeout(onComplete, 2000);
      return () => clearTimeout(timer);
    }
  }, [isVisible, onComplete]);

  if (!isVisible) return null;

  const messages = {
    time: { emoji: '⏱️', text: 'Precis i tid!', subtext: '1 sekund kvar!' },
    streak: { emoji: '🔥', text: 'Streaken lever!', subtext: 'Det var nära!' },
    lastLife: { emoji: '💚', text: 'Sista chansen!', subtext: 'Du klarade det!' },
  };

  const message = messages[type];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none"
    >
      <motion.div
        initial={{ scale: 0, rotate: -20 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: 'spring', stiffness: 400, damping: 15 }}
        className="bg-gradient-to-r from-green-400 to-emerald-500 text-white px-8 py-6 rounded-2xl shadow-2xl"
      >
        <div className="text-center">
          <motion.span
            animate={{ rotate: [0, -10, 10, 0] }}
            transition={{ duration: 0.5, repeat: 2 }}
            className="text-4xl block mb-2"
          >
            {message.emoji}
          </motion.span>
          <span className="text-2xl font-black block">{message.text}</span>
          <span className="text-sm opacity-80">{message.subtext}</span>
        </div>
      </motion.div>
    </motion.div>
  );
}
