'use client';

import { useEffect, useState, useMemo, useCallback } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useGameStore } from '@/stores/gameStore';
import {
  getDailyChallenges,
  getChallengeCards,
  getTimeUntilReset,
  DailyChallenge,
} from '@/lib/dailyChallenge';
import FlashCard from '@/components/cards/FlashCard';
import { Card } from '@/types/card';
import { playLevelCompleteSound, playStreakSound } from '@/lib/audio';
import {
  calculatePerformanceMetrics,
  determineFlowState,
  getAdaptiveSettings,
  sortCardsByAdaptivePriority,
  shouldShowHint,
  FlowState,
} from '@/lib/adaptiveDifficulty';
import { STRINGS } from '@/lib/strings/sv';

type GamePhase = 'menu' | 'playing' | 'complete' | 'failed';

export default function DailyChallengesPage() {
  const {
    stats,
    addXP,
    recordCardAnswer,
    getCardBucket,
    getCardProgress,
    unlockAchievement,
    cardProgress,
    completeDailyChallenge,
    isDailyChallengeCompleted,
    getDailyCompletionCount,
    hasReward,
    isShieldAvailable,
  } = useGameStore();

  const [mounted, setMounted] = useState(false);
  const [phase, setPhase] = useState<GamePhase>('menu');
  const [selectedChallenge, setSelectedChallenge] = useState<DailyChallenge | null>(null);
  const [cards, setCards] = useState<Card[]>([]);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [totalTime, setTotalTime] = useState(0);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [timeUntilReset, setTimeUntilReset] = useState(getTimeUntilReset());

  // Adaptive difficulty state
  const [recentAnswers, setRecentAnswers] = useState<{ correct: boolean; responseTimeMs: number }[]>([]);
  const [flowState, setFlowState] = useState<FlowState>('flow');

  const challenges = useMemo(() => getDailyChallenges(), []);
  const currentCard = cards[currentCardIndex];

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- Standard Next.js hydration pattern
    setMounted(true);
  }, []);

  // Update countdown timer
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeUntilReset(getTimeUntilReset());
    }, 60000); // Update every minute
    return () => clearInterval(timer);
  }, []);

  const startChallenge = useCallback((challenge: DailyChallenge) => {
    let challengeCards = getChallengeCards(challenge);

    // Apply adaptive sorting based on flow state
    challengeCards = sortCardsByAdaptivePriority(challengeCards, cardProgress, flowState);

    setSelectedChallenge(challenge);
    setCards(challengeCards);
    setCurrentCardIndex(0);
    setScore(0);
    setStreak(0);
    setCorrectCount(0);
    setTotalTime(0);
    setStartTime(Date.now());
    setRecentAnswers([]);
    setPhase('playing');
  }, [cardProgress, flowState]);

  const finishChallenge = useCallback((lastCorrect: boolean) => {
    if (!selectedChallenge || !startTime) return;

    const endTime = Date.now();
    setTotalTime(endTime - startTime);

    // Check if challenge was successful
    const finalCorrect = correctCount + (lastCorrect ? 1 : 0);
    const success = selectedChallenge.type === 'perfect_streak'
      ? finalCorrect === selectedChallenge.targetCount
      : finalCorrect >= Math.ceil(selectedChallenge.targetCount * 0.7); // 70% to pass

    if (success) {
      playLevelCompleteSound();
      addXP(selectedChallenge.bonusXP);

      // Mark challenge as completed in game store
      completeDailyChallenge(selectedChallenge.id);

      // Check for achievement
      const completedToday = getDailyCompletionCount() + 1;
      if (completedToday >= 4) {
        unlockAchievement('daily-champion');
      }

      setPhase('complete');
    } else {
      setPhase('failed');
    }
  }, [selectedChallenge, startTime, correctCount, addXP, completeDailyChallenge, getDailyCompletionCount, unlockAchievement]);

  const handleAnswer = useCallback((correct: boolean, responseTimeMs: number) => {
    if (!currentCard || !selectedChallenge) return;

    recordCardAnswer(currentCard.id, correct, responseTimeMs);

    // Track recent answers for adaptive difficulty
    const newRecentAnswers = [...recentAnswers, { correct, responseTimeMs }].slice(-10);
    setRecentAnswers(newRecentAnswers);

    // Update flow state
    const metrics = calculatePerformanceMetrics(newRecentAnswers);
    const newFlowState = determineFlowState(metrics);
    setFlowState(newFlowState);

    if (correct) {
      const newStreak = streak + 1;
      setStreak(newStreak);
      setCorrectCount(c => c + 1);

      // Calculate points
      let points = 100;
      if (selectedChallenge.type === 'speed_run' && responseTimeMs < 3000) {
        points += 100; // Extra points for speed
      }
      points += Math.min(newStreak * 10, 50); // Streak bonus
      setScore(s => s + points);

      // Streak sounds
      if (newStreak >= 3) {
        playStreakSound(newStreak);
      }
    } else {
      setStreak(0);
      // For perfect_streak challenge, fail immediately
      if (selectedChallenge.type === 'perfect_streak') {
        setTimeout(() => {
          setPhase('failed');
        }, 1500);
        return;
      }
    }

    // Move to next card or complete
    setTimeout(() => {
      if (currentCardIndex < cards.length - 1) {
        setCurrentCardIndex(i => i + 1);
      } else {
        finishChallenge(correct);
      }
    }, 1500);
  }, [currentCard, selectedChallenge, streak, currentCardIndex, cards.length, recordCardAnswer, recentAnswers, finishChallenge]);

  const resetToMenu = () => {
    setPhase('menu');
    setSelectedChallenge(null);
    setCards([]);
    setCurrentCardIndex(0);
    setRecentAnswers([]);
    setFlowState('flow');
  };

  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-2xl text-purple-600">{STRINGS.LOADING}</div>
      </div>
    );
  }

  return (
    <main className="min-h-screen p-4 md:p-8 bg-gradient-to-b from-orange-50 to-yellow-50">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <Link href="/" className="text-purple-600 hover:text-purple-800">
            <span className="text-2xl">←</span>
            <span className="ml-2">Hem</span>
          </Link>

          <div className="text-center">
            <h1 className="text-2xl md:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-orange-600 to-yellow-600">
              Dagliga utmaningar
            </h1>
            <p className="text-sm text-gray-500">
              Aterstalls om {timeUntilReset.hours}h {timeUntilReset.minutes}m
            </p>
          </div>

          <div className="text-right">
            <div className="text-2xl font-bold text-purple-700">{stats.totalXP}</div>
            <div className="text-xs text-gray-500">XP</div>
          </div>
        </div>

        {/* Menu Phase */}
        {phase === 'menu' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            {challenges.map((challenge, index) => {
              const completed = isDailyChallengeCompleted(challenge.id);
              return (
                <motion.div
                  key={challenge.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`bg-white rounded-2xl shadow-lg p-6 ${
                    completed ? 'opacity-60' : 'hover:shadow-xl cursor-pointer'
                  } transition-all`}
                  onClick={() => !completed && startChallenge(challenge)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <span className="text-4xl">{challenge.icon}</span>
                      <div>
                        <h3 className="text-xl font-bold text-gray-800">
                          {challenge.name}
                        </h3>
                        <p className="text-gray-600">{challenge.description}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      {completed ? (
                        <span className="text-2xl text-green-500">✓</span>
                      ) : (
                        <>
                          <div className="text-lg font-bold text-yellow-600">
                            +{challenge.bonusXP} XP
                          </div>
                          <div className="text-sm text-gray-500">
                            {challenge.targetCount} kort
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}

            {/* Today's progress */}
            <div className="mt-8 bg-gradient-to-r from-purple-100 to-pink-100 rounded-2xl p-6">
              <h3 className="text-lg font-bold text-purple-800 mb-2">
                Dagens framsteg
              </h3>
              <div className="flex items-center gap-2">
                {challenges.map((challenge) => (
                  <div
                    key={challenge.id}
                    className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      isDailyChallengeCompleted(challenge.id)
                        ? 'bg-green-500 text-white'
                        : 'bg-gray-200 text-gray-400'
                    }`}
                  >
                    {isDailyChallengeCompleted(challenge.id) ? '✓' : challenge.icon}
                  </div>
                ))}
                <span className="ml-4 text-purple-700 font-medium">
                  {getDailyCompletionCount()} / {challenges.length} klara
                </span>
              </div>
            </div>
          </motion.div>
        )}

        {/* Playing Phase */}
        {phase === 'playing' && selectedChallenge && currentCard && (
          <div>
            {/* Challenge header */}
            <div className="bg-white rounded-xl shadow p-4 mb-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">{selectedChallenge.icon}</span>
                  <div>
                    <h2 className="font-bold text-gray-800">{selectedChallenge.name}</h2>
                    <p className="text-sm text-gray-500">
                      Kort {currentCardIndex + 1} av {cards.length}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xl font-bold text-purple-600">{score}</div>
                  {streak > 0 && (
                    <div className="text-sm text-orange-500 font-medium">
                      🔥 {streak}x
                    </div>
                  )}
                </div>
              </div>
              {/* Progress bar */}
              <div className="mt-3 h-2 bg-gray-200 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${((currentCardIndex) / cards.length) * 100}%` }}
                  className="h-full bg-gradient-to-r from-orange-500 to-yellow-500 rounded-full"
                />
              </div>
            </div>

            {/* Flash card with adaptive hints */}
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
              hasDoubleMasteryBonus={hasReward('doubleMasteryXP')}
              hasSpeedBonusReward={hasReward('speedBonus')}
              isShieldAvailable={isShieldAvailable()}
            />
          </div>
        )}

        {/* Complete Phase */}
        {phase === 'complete' && selectedChallenge && (
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
              Utmaning klar!
            </h2>
            <p className="text-gray-600 mb-6">
              Du klarade &quot;{selectedChallenge.name}&quot;
            </p>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 mb-8">
              <div className="bg-purple-50 rounded-xl p-4">
                <div className="text-2xl font-bold text-purple-600">{score}</div>
                <div className="text-xs text-gray-500">{STRINGS.POINTS}</div>
              </div>
              <div className="bg-green-50 rounded-xl p-4">
                <div className="text-2xl font-bold text-green-600">
                  {correctCount}/{cards.length}
                </div>
                <div className="text-xs text-gray-500">{STRINGS.CORRECT}</div>
              </div>
              <div className="bg-yellow-50 rounded-xl p-4">
                <div className="text-2xl font-bold text-yellow-600">
                  +{selectedChallenge.bonusXP}
                </div>
                <div className="text-xs text-gray-500">{STRINGS.BONUS_XP}</div>
              </div>
            </div>

            {selectedChallenge.type === 'speed_run' && (
              <div className="mb-6 p-4 bg-blue-50 rounded-xl">
                <div className="text-2xl font-bold text-blue-600">
                  {Math.round(totalTime / 1000)}s
                </div>
                <div className="text-sm text-blue-500">{STRINGS.TOTAL_TIME}</div>
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={resetToMenu}
                className="px-6 py-3 bg-gray-200 text-gray-700 font-bold rounded-xl hover:bg-gray-300"
              >
                Fler utmaningar
              </button>
              <Link href="/">
                <button className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold rounded-xl hover:opacity-90">
                  {STRINGS.TO_HOME}
                </button>
              </Link>
            </div>
          </motion.div>
        )}

        {/* Failed Phase */}
        {phase === 'failed' && selectedChallenge && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-3xl shadow-xl p-8 text-center"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="text-6xl mb-4"
            >
              😅
            </motion.div>

            <h2 className="text-3xl font-bold text-gray-800 mb-2">
              {STRINGS.ALMOST_THERE}
            </h2>
            <p className="text-gray-600 mb-6">
              {selectedChallenge.type === 'perfect_streak'
                ? 'Du måste klara alla kort utan fel.'
                : 'Försök igen för att klara utmaningen!'}
            </p>

            <div className="grid grid-cols-2 gap-4 mb-8">
              <div className="bg-purple-50 rounded-xl p-4">
                <div className="text-2xl font-bold text-purple-600">{score}</div>
                <div className="text-xs text-gray-500">{STRINGS.POINTS}</div>
              </div>
              <div className="bg-green-50 rounded-xl p-4">
                <div className="text-2xl font-bold text-green-600">
                  {correctCount}/{cards.length}
                </div>
                <div className="text-xs text-gray-500">{STRINGS.CORRECT}</div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => startChallenge(selectedChallenge)}
                className="px-6 py-3 bg-gradient-to-r from-orange-500 to-yellow-500 text-white font-bold rounded-xl hover:opacity-90"
              >
                {STRINGS.RETRY}
              </button>
              <button
                onClick={resetToMenu}
                className="px-6 py-3 bg-gray-200 text-gray-700 font-bold rounded-xl hover:bg-gray-300"
              >
                {STRINGS.BACK}
              </button>
            </div>
          </motion.div>
        )}
      </div>
    </main>
  );
}
