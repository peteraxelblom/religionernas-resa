'use client';

import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { Boss } from '@/types/level';
import { playBossUnlockSound } from '@/lib/audio';
import { useEffect } from 'react';

interface BossUnlockModalProps {
  boss: Boss | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function BossUnlockModal({ boss, isOpen, onClose }: BossUnlockModalProps) {
  // Play sound when modal opens
  useEffect(() => {
    if (isOpen && boss) {
      playBossUnlockSound();
    }
  }, [isOpen, boss]);

  if (!boss) return null;

  const getReligionGradient = () => {
    switch (boss.religion) {
      case 'judaism': return 'from-blue-600 to-blue-800';
      case 'christianity': return 'from-yellow-600 to-orange-700';
      case 'islam': return 'from-green-600 to-green-800';
      case 'shared': return 'from-purple-600 to-purple-800';
      default: return 'from-red-600 to-red-800';
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Dark backdrop */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 z-50"
          />

          {/* Modal */}
          <motion.div
            key="modal"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div className="bg-gradient-to-b from-gray-900 to-gray-800 rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border-4 border-red-500">
              {/* Header with animated boss */}
              <div className={`bg-gradient-to-br ${getReligionGradient()} p-8 text-center relative overflow-hidden`}>
                {/* Animated background particles */}
                <div className="absolute inset-0 overflow-hidden">
                  {[...Array(20)].map((_, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 100 }}
                      animate={{
                        opacity: [0, 0.6, 0],
                        y: [-20, -200],
                        x: Math.sin(i * 0.5) * 50,
                      }}
                      transition={{
                        duration: 3,
                        delay: i * 0.1,
                        repeat: Infinity,
                        repeatDelay: 1,
                      }}
                      className="absolute w-2 h-2 bg-red-400 rounded-full"
                      style={{ left: `${(i / 20) * 100}%` }}
                    />
                  ))}
                </div>

                {/* Boss icon */}
                <motion.div
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: 'spring', stiffness: 200, delay: 0.2 }}
                  className="relative z-10"
                >
                  <motion.div
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                    className="text-8xl mb-4"
                  >
                    👹
                  </motion.div>
                </motion.div>

                {/* Title */}
                <motion.h2
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="text-3xl font-black text-white mb-2 relative z-10"
                >
                  BOSS UPPLÅST!
                </motion.h2>
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4 }}
                  className="text-white/80 text-lg relative z-10"
                >
                  {boss.name}
                </motion.p>
              </div>

              {/* Content */}
              <div className="p-6 text-center">
                <motion.p
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="text-gray-300 mb-6"
                >
                  {boss.description}
                </motion.p>

                {/* Boss stats */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                  className="flex justify-center gap-6 mb-6"
                >
                  <div className="text-center">
                    <div className="text-2xl font-bold text-red-400">{boss.health}</div>
                    <div className="text-xs text-gray-400">HP</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-red-400">{boss.lives}</div>
                    <div className="text-xs text-gray-400">Liv</div>
                  </div>
                </motion.div>

                {/* Buttons */}
                <div className="flex flex-col gap-3">
                  <Link href={`/boss/${boss.id}`} onClick={onClose}>
                    <motion.button
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.7 }}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="w-full py-4 bg-gradient-to-r from-red-500 to-orange-500 text-white font-bold text-lg rounded-xl hover:opacity-90 transition-opacity"
                    >
                      Utmana bossen!
                    </motion.button>
                  </Link>
                  <motion.button
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.8 }}
                    onClick={onClose}
                    className="py-3 text-gray-400 hover:text-white transition-colors"
                  >
                    Senare
                  </motion.button>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
