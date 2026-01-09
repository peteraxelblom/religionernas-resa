'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '@/stores/gameStore';
import { getAchievementById } from '@/data/achievements';
import { playAchievementSound } from '@/lib/audio';

export default function AchievementToast() {
  const { newlyUnlockedAchievement, clearNewlyUnlockedAchievement } = useGameStore();
  const [visible, setVisible] = useState(false);
  const [achievement, setAchievement] = useState<{
    id: string;
    nameSv: string;
    description: string;
    icon: string;
  } | null>(null);

  useEffect(() => {
    if (newlyUnlockedAchievement) {
      const achievementData = getAchievementById(newlyUnlockedAchievement);
      if (achievementData) {
        setAchievement({
          id: achievementData.id,
          nameSv: achievementData.nameSv,
          description: achievementData.description,
          icon: achievementData.icon,
        });
        setVisible(true);
        playAchievementSound();

        // Auto-hide after 4 seconds
        const timer = setTimeout(() => {
          setVisible(false);
          // Clear the state after animation completes
          setTimeout(() => {
            clearNewlyUnlockedAchievement();
          }, 300);
        }, 4000);

        return () => clearTimeout(timer);
      }
    }
  }, [newlyUnlockedAchievement, clearNewlyUnlockedAchievement]);

  return (
    <AnimatePresence>
      {visible && achievement && (
        <motion.div
          initial={{ opacity: 0, y: -100, scale: 0.8 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -50, scale: 0.9 }}
          transition={{ type: 'spring', stiffness: 300, damping: 25 }}
          className="fixed top-4 left-1/2 -translate-x-1/2 z-50"
        >
          <div className="bg-gradient-to-r from-yellow-400 via-amber-400 to-yellow-500 rounded-2xl shadow-2xl p-1">
            <div className="bg-white rounded-xl px-6 py-4 flex items-center gap-4">
              {/* Icon with glow effect */}
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: 'spring', stiffness: 400, damping: 15, delay: 0.2 }}
                className="relative"
              >
                <div className="absolute inset-0 bg-yellow-400 rounded-full blur-md opacity-50" />
                <div className="relative text-5xl">{achievement.icon}</div>
              </motion.div>

              {/* Content */}
              <div>
                <motion.p
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 }}
                  className="text-xs font-bold text-amber-600 uppercase tracking-wider"
                >
                  Prestation upplast!
                </motion.p>
                <motion.h3
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 }}
                  className="text-xl font-bold text-gray-800"
                >
                  {achievement.nameSv}
                </motion.h3>
                <motion.p
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 }}
                  className="text-sm text-gray-600"
                >
                  {achievement.description}
                </motion.p>
              </div>

              {/* Sparkles */}
              {[...Array(6)].map((_, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{
                    opacity: [0, 1, 0],
                    scale: [0, 1, 0],
                  }}
                  transition={{
                    duration: 1.5,
                    delay: 0.3 + i * 0.1,
                    repeat: Infinity,
                    repeatDelay: 2,
                  }}
                  className="absolute w-2 h-2 bg-yellow-400 rounded-full"
                  style={{
                    left: `${10 + i * 15}%`,
                    top: `${Math.random() * 100}%`,
                    boxShadow: '0 0 8px #fbbf24',
                  }}
                />
              ))}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
