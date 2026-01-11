'use client';

import { useEffect, useState, useMemo, useCallback, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { useGameStore } from '@/stores/gameStore';
import { getLevelById, getNextLevel } from '@/data/levels';
import { getCardsByLevel, getCardsByReligion, allCards } from '@/data/cards';
import FlashCard from '@/components/cards/FlashCard';
import { Card } from '@/types/card';
import { playStreakSound, playLevelCompleteSound } from '@/lib/audio';
import {
  calculatePerformanceMetrics,
  determineFlowState,
  getAdaptiveSettings,
  sortCardsByAdaptivePriority,
  calculateAdaptivePoints,
  getEncouragementMessage,
  shouldShowHint,
  FlowState,
} from '@/lib/adaptiveDifficulty';
import { STRINGS } from '@/lib/strings/sv';

export default function LevelPage() {
  const params = useParams();
  const router = useRouter();
  const levelId = params.levelId as string;

  const {
    levelProgress,
    completeLevel,
    recordCardAnswer,
    getCardBucket,
    getCardProgress,
    isLevelCompleted,
    cardProgress,
  } = useGameStore();

  const [mounted, setMounted] = useState(false);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [showStreak, setShowStreak] = useState<number | null>(null);
  const [levelComplete, setLevelComplete] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);

  // Adaptive difficulty state (Phase 3)
  const [recentAnswers, setRecentAnswers] = useState<{ correct: boolean; responseTimeMs: number }[]>([]);
  const [flowState, setFlowState] = useState<FlowState>('flow');
  const [encouragementMessage, setEncouragementMessage] = useState<string | null>(null);

  const level = useMemo(() => getLevelById(levelId), [levelId]);

  // Stable shuffle seed - changes each time the level is started
  const [shuffleSeed] = useState(() => Math.random());

  // Get cards for this level - for boss levels, get random cards from religion
  // Randomize order to prevent learning screen positions instead of content
  const cards = useMemo(() => {
    if (!level) return [];

    let levelCards: Card[] = [];

    if (level.type === 'boss') {
      // Boss level: get cards from the religion
      if (levelId === 'boss-final') {
        // Final boss: random cards from all religions
        levelCards = [...allCards].slice(0, 15);
      } else {
        // Religion boss: get cards from that religion
        levelCards = getCardsByReligion(level.religion).slice(0, 12);
      }
    } else {
      // Normal level: get cards by level ID
      levelCards = [...getCardsByLevel(levelId)];
    }

    // Shuffle cards to prevent learning order instead of content
    // Use seeded shuffle for consistent order during the level session
    levelCards = levelCards
      .map((card, i) => ({ card, sort: Math.sin(shuffleSeed * 1000 + i) }))
      .sort((a, b) => a.sort - b.sort)
      .map(({ card }) => card);

    // Apply adaptive sorting (prioritizes cards needing review)
    return sortCardsByAdaptivePriority(levelCards, cardProgress, flowState);
  }, [level, levelId, cardProgress, flowState, shuffleSeed]);

  const currentCard = cards[currentCardIndex];
  const progress = cards.length > 0 ? ((currentCardIndex) / cards.length) * 100 : 0;

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleAnswer = useCallback((correct: boolean, responseTimeMs: number) => {
    if (!currentCard) return;

    // Record the answer for spaced repetition
    recordCardAnswer(currentCard.id, correct, responseTimeMs);

    // Track recent answers for adaptive difficulty (Phase 3)
    const newRecentAnswers = [...recentAnswers, { correct, responseTimeMs }].slice(-10);
    setRecentAnswers(newRecentAnswers);

    // Calculate performance metrics and update flow state
    const metrics = calculatePerformanceMetrics(newRecentAnswers);
    const newFlowState = determineFlowState(metrics);
    setFlowState(newFlowState);

    // Get adaptive settings based on flow state
    const settings = getAdaptiveSettings(newFlowState);

    // Calculate points with adaptive bonuses
    const newStreak = correct ? streak + 1 : 0;
    const { points } = calculateAdaptivePoints(correct, responseTimeMs, newStreak, settings);

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

    setScore(s => s + points);

    // Show encouragement message if needed (Phase 3)
    const encouragement = getEncouragementMessage(newFlowState, metrics);
    if (encouragement) {
      setEncouragementMessage(encouragement);
      setTimeout(() => setEncouragementMessage(null), 3000);
    }

    // Move to next card or complete level
    setTimeout(() => {
      if (currentCardIndex < cards.length - 1) {
        setCurrentCardIndex(i => i + 1);
      } else {
        finishLevel();
      }
    }, 1800);
  }, [currentCard, currentCardIndex, cards.length, streak, recordCardAnswer, recentAnswers]);

  const finishLevel = useCallback(() => {
    if (!level) return;

    // Calculate stars based on performance
    const accuracy = cards.length > 0 ? (correctCount / cards.length) * 100 : 0;
    let stars = 0;

    if (accuracy >= level.passingScore) {
      stars = 1;
      if (accuracy >= 80) stars = 2;
      if (accuracy >= 95) stars = 3;
    }

    // Complete the level in the store
    completeLevel(levelId, stars, score);

    // Show celebration and play sound
    playLevelCompleteSound();
    setShowConfetti(true);
    setLevelComplete(true);
  }, [level, correctCount, cards.length, score, levelId, completeLevel]);

  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-2xl text-purple-600">{STRINGS.LOADING_LEVEL}</div>
      </div>
    );
  }

  if (!level) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <div className="text-2xl text-red-500">Nivån hittades inte</div>
        <Link href="/map" className="text-purple-600 underline">
          {STRINGS.BACK_TO_MAP}
        </Link>
      </div>
    );
  }

  if (cards.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <div className="text-2xl text-orange-500">Inga kort i denna nivå ännu</div>
        <Link href="/map" className="text-purple-600 underline">
          {STRINGS.BACK_TO_MAP}
        </Link>
      </div>
    );
  }

  const getReligionColor = () => {
    switch (level.religion) {
      case 'judaism': return 'from-blue-500 to-blue-700';
      case 'christianity': return 'from-yellow-500 to-orange-500';
      case 'islam': return 'from-green-500 to-green-700';
      case 'shared': return 'from-purple-500 to-purple-700';
    }
  };

  const getStreakMessage = (s: number) => {
    if (s >= 10) return 'OTROLIGT!';
    if (s >= 7) return 'FANTASTISKT!';
    if (s >= 5) return 'Suveränt!';
    if (s >= 3) return 'Bra!';
    return '';
  };

  const nextLevel = getNextLevel(levelId);
  const accuracy = cards.length > 0 ? Math.round((correctCount / cards.length) * 100) : 0;
  const stars = accuracy >= 95 ? 3 : accuracy >= 80 ? 2 : accuracy >= level.passingScore ? 1 : 0;

  return (
    <main className="min-h-screen p-4 md:p-8 relative">
      {/* Confetti effect */}
      <AnimatePresence>
        {showConfetti && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 pointer-events-none z-50 overflow-hidden"
          >
            {[...Array(30)].map((_, i) => (
              <motion.div
                key={i}
                initial={{
                  y: -20,
                  x: Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 400),
                  rotate: 0,
                }}
                animate={{
                  y: typeof window !== 'undefined' ? window.innerHeight + 100 : 800,
                  rotate: Math.random() * 720 - 360,
                }}
                transition={{
                  duration: 3 + Math.random() * 2,
                  delay: Math.random() * 0.5,
                  ease: 'easeIn',
                }}
                className="absolute w-4 h-4"
                style={{
                  backgroundColor: ['#fcd34d', '#a78bfa', '#34d399', '#f472b6', '#60a5fa'][
                    Math.floor(Math.random() * 5)
                  ],
                  borderRadius: Math.random() > 0.5 ? '50%' : '0%',
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

      {/* Encouragement message (Phase 3 - Adaptive Difficulty) */}
      <AnimatePresence>
        {encouragementMessage && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed bottom-24 left-0 right-0 flex justify-center pointer-events-none z-30"
          >
            <div className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-6 py-3 rounded-full shadow-lg">
              <span className="text-lg font-medium">{encouragementMessage}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <Link href="/map" className="text-purple-600 hover:text-purple-800">
            <span className="text-2xl">←</span>
            <span className="ml-2">Karta</span>
          </Link>

          <div className="text-center">
            <h1 className={`text-xl md:text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r ${getReligionColor()}`}>
              {level.name}
            </h1>
            {level.type === 'boss' && (
              <span className="text-sm text-red-500 font-bold">👹 BOSS BATTLE</span>
            )}
          </div>

          <div className="text-right">
            <div className="text-2xl font-bold text-purple-700">{score}</div>
            <div className="text-xs text-gray-500">{STRINGS.POINTS}</div>
          </div>
        </div>

        {/* Progress bar */}
        <div className="mb-6">
          <div className="flex justify-between text-sm text-gray-600 mb-1">
            <span>Kort {currentCardIndex + 1} av {cards.length}</span>
            <span className="flex items-center gap-1">
              {streak > 0 && (
                <span className="text-orange-500 font-bold animate-pulse">
                  🔥 {streak}x
                </span>
              )}
            </span>
          </div>
          <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              className={`h-full bg-gradient-to-r ${getReligionColor()} rounded-full`}
              transition={{ duration: 0.3 }}
            />
          </div>
        </div>

        {/* Level complete screen */}
        {levelComplete ? (
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
              {stars >= 1 ? '🎉' : '😅'}
            </motion.div>

            <h2 className="text-3xl font-bold text-gray-800 mb-2">
              {stars >= 1 ? STRINGS.LEVEL_COMPLETE : STRINGS.RETRY + '!'}
            </h2>

            <p className="text-gray-600 mb-6">
              {stars >= 1
                ? `Du klarade nivån med ${accuracy}% rätt!`
                : `Du behöver minst ${level.passingScore}% för att klara nivån.`}
            </p>

            {/* Stars */}
            <div className="flex justify-center gap-2 mb-6">
              {[1, 2, 3].map((star) => (
                <motion.span
                  key={star}
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{
                    delay: 0.3 + star * 0.2,
                    type: 'spring',
                  }}
                  className={`text-5xl ${
                    star <= stars ? 'text-yellow-400' : 'text-gray-300'
                  }`}
                >
                  ★
                </motion.span>
              ))}
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 mb-8">
              <div className="bg-purple-50 rounded-xl p-4">
                <div className="text-2xl font-bold text-purple-600">{score}</div>
                <div className="text-xs text-gray-500">{STRINGS.POINTS}</div>
              </div>
              <div className="bg-green-50 rounded-xl p-4">
                <div className="text-2xl font-bold text-green-600">{correctCount}/{cards.length}</div>
                <div className="text-xs text-gray-500">{STRINGS.CORRECT}</div>
              </div>
              <div className="bg-orange-50 rounded-xl p-4">
                <div className="text-2xl font-bold text-orange-600">{accuracy}%</div>
                <div className="text-xs text-gray-500">{STRINGS.ACCURACY}</div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/map">
                <button className="w-full sm:w-auto px-6 py-3 bg-gray-200 text-gray-700 font-bold rounded-xl hover:bg-gray-300 transition-colors">
                  {STRINGS.TO_MAP}
                </button>
              </Link>

              {stars < 1 ? (
                <button
                  onClick={() => {
                    setCurrentCardIndex(0);
                    setScore(0);
                    setStreak(0);
                    setCorrectCount(0);
                    setLevelComplete(false);
                    setShowConfetti(false);
                  }}
                  className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold rounded-xl hover:opacity-90 transition-opacity"
                >
                  {STRINGS.RETRY}
                </button>
              ) : nextLevel ? (
                <Link href={`/level/${nextLevel.id}`}>
                  <button className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold rounded-xl hover:opacity-90 transition-opacity">
                    Nästa nivå →
                  </button>
                </Link>
              ) : (
                <Link href="/map">
                  <button className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-yellow-500 to-orange-500 text-white font-bold rounded-xl hover:opacity-90 transition-opacity">
                    🏆 Till kartan
                  </button>
                </Link>
              )}
            </div>
          </motion.div>
        ) : (
          /* Game play */
          currentCard && (
            <FlashCard
              card={currentCard}
              bucket={getCardBucket(currentCard.id)}
              correctStreak={getCardProgress(currentCard.id).correctStreak}
              sessionStreak={streak}
              onAnswer={handleAnswer}
              forceShowHint={shouldShowHint(
                currentCard,
                cardProgress[currentCard.id],
                getAdaptiveSettings(flowState)
              )}
            />
          )
        )}
      </div>
    </main>
  );
}
