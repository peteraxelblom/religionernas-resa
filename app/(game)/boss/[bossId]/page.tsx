'use client';

import { useEffect, useState, useMemo, useCallback, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { useGameStore } from '@/stores/gameStore';
import { getBossById, getNextLevel } from '@/data/levels';
import { getCardsByReligion, allCards } from '@/data/cards';
import FlashCard from '@/components/cards/FlashCard';
import { Card } from '@/types/card';
import { playBossDamageSound, playBossVictorySound, playBossDefeatSound } from '@/lib/audio';
import {
  BossEvent,
  generateBossEvent,
  calculateBossDamage,
  calculateBossAttackDamage,
  getBossDifficultyModifier,
  sortBossCards,
} from '@/lib/bossMechanics';
import { hasRewardEffect } from '@/lib/playerLevel';
import { STRINGS } from '@/lib/strings/sv';

export default function BossPage() {
  const params = useParams();
  const router = useRouter();
  const bossId = params.bossId as string;

  const {
    completeLevel,
    recordCardAnswer,
    getCardBucket,
    getCardProgress,
    unlockAchievement,
    cardProgress,
    getPlayerLevel,
  } = useGameStore();

  const [mounted, setMounted] = useState(false);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [bossHealth, setBossHealth] = useState(0);
  const [maxHealth, setMaxHealth] = useState(0);
  const [lives, setLives] = useState(3);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [victory, setVictory] = useState(false);
  const [showDamage, setShowDamage] = useState(false);
  const [showHit, setShowHit] = useState(false);

  // Phase 3: Boss special mechanics state
  const [currentEvent, setCurrentEvent] = useState<BossEvent>({ type: 'normal', description: '' });
  const [hasShield, setHasShield] = useState(false);
  const [eventMessage, setEventMessage] = useState<string | null>(null);
  const [showCritical, setShowCritical] = useState(false);
  const [difficultyLevel, setDifficultyLevel] = useState('NORMAL');
  const [totalDamageDealt, setTotalDamageDealt] = useState(0);

  const boss = useMemo(() => getBossById(bossId), [bossId]);

  // Get religion cards for difficulty calculation
  const religionCards = useMemo(() => {
    if (!boss) return [];
    if (bossId === 'boss-final') return allCards;
    return getCardsByReligion(boss.religion);
  }, [boss, bossId]);

  // Get cards for boss battle with adaptive sorting
  const cards = useMemo(() => {
    if (!boss) return [];

    let bossCards: Card[] = [];

    if (bossId === 'boss-final') {
      // Final boss: random cards from all religions
      bossCards = [...allCards].sort(() => Math.random() - 0.5).slice(0, 20);
    } else {
      // Religion boss: get cards from that religion
      bossCards = getCardsByReligion(boss.religion)
        .sort(() => Math.random() - 0.5)
        .slice(0, boss.health);
    }

    // Apply adaptive sorting based on streak
    return sortBossCards(bossCards, cardProgress, streak);
  }, [boss, bossId, cardProgress, streak]);

  const currentCard = cards[currentCardIndex];

  useEffect(() => {
    setMounted(true);
    if (boss && religionCards.length > 0) {
      // Calculate difficulty based on player mastery (Phase 3)
      const difficulty = getBossDifficultyModifier(
        boss.religion,
        cardProgress,
        religionCards.map(c => c.id)
      );
      setDifficultyLevel(difficulty.description);

      // Apply health modifier
      const adjustedHealth = Math.round(boss.health * difficulty.healthModifier);
      setBossHealth(adjustedHealth);
      setMaxHealth(adjustedHealth);

      // Check for extra life reward (level 8+)
      const playerLevel = getPlayerLevel();
      const hasExtraLife = hasRewardEffect(playerLevel.level, 'bossExtraLife');
      setLives(hasExtraLife ? 4 : boss.lives);
    }
  }, [boss, cardProgress, religionCards, getPlayerLevel]);

  const handleAnswer = useCallback((correct: boolean, responseTimeMs: number) => {
    if (!currentCard || !boss) return;

    recordCardAnswer(currentCard.id, correct, responseTimeMs);

    // Phase 3: Calculate damage with special mechanics
    const result = calculateBossDamage(
      correct,
      responseTimeMs,
      streak,
      currentEvent,
      hasShield
    );

    if (correct) {
      // Damage the boss
      playBossDamageSound();
      setShowDamage(true);
      setTimeout(() => setShowDamage(false), 500);

      // Show critical hit animation
      if (result.criticalHit) {
        setShowCritical(true);
        setTimeout(() => setShowCritical(false), 1000);
      }

      const newHealth = bossHealth - result.damage;
      setBossHealth(Math.max(0, newHealth));
      setTotalDamageDealt(d => d + result.damage);
      setStreak(s => s + 1);

      // Grant shield if this was a shield round
      if (result.shieldActive) {
        setHasShield(true);
        setEventMessage('🛡️ Sköld aktiverad!');
        setTimeout(() => setEventMessage(null), 2000);
      }

      // Points for hitting boss
      let points = 150 + result.bonusPoints;
      if (responseTimeMs < 3000) points += 75;
      setScore(s => s + points);

      // Show event message
      if (result.message) {
        setEventMessage(result.message);
        setTimeout(() => setEventMessage(null), 2000);
      }

      if (newHealth <= 0) {
        // Victory!
        handleVictory();
      } else {
        // Generate next event and move to next card
        setTimeout(() => {
          const healthPercent = (newHealth / maxHealth) * 100;
          const nextEvent = generateBossEvent(streak + 1, healthPercent, currentCardIndex + 1);
          setCurrentEvent(nextEvent);
          setCurrentCardIndex(i => i + 1);
        }, 1000);
      }
    } else {
      setStreak(0);

      // Phase 3: Boss attack with shield mechanic
      const attackResult = calculateBossAttackDamage(currentEvent, hasShield);

      if (hasShield && attackResult.livesLost === 0) {
        // Shield blocked the attack
        setHasShield(false);
        setEventMessage(attackResult.message);
        setTimeout(() => setEventMessage(null), 2000);
      } else {
        // Boss hits back
        setShowHit(true);
        setTimeout(() => setShowHit(false), 500);
        setHasShield(false);

        if (attackResult.message) {
          setEventMessage(attackResult.message);
          setTimeout(() => setEventMessage(null), 2000);
        }
      }

      const newLives = lives - attackResult.livesLost;
      setLives(newLives);

      if (newLives <= 0) {
        // Game over
        playBossDefeatSound();
        setGameOver(true);
      } else {
        // Continue with next card
        setTimeout(() => {
          const healthPercent = (bossHealth / maxHealth) * 100;
          const nextEvent = generateBossEvent(0, healthPercent, currentCardIndex + 1);
          setCurrentEvent(nextEvent);
          setCurrentCardIndex(i => i + 1);
        }, 1500);
      }
    }
  }, [currentCard, boss, bossHealth, maxHealth, lives, streak, currentEvent, hasShield, recordCardAnswer, currentCardIndex]);

  const handleVictory = useCallback(() => {
    if (!boss) return;

    playBossVictorySound();
    setVictory(true);
    completeLevel(boss.levelId, 3, score);

    // Unlock achievement
    if (boss.rewardBadge) {
      unlockAchievement(boss.rewardBadge);
    }
  }, [boss, score, completeLevel, unlockAchievement]);

  const restartBattle = () => {
    if (!boss || religionCards.length === 0) return;

    // Recalculate difficulty
    const difficulty = getBossDifficultyModifier(
      boss.religion,
      cardProgress,
      religionCards.map(c => c.id)
    );
    const adjustedHealth = Math.round(boss.health * difficulty.healthModifier);

    // Check for extra life reward (level 8+)
    const playerLevel = getPlayerLevel();
    const hasExtraLife = hasRewardEffect(playerLevel.level, 'bossExtraLife');

    setCurrentCardIndex(0);
    setBossHealth(adjustedHealth);
    setMaxHealth(adjustedHealth);
    setLives(hasExtraLife ? 4 : boss.lives);
    setScore(0);
    setStreak(0);
    setGameOver(false);
    setVictory(false);

    // Reset Phase 3 state
    setCurrentEvent({ type: 'normal', description: '' });
    setHasShield(false);
    setEventMessage(null);
    setShowCritical(false);
    setTotalDamageDealt(0);
  };

  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-900 to-purple-900">
        <div className="animate-pulse text-2xl text-purple-400">{STRINGS.LOADING_BOSS}</div>
      </div>
    );
  }

  if (!boss) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-gradient-to-b from-gray-900 to-purple-900">
        <div className="text-2xl text-red-400">Bossen hittades inte</div>
        <Link href="/map" className="text-purple-400 underline">
          {STRINGS.BACK_TO_MAP}
        </Link>
      </div>
    );
  }

  const getReligionColor = () => {
    switch (boss.religion) {
      case 'judaism': return 'from-blue-600 to-blue-800';
      case 'christianity': return 'from-yellow-600 to-orange-700';
      case 'islam': return 'from-green-600 to-green-800';
      case 'shared': return 'from-purple-600 to-purple-800';
    }
  };

  const healthPercent = maxHealth > 0 ? (bossHealth / maxHealth) * 100 : 0;
  const nextLevel = getNextLevel(boss.levelId);

  return (
    <main className="min-h-screen p-4 md:p-8 bg-gradient-to-b from-gray-900 via-purple-900 to-gray-900 text-white relative overflow-hidden">
      {/* Dramatic background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-64 h-64 bg-purple-500 rounded-full filter blur-[100px] opacity-20" />
        <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-red-500 rounded-full filter blur-[100px] opacity-20" />
      </div>

      {/* Screen shake on hit */}
      <AnimatePresence>
        {showHit && (
          <motion.div
            initial={{ x: 0 }}
            animate={{ x: [0, -10, 10, -10, 10, 0] }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 bg-red-600 opacity-30 pointer-events-none z-40"
          />
        )}
      </AnimatePresence>

      {/* Critical hit animation (Phase 3) */}
      <AnimatePresence>
        {showCritical && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            className="fixed inset-0 flex items-center justify-center pointer-events-none z-50"
          >
            <motion.div
              initial={{ scale: 0.5 }}
              animate={{ scale: [0.5, 1.5, 1] }}
              className="text-8xl"
            >
              💥
            </motion.div>
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="absolute text-4xl font-black text-yellow-400 drop-shadow-lg"
              style={{ textShadow: '0 0 20px rgba(251, 191, 36, 0.8)' }}
            >
              KRITISK!
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Event message banner (Phase 3) */}
      <AnimatePresence>
        {eventMessage && (
          <motion.div
            initial={{ y: -100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -100, opacity: 0 }}
            className="fixed top-4 left-0 right-0 flex justify-center pointer-events-none z-40"
          >
            <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-full shadow-lg font-bold text-lg">
              {eventMessage}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-4xl mx-auto relative z-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <Link href="/map" className="text-purple-300 hover:text-purple-100">
            <span className="text-2xl">←</span>
            <span className="ml-2">Fly</span>
          </Link>

          <div className="text-center">
            <h1 className="text-2xl md:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-orange-400">
              👹 BOSS BATTLE
            </h1>
            <p className="text-purple-300">{boss.name}</p>
          </div>

          <div className="text-right">
            <div className="text-2xl font-bold text-yellow-400">{score}</div>
            <div className="text-xs text-purple-300">{STRINGS.POINTS}</div>
          </div>
        </div>

        {/* Boss Health Bar */}
        <div className="mb-6 bg-gray-800 rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <motion.span
                animate={showDamage ? { scale: [1, 0.8, 1] } : {}}
                className="text-4xl"
              >
                👹
              </motion.span>
              <div>
                <span className="font-bold text-lg">{boss.name}</span>
                {/* Difficulty badge (Phase 3) */}
                <span className={`ml-2 text-xs px-2 py-0.5 rounded-full ${
                  difficultyLevel === 'LEGENDÄR' ? 'bg-yellow-500 text-yellow-900' :
                  difficultyLevel === 'SVÅR' ? 'bg-orange-500 text-orange-900' :
                  difficultyLevel === 'NYBÖRJARE' ? 'bg-green-500 text-green-900' :
                  'bg-gray-500 text-gray-200'
                }`}>
                  {difficultyLevel}
                </span>
              </div>
            </div>
            <div className="text-red-400 font-bold">
              HP: {bossHealth}/{maxHealth}
            </div>
          </div>
          <div className="h-6 bg-gray-700 rounded-full overflow-hidden">
            <motion.div
              animate={{ width: `${healthPercent}%` }}
              className={`h-full bg-gradient-to-r from-red-600 to-red-400 rounded-full transition-all duration-300`}
            />
          </div>
        </div>

        {/* Lives and Shield (Phase 3) */}
        <div className="flex justify-center items-center gap-4 mb-6">
          <div className="flex gap-2">
            {/* Show 4 hearts if player has extra life reward, otherwise 3 */}
            {[...Array(hasRewardEffect(getPlayerLevel().level, 'bossExtraLife') ? 4 : 3)].map((_, i) => (
              <motion.span
                key={i}
                animate={i >= lives ? { scale: [1, 0] } : {}}
                className={`text-3xl ${i < lives ? 'text-red-500' : 'text-gray-600'}`}
              >
                ❤️
              </motion.span>
            ))}
          </div>
          {/* Shield indicator */}
          {hasShield && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="flex items-center gap-1 bg-blue-600/50 px-3 py-1 rounded-full"
            >
              <span className="text-2xl">🛡️</span>
              <span className="text-sm text-blue-200">Skyddad</span>
            </motion.div>
          )}
        </div>

        {/* Current event banner (Phase 3) */}
        {currentEvent.type !== 'normal' && !victory && !gameOver && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`mb-4 p-3 rounded-xl text-center font-bold ${
              currentEvent.type === 'speed_round' ? 'bg-yellow-600/50 text-yellow-200' :
              currentEvent.type === 'shield_round' ? 'bg-blue-600/50 text-blue-200' :
              currentEvent.type === 'boss_rage' ? 'bg-red-600/50 text-red-200' :
              'bg-purple-600/50 text-purple-200'
            }`}
          >
            {currentEvent.description}
          </motion.div>
        )}

        {/* Victory Screen */}
        {victory && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-gradient-to-b from-yellow-900/80 to-yellow-800/80 backdrop-blur rounded-3xl p-8 text-center border-2 border-yellow-500"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1, rotate: [0, 10, -10, 0] }}
              transition={{ type: 'spring', delay: 0.2 }}
              className="text-8xl mb-4"
            >
              🏆
            </motion.div>

            <h2 className="text-4xl font-black text-yellow-400 mb-2">
              SEGER!
            </h2>

            <p className="text-yellow-200 mb-6">
              Du besegrade {boss.name}!
            </p>

            {/* Achievement badge */}
            {boss.rewardBadge && (
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="mb-6 p-4 bg-purple-900/50 rounded-xl"
              >
                <p className="text-purple-300 text-sm mb-1">Badge upplåst!</p>
                <p className="text-xl font-bold text-purple-200">
                  🏅 {boss.name} Expert
                </p>
              </motion.div>
            )}

            {/* Stats */}
            <div className="grid grid-cols-2 gap-4 mb-8">
              <div className="bg-black/30 rounded-xl p-4">
                <div className="text-2xl font-bold text-yellow-400">{score}</div>
                <div className="text-xs text-yellow-200/70">{STRINGS.POINTS}</div>
              </div>
              <div className="bg-black/30 rounded-xl p-4">
                <div className="text-2xl font-bold text-red-400">{3 - lives}</div>
                <div className="text-xs text-red-200/70">Liv förlorade</div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/map">
                <button className="w-full sm:w-auto px-6 py-3 bg-gray-700 text-white font-bold rounded-xl hover:bg-gray-600 transition-colors">
                  {STRINGS.TO_MAP}
                </button>
              </Link>
              {nextLevel && (
                <Link href={`/level/${nextLevel.id}`}>
                  <button className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-yellow-500 to-orange-500 text-white font-bold rounded-xl hover:opacity-90 transition-opacity">
                    Nästa nivå →
                  </button>
                </Link>
              )}
            </div>
          </motion.div>
        )}

        {/* Game Over Screen */}
        {gameOver && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-gradient-to-b from-gray-800/90 to-gray-900/90 backdrop-blur rounded-3xl p-8 text-center border-2 border-red-500"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="text-8xl mb-4"
            >
              💀
            </motion.div>

            <h2 className="text-4xl font-black text-red-400 mb-2">
              GAME OVER
            </h2>

            <p className="text-gray-400 mb-6">
              {boss.name} vann denna gång...
            </p>

            <div className="bg-black/30 rounded-xl p-4 mb-8">
              <div className="text-2xl font-bold text-purple-400">
                {maxHealth - bossHealth}/{maxHealth}
              </div>
              <div className="text-xs text-purple-200/70">Skada gjord</div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/map">
                <button className="w-full sm:w-auto px-6 py-3 bg-gray-700 text-white font-bold rounded-xl hover:bg-gray-600 transition-colors">
                  {STRINGS.TO_MAP}
                </button>
              </Link>
              <button
                onClick={restartBattle}
                className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-red-600 to-orange-600 text-white font-bold rounded-xl hover:opacity-90 transition-opacity"
              >
                {STRINGS.RETRY}
              </button>
            </div>
          </motion.div>
        )}

        {/* Battle gameplay */}
        {!victory && !gameOver && currentCard && (
          <div className="relative">
            <FlashCard
              card={currentCard}
              bucket={getCardBucket(currentCard.id)}
              correctStreak={getCardProgress(currentCard.id).correctStreak}
              sessionStreak={streak}
              onAnswer={handleAnswer}
            />
          </div>
        )}
      </div>
    </main>
  );
}
