'use client';

import { useState, useCallback } from 'react';
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

  // No wrapper animations - each component handles its own entry/exit
  // This prevents double animations and position jumping
  return (
    <>
      {step === 'naming' && (
        <NameInputModal onSubmit={handleNameSubmit} />
      )}

      {step === 'firstCard' && (
        <GuidedFirstCard onComplete={handleCardComplete} />
      )}

      {step === 'celebration' && (
        <FirstCardCelebration
          xpEarned={earnedXP}
          wasCorrect={wasCorrect}
          onContinue={handleCelebrationComplete}
        />
      )}
    </>
  );
}
