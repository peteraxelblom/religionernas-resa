'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Reward } from '@/lib/playerLevel';

interface BonusInfoModalProps {
  reward: Reward | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function BonusInfoModal({ reward, isOpen, onClose }: BonusInfoModalProps) {
  if (!reward) return null;

  // Get additional usage info based on reward effect
  const getUsageInfo = (effect: Reward['effect']): string => {
    switch (effect) {
      case 'freeHintPerLevel':
        return 'Tryck på "Tips"-knappen under en fråga för att använda ditt gratis tips.';
      case 'streakShield':
        return 'Aktiveras automatiskt när du svarar fel och har en streak. Skölden återställs varje dag.';
      case 'xpBoost10':
        return 'Aktiv automatiskt! Alla XP du tjänar ökas med 10%.';
      case 'bossExtraLife':
        return 'Du börjar automatiskt bossstrider med 4 liv istället för 3.';
      case 'doubleMasteryXP':
        return 'Automatisk bonus! Du får dubbel XP (50 istället för 25) när ett kort blir bemästrat.';
      case 'speedBonus':
        return 'Svara inom 3 sekunder på kort du redan kan för +5 XP bonus.';
      case 'perfectLevelBonus':
        return 'Klara en nivå med 100% rätt för att få +25 bonus XP.';
      case 'dailyChallengeBoost':
        return 'All XP från dagliga utmaningar fördubblas automatiskt.';
      default:
        return '';
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 z-50"
          />

          {/* Modal */}
          <motion.div
            key="modal"
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
          >
            <div
              className="bg-white rounded-2xl shadow-2xl max-w-sm w-full overflow-hidden pointer-events-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="bg-gradient-to-br from-green-400 to-emerald-500 p-6 text-center">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 300, delay: 0.1 }}
                  className="w-20 h-20 bg-white/20 backdrop-blur rounded-full flex items-center justify-center mx-auto mb-3 ring-4 ring-white/30"
                >
                  <span className="text-5xl">{reward.icon}</span>
                </motion.div>
                <h2 className="text-white font-bold text-xl">{reward.name}</h2>
                <p className="text-white/80 text-sm mt-1">
                  Upplåst på nivå {reward.unlockedAtLevel}
                </p>
              </div>

              {/* Content */}
              <div className="p-6">
                <div className="mb-4">
                  <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-2">
                    Beskrivning
                  </h3>
                  <p className="text-gray-800 font-medium">{reward.description}</p>
                </div>

                <div className="mb-6">
                  <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-2">
                    Hur det fungerar
                  </h3>
                  <p className="text-gray-600 text-sm">{getUsageInfo(reward.effect)}</p>
                </div>

                {/* Close button */}
                <button
                  onClick={onClose}
                  className="w-full py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold rounded-xl hover:opacity-90 transition-opacity"
                >
                  Stäng
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
