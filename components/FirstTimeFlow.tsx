'use client';

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import NameInputModal from './NameInputModal';
import GuidedFirstCard from './GuidedFirstCard';
import FirstCardCelebration from './FirstCardCelebration';
import { useGameStore } from '@/stores/gameStore';

interface FirstTimeFlowProps {
  onComplete: () => void;
}

export default function FirstTimeFlow({ onComplete }: FirstTimeFlowProps) {
  const [earnedXP, setEarnedXP] = useState(0);
  const [wasCorrect, setWasCorrect] = useState(false);

  const { startOnboarding, addXP, completeOnboarding, onboardingStep, setOnboardingStep } = useGameStore();

  const handleNameSubmit = useCallback((name: string) => {
    // Use atomic action to set name and advance step in single state update
    startOnboarding(name);
  }, [startOnboarding]);

  const handleCardComplete = useCallback((correct: boolean) => {
    // Award XP: 10 for correct, 5 for wrong (everyone wins!)
    const xp = correct ? 10 : 5;
    setEarnedXP(xp);
    setWasCorrect(correct);
    addXP(xp);
    setOnboardingStep('celebration');
  }, [addXP, setOnboardingStep]);

  const handleCelebrationComplete = useCallback(() => {
    completeOnboarding();
    onComplete();
  }, [completeOnboarding, onComplete]);

  // Use onboardingStep from store, with 'naming' as fallback
  const step = onboardingStep || 'naming';

  return (
    <AnimatePresence mode="wait">
      {step === 'naming' && (
        <motion.div
          key="naming"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.3 }}
        >
          <NameInputModal onSubmit={handleNameSubmit} />
        </motion.div>
      )}

      {step === 'firstCard' && (
        <motion.div
          key="firstCard"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, x: -50 }}
          transition={{ duration: 0.4, type: 'spring', damping: 20 }}
        >
          <GuidedFirstCard onComplete={handleCardComplete} />
        </motion.div>
      )}

      {step === 'celebration' && (
        <motion.div
          key="celebration"
          initial={{ opacity: 0, scale: 1.1 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, type: 'spring', damping: 15 }}
        >
          <FirstCardCelebration
            xpEarned={earnedXP}
            wasCorrect={wasCorrect}
            onContinue={handleCelebrationComplete}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
