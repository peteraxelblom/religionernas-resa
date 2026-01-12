'use client';

import { useEffect, useState, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { useGameStore } from '@/stores/gameStore';
import { getCardById } from '@/data/cards';
import FlashCard from '@/components/cards/FlashCard';
import StreakShieldIndicator from '@/components/StreakShieldIndicator';
import { Card } from '@/types/card';
import { playStreakSound, playLevelCompleteSound } from '@/lib/audio';
import { STRINGS } from '@/lib/strings/sv';

const REVIEW_XP_BONUS = 50; // XP bonus for completing a review session

export default function ReviewPage() {
  const {
    getDueCardIds,
    recordCardAnswer,
    getCardBucket,
    getCardProgress,
    addXP,
    hasReward,
    isShieldAvailable,
    playerName,
  } = useGameStore();

  const [mounted, setMounted] = useState(false);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [streak, setStreak] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [showStreak, setShowStreak] = useState<number | null>(null);
  const [reviewComplete, setReviewComplete] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);

  // Stable shuffle seed - changes each time review is started
  const [shuffleSeed] = useState(() => Math.random());

  // Pre-computed confetti properties for stable rendering
  const [confettiProps] = useState(() =>
    [...Array(30)].map(() => ({
      x: Math.random(),
      rotate: Math.random() * 720 - 360,
      duration: 3 + Math.random() * 2,
      delay: Math.random() * 0.5,
      colorIndex: Math.floor(Math.random() * 5),
      isCircle: Math.random() > 0.5,
    }))
  );

  // Get due cards - shuffled to prevent learning order instead of content
  const dueCards = useMemo(() => {
    const dueCardIds = getDueCardIds();
    const cards = dueCardIds
      .map(id => getCardById(id))
      .filter((card): card is Card => card !== undefined);

    // Shuffle cards using seeded random for consistent order during session
    return cards
      .map((card, i) => ({ card, sort: Math.sin(shuffleSeed * 1000 + i) }))
      .sort((a, b) => a.sort - b.sort)
      .map(({ card }) => card);
  }, [getDueCardIds, shuffleSeed]);

  const currentCard = dueCards[currentCardIndex];
  const progress = dueCards.length > 0 ? (currentCardIndex / dueCards.length) * 100 : 0;

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- Standard Next.js hydration pattern
    setMounted(true);
  }, []);

  const finishReview = useCallback(() => {
    // Award XP bonus for completing review
    addXP(REVIEW_XP_BONUS);

    // Show celebration
    playLevelCompleteSound();
    setShowConfetti(true);
    setReviewComplete(true);
  }, [addXP]);

  const handleAnswer = useCallback((correct: boolean, responseTimeMs: number) => {
    if (!currentCard) return;

    // Record the answer for spaced repetition
    recordCardAnswer(currentCard.id, correct, responseTimeMs);

    const newStreak = correct ? streak + 1 : 0;

    if (correct) {
      setStreak(newStreak);
      setCorrectCount(c => c + 1);

      // Show streak celebration
      if (newStreak >= 3) {
        setShowStreak(newStreak);
        playStreakSound(newStreak);
        setTimeout(() => setShowStreak(null), 1500);
      }
    } else {
      setStreak(0);
    }

    // Move to next card or complete review
    setTimeout(() => {
      if (currentCardIndex < dueCards.length - 1) {
        setCurrentCardIndex(i => i + 1);
      } else {
        finishReview();
      }
    }, 1800);
  }, [currentCard, currentCardIndex, dueCards.length, streak, recordCardAnswer, finishReview]);

  const getStreakMessage = (s: number) => {
    if (s >= 10) return 'OTROLIGT!';
    if (s >= 7) return 'FANTASTISKT!';
    if (s >= 5) return 'Suverant!';
    if (s >= 3) return 'Bra!';
    return '';
  };

  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-2xl text-purple-600">{STRINGS.LOADING}</div>
      </div>
    );
  }

  // No due cards
  if (dueCards.length === 0 && !reviewComplete) {
    return (
      <main className="min-h-screen p-4 md:p-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <Link href="/" className="text-purple-600 hover:text-purple-800">
              <span className="text-2xl">←</span>
              <span className="ml-2">Hem</span>
            </Link>
          </div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-3xl shadow-xl p-8 text-center"
          >
            <div className="text-6xl mb-4">🎉</div>
            <h2 className="text-3xl font-bold text-gray-800 mb-4">
              Inga kort att repetera!
            </h2>
            <p className="text-gray-600 mb-6">
              Du har repeterat alla kort. Kom tillbaka senare eller fortsatt lara dig nya kort!
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/">
                <button className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold rounded-xl hover:opacity-90 transition-opacity">
                  {STRINGS.TO_HOME}
                </button>
              </Link>
              <Link href="/map">
                <button className="w-full sm:w-auto px-6 py-3 bg-gray-200 text-gray-700 font-bold rounded-xl hover:bg-gray-300 transition-colors">
                  Utforska kartan
                </button>
              </Link>
            </div>
          </motion.div>
        </div>
      </main>
    );
  }

  const accuracy = dueCards.length > 0 ? Math.round((correctCount / dueCards.length) * 100) : 0;

  return (
    <main className="min-h-screen p-4 md:p-8 relative">
      {/* Confetti effect */}
      <AnimatePresence>
        {showConfetti && (
          <motion.div
            key="confetti"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 pointer-events-none z-50 overflow-hidden"
          >
            {confettiProps.map((props, i) => (
              <motion.div
                key={i}
                initial={{
                  y: -20,
                  x: props.x * (typeof window !== 'undefined' ? window.innerWidth : 400),
                  rotate: 0,
                }}
                animate={{
                  y: typeof window !== 'undefined' ? window.innerHeight + 100 : 800,
                  rotate: props.rotate,
                }}
                transition={{
                  duration: props.duration,
                  delay: props.delay,
                  ease: 'easeIn',
                }}
                className="absolute w-4 h-4"
                style={{
                  backgroundColor: ['#fcd34d', '#a78bfa', '#34d399', '#f472b6', '#60a5fa'][props.colorIndex],
                  borderRadius: props.isCircle ? '50%' : '0%',
                }}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Streak celebration */}
      <AnimatePresence>
        {showStreak && (
          <motion.div
            key="streak"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            className="fixed inset-0 flex items-center justify-center pointer-events-none z-40"
          >
            <div className="text-center">
              <motion.div
                initial={{ y: 20 }}
                animate={{ y: 0 }}
                className="text-6xl md:text-8xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500"
              >
                {showStreak}x
              </motion.div>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="text-3xl md:text-4xl font-bold text-yellow-500 mt-2"
              >
                {getStreakMessage(showStreak)}
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <Link href="/" className="text-purple-600 hover:text-purple-800">
            <span className="text-2xl">←</span>
            <span className="ml-2">Hem</span>
          </Link>

          <div className="text-center">
            <h1 className="text-xl md:text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-500 to-orange-500">
              Repetition
            </h1>
            <span className="text-sm text-amber-600">+{REVIEW_XP_BONUS} XP bonus</span>
          </div>

          <div className="text-right">
            <div className="text-lg font-bold text-amber-600">{correctCount}/{dueCards.length}</div>
            <div className="text-xs text-gray-500">{STRINGS.CORRECT}</div>
          </div>
        </div>

        {/* Progress bar */}
        <div className="mb-6">
          <div className="flex justify-between text-sm text-gray-600 mb-1">
            <span>Kort {currentCardIndex + 1} av {dueCards.length}</span>
            <StreakShieldIndicator streak={streak} isShieldAvailable={isShieldAvailable()} />
          </div>
          <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              className="h-full bg-gradient-to-r from-amber-400 to-orange-500 rounded-full"
              transition={{ duration: 0.3 }}
            />
          </div>
        </div>

        {/* Review complete screen */}
        {reviewComplete ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-3xl shadow-xl p-8 text-center"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', delay: 0.2 }}
              className="text-6xl mb-4"
            >
              🏆
            </motion.div>

            <h2 className="text-3xl font-bold text-gray-800 mb-2">
              Repetition klar!
            </h2>

            <p className="text-gray-600 mb-6">
              Du har repeterat {dueCards.length} kort och fått +{REVIEW_XP_BONUS} XP bonus!
            </p>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-4 mb-8 max-w-sm mx-auto">
              <div className="bg-green-50 rounded-xl p-4">
                <div className="text-2xl font-bold text-green-600">{correctCount}/{dueCards.length}</div>
                <div className="text-xs text-gray-500">{STRINGS.CORRECT}</div>
              </div>
              <div className="bg-orange-50 rounded-xl p-4">
                <div className="text-2xl font-bold text-orange-600">{accuracy}%</div>
                <div className="text-xs text-gray-500">{STRINGS.ACCURACY}</div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/">
                <button className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold rounded-xl hover:opacity-90 transition-opacity">
                  {STRINGS.TO_HOME}
                </button>
              </Link>
              <Link href="/map">
                <button className="w-full sm:w-auto px-6 py-3 bg-gray-200 text-gray-700 font-bold rounded-xl hover:bg-gray-300 transition-colors">
                  Fortsatt spela
                </button>
              </Link>
            </div>
          </motion.div>
        ) : (
          /* Review play */
          currentCard && (
            <FlashCard
              card={currentCard}
              bucket={getCardBucket(currentCard.id)}
              correctStreak={getCardProgress(currentCard.id).correctStreak}
              sessionStreak={streak}
              onAnswer={handleAnswer}
              hasDoubleMasteryBonus={hasReward('doubleMasteryXP')}
              hasSpeedBonusReward={hasReward('speedBonus')}
              isShieldAvailable={isShieldAvailable()}
              playerName={playerName}
            />
          )
        )}
      </div>
    </main>
  );
}
