'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState } from 'react';
import { playMysteryBoxOpen } from '@/lib/audio';

interface GoldenCardCelebrationProps {
  isVisible: boolean;
  cardQuestion: string;
  bonusXP: number;
  onComplete?: () => void;
}

export default function GoldenCardCelebration({
  isVisible,
  cardQuestion,
  bonusXP,
  onComplete,
}: GoldenCardCelebrationProps) {
  useEffect(() => {
    if (isVisible) {
      playMysteryBoxOpen();

      const timer = setTimeout(() => {
        if (onComplete) {
          setTimeout(onComplete, 1500);
        }
      }, 2500);

      return () => clearTimeout(timer);
    }
  }, [isVisible, onComplete]);

  // Pre-compute sparkle positions
  const [sparkles] = useState(() =>
    [...Array(16)].map((_, i) => ({
      angle: (i / 16) * 360,
      distance: 80 + Math.random() * 60,
      delay: Math.random() * 0.3,
      size: 4 + Math.random() * 6,
    }))
  );

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          key="golden-celebration"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 flex items-center justify-center z-50 bg-black/70"
        >
          {/* Sparkle burst */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            {sparkles.map((sparkle, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0, x: 0, y: 0 }}
                animate={{
                  opacity: [0, 1, 1, 0],
                  scale: [0, 1, 1, 0.5],
                  x: [0, Math.cos((sparkle.angle * Math.PI) / 180) * sparkle.distance],
                  y: [0, Math.sin((sparkle.angle * Math.PI) / 180) * sparkle.distance],
                }}
                transition={{
                  duration: 1.2,
                  delay: sparkle.delay,
                  ease: 'easeOut',
                }}
                className="absolute rounded-full"
                style={{
                  width: sparkle.size,
                  height: sparkle.size,
                  background: 'linear-gradient(135deg, #fcd34d, #f59e0b)',
                  boxShadow: '0 0 10px #fcd34d, 0 0 20px #f59e0b',
                }}
              />
            ))}
          </div>

          {/* Golden card */}
          <motion.div
            initial={{ scale: 0, rotateY: 180 }}
            animate={{
              scale: [0, 1.2, 1],
              rotateY: [180, 0, 0],
            }}
            transition={{
              duration: 0.8,
              times: [0, 0.6, 1],
              ease: 'easeOut',
            }}
            className="relative"
          >
            {/* Golden glow */}
            <motion.div
              className="absolute -inset-4 bg-gradient-to-r from-yellow-400 via-amber-300 to-yellow-400 rounded-3xl blur-xl"
              animate={{
                opacity: [0.5, 0.8, 0.5],
                scale: [1, 1.1, 1],
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
              }}
            />

            {/* Card content */}
            <div className="relative bg-gradient-to-br from-yellow-100 via-amber-50 to-yellow-100 border-4 border-yellow-400 rounded-2xl p-8 text-center shadow-2xl">
              {/* Shimmer effect */}
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-yellow-300/40 to-transparent rounded-2xl"
                animate={{ x: ['-100%', '200%'] }}
                transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 0.5 }}
              />

              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.3, type: 'spring' }}
              >
                <motion.span
                  className="text-6xl block mb-4"
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{ duration: 0.5, repeat: 3 }}
                >
                  ✨
                </motion.span>

                <h2 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-600 via-amber-500 to-yellow-600 mb-2">
                  GULDKORT HITTAT!
                </h2>

                <p className="text-gray-700 text-sm mb-4 max-w-xs">
                  {cardQuestion}
                </p>

                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.5, type: 'spring' }}
                  className="inline-flex items-center gap-2 bg-gradient-to-r from-yellow-500 to-amber-500 text-white px-4 py-2 rounded-full font-bold"
                >
                  <span>+{bonusXP}</span>
                  <span>XP BONUS!</span>
                </motion.div>
              </motion.div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// Helper to check if a card is golden (deterministic based on card id)
export function isGoldenCard(cardId: string): boolean {
  const hash = cardId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return hash % 20 === 0; // 1 in 20 cards
}

// Golden card indicator on FlashCard
export function GoldenCardBadge() {
  return (
    <motion.div
      initial={{ scale: 0, rotate: -180 }}
      animate={{ scale: 1, rotate: 0 }}
      className="absolute -top-2 -right-2 z-10"
    >
      <motion.div
        animate={{
          rotate: [0, 10, -10, 0],
          scale: [1, 1.1, 1],
        }}
        transition={{ duration: 1, repeat: Infinity }}
        className="w-10 h-10 rounded-full bg-gradient-to-br from-yellow-300 to-amber-500 flex items-center justify-center shadow-lg"
        style={{ boxShadow: '0 0 15px rgba(251, 191, 36, 0.6)' }}
      >
        <span className="text-lg">✨</span>
      </motion.div>
    </motion.div>
  );
}
