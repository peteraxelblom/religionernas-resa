'use client';

import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardBucket } from '@/types/card';
import { getBucketLabel } from '@/lib/spacedRepetition';
import { playCorrectSound, playWrongSound, playMasterySound } from '@/lib/audio';
import { isCorrect as checkAnswerMatch, GradingRule } from '@/lib/answerMatching';
import { getFeedbackMessage, getBucketTransitionMessage, FeedbackContext } from '@/lib/feedbackMessages';
import { STRINGS } from '@/lib/strings/sv';

interface FlashCardProps {
  card: Card;
  bucket: CardBucket;
  correctStreak: number; // Current streak for this card
  sessionStreak: number; // Current session streak (for streak messages)
  onAnswer: (correct: boolean, responseTimeMs: number) => void;
  showResult?: boolean;
  forceShowHint?: boolean; // Flow state adaptive hint (show hint even before answering)
}

export default function FlashCard({
  card,
  bucket,
  correctStreak,
  sessionStreak,
  onAnswer,
  showResult = false,
  forceShowHint = false,
}: FlashCardProps) {
  const [isFlipped, setIsFlipped] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [userInput, setUserInput] = useState('');
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [startTime] = useState(Date.now());
  const [feedbackMessage, setFeedbackMessage] = useState<{
    title: string;
    subtitle?: string;
    isMastery?: boolean;
    bucketTransition?: string;
  } | null>(null);

  // Shuffle multiple choice options to prevent learning positions instead of content
  // Uses card.id as seed for consistent shuffle per card during session
  const shuffledOptions = useMemo(() => {
    if (!card.options || card.type !== 'multiple_choice') return card.options;

    // Create a simple hash from card.id for seeded shuffle
    const seed = card.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);

    return [...card.options]
      .map((option, i) => ({ option, sort: Math.sin(seed * 100 + i * 17) }))
      .sort((a, b) => a.sort - b.sort)
      .map(({ option }) => option);
  }, [card.id, card.options, card.type]);

  useEffect(() => {
    // Reset state when card changes
    setIsFlipped(false);
    setSelectedAnswer(null);
    setUserInput('');
    setIsCorrect(null);
    setFeedbackMessage(null);
  }, [card.id]);

  const checkAnswer = (answer: string): boolean => {
    const normalizedAnswer = answer.toLowerCase().trim();
    const normalizedCorrect = card.answer.toLowerCase().trim();

    // For multiple choice, use exact match against selected option
    if (card.type === 'multiple_choice') {
      return normalizedAnswer === normalizedCorrect;
    }

    // For true/false, handle common variations
    if (card.type === 'true_false') {
      const trueAnswers = ['sant', 'true', 'ja', 'yes', 's', 't'];
      const falseAnswers = ['falskt', 'false', 'nej', 'no', 'f', 'n'];

      if (normalizedCorrect === 'sant' && trueAnswers.includes(normalizedAnswer)) return true;
      if (normalizedCorrect === 'falskt' && falseAnswers.includes(normalizedAnswer)) return true;
      return false;
    }

    // For basic and fill_blank, use smart matching
    const gradingRule: GradingRule | undefined =
      card.acceptedAnswers || card.conceptGroups
        ? {
            accepted: card.acceptedAnswers,
            conceptGroups: card.conceptGroups,
            ngramThreshold: card.ngramThreshold,
          }
        : undefined;

    return checkAnswerMatch(answer, card.answer, gradingRule);
  };

  // Predict new bucket after correct answer (for mastery detection)
  const predictNewBucket = (correct: boolean): CardBucket => {
    if (!correct) {
      // Wrong answer - go back one bucket
      if (bucket === 'mastered') return 'reviewing';
      if (bucket === 'reviewing') return 'learning';
      return 'learning';
    }

    // Correct answer - check streak to predict bucket change
    const newStreak = correctStreak + 1;
    if (bucket === 'new') return 'learning';
    if (bucket === 'learning' && newStreak >= 2) return 'reviewing';
    if (bucket === 'reviewing' && newStreak >= 4) return 'mastered';
    return bucket;
  };

  const handleAnswer = (answer: string) => {
    if (isCorrect !== null) return; // Already answered

    const responseTime = Date.now() - startTime;
    const correct = checkAnswer(answer);
    const newBucket = predictNewBucket(correct);
    const newSessionStreak = correct ? sessionStreak + 1 : 0;

    // Generate contextual feedback message
    const context: FeedbackContext = {
      correct,
      responseTimeMs: responseTime,
      streak: newSessionStreak,
      previousBucket: bucket,
      newBucket,
      userAnswer: card.type === 'basic' || card.type === 'fill_blank' ? answer : undefined,
      correctAnswer: card.answer,
    };

    const feedback = getFeedbackMessage(context);
    const bucketTransition = getBucketTransitionMessage(bucket, newBucket);
    setFeedbackMessage({
      ...feedback,
      bucketTransition: bucketTransition || undefined,
    });

    setIsCorrect(correct);
    setSelectedAnswer(answer);
    setIsFlipped(true);

    // Play sound effect
    if (correct) {
      if (feedback.isMastery) {
        playMasterySound();
      } else {
        playCorrectSound();
      }
    } else {
      playWrongSound();
    }

    // Slight delay before calling onAnswer to show the result
    setTimeout(() => {
      onAnswer(correct, responseTime);
    }, feedback.isMastery ? 2500 : 1500); // Longer delay for mastery celebration
  };

  const handleSubmitInput = (e: React.FormEvent) => {
    e.preventDefault();
    if (userInput.trim()) {
      handleAnswer(userInput);
    }
  };

  // Bucket indicator colors (more visible)
  const bucketStyles = {
    new: {
      bg: 'bg-gray-100',
      text: 'text-gray-600',
      dot: 'bg-gray-400',
      border: 'border-gray-300',
    },
    learning: {
      bg: 'bg-yellow-100',
      text: 'text-yellow-700',
      dot: 'bg-yellow-500',
      border: 'border-yellow-400',
    },
    reviewing: {
      bg: 'bg-blue-100',
      text: 'text-blue-700',
      dot: 'bg-blue-500',
      border: 'border-blue-400',
    },
    mastered: {
      bg: 'bg-green-100',
      text: 'text-green-700',
      dot: 'bg-green-500',
      border: 'border-green-400',
    },
  }[bucket];

  const renderAnswerInput = () => {
    switch (card.type) {
      case 'multiple_choice':
        return (
          <div className="grid grid-cols-1 gap-3 mt-6">
            {shuffledOptions?.map((option, index) => (
              <motion.button
                key={index}
                onClick={() => handleAnswer(option)}
                disabled={isCorrect !== null}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`p-4 text-left rounded-xl border-2 transition-all ${
                  isCorrect !== null
                    ? option === card.answer
                      ? 'border-green-500 bg-green-50'
                      : selectedAnswer === option
                      ? 'border-red-500 bg-red-50'
                      : 'border-gray-200 bg-white opacity-50'
                    : 'border-gray-200 bg-white hover:border-purple-400 hover:bg-purple-50'
                }`}
              >
                <span className="font-medium">{String.fromCharCode(65 + index)}.</span> {option}
              </motion.button>
            ))}
          </div>
        );

      case 'true_false':
        return (
          <div className="flex gap-4 mt-6 justify-center">
            {['Sant', 'Falskt'].map((option) => (
              <motion.button
                key={option}
                onClick={() => handleAnswer(option)}
                disabled={isCorrect !== null}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`px-8 py-4 text-lg font-bold rounded-xl border-2 transition-all ${
                  isCorrect !== null
                    ? option.toLowerCase() === card.answer.toLowerCase()
                      ? 'border-green-500 bg-green-100 text-green-800'
                      : selectedAnswer?.toLowerCase() === option.toLowerCase()
                      ? 'border-red-500 bg-red-100 text-red-800'
                      : 'border-gray-200 bg-white opacity-50'
                    : option === 'Sant'
                    ? 'border-green-300 bg-green-50 hover:bg-green-100 text-green-700'
                    : 'border-red-300 bg-red-50 hover:bg-red-100 text-red-700'
                }`}
              >
                {option}
              </motion.button>
            ))}
          </div>
        );

      case 'basic':
      case 'fill_blank':
      default:
        return (
          <form onSubmit={handleSubmitInput} className="mt-6">
            <div className="flex gap-3">
              <input
                type="text"
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                disabled={isCorrect !== null}
                placeholder="Skriv ditt svar..."
                className="flex-1 p-4 text-lg border-2 border-gray-200 rounded-xl focus:border-purple-400 focus:outline-none"
                autoFocus
              />
              <motion.button
                type="submit"
                disabled={!userInput.trim() || isCorrect !== null}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-6 py-4 bg-purple-600 text-white font-bold rounded-xl disabled:opacity-50 disabled:cursor-not-allowed hover:bg-purple-700"
              >
                Svara
              </motion.button>
            </div>
          </form>
        );
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      {/* Bucket indicator with visual dot */}
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-2">
          <span
            className={`w-3 h-3 rounded-full ${bucketStyles.dot}`}
            title={`Bucket: ${bucket}`}
          />
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${bucketStyles.bg} ${bucketStyles.text}`}>
            {getBucketLabel(bucket)}
          </span>
          {/* Difficulty indicator */}
          <span className="flex items-center gap-0.5" title={`Svarighetsgrad: ${card.difficulty}/3`}>
            {[1, 2, 3].map((level) => (
              <span
                key={level}
                className={`w-1.5 h-1.5 rounded-full ${
                  level <= card.difficulty ? 'bg-purple-500' : 'bg-gray-200'
                }`}
              />
            ))}
          </span>
          {correctStreak > 0 && (
            <span className="text-xs text-gray-500">
              ({correctStreak} {STRINGS.CORRECT_IN_A_ROW})
            </span>
          )}
        </div>
        {card.hint && isCorrect === null && forceShowHint && (
          <span className="text-sm text-amber-600 font-medium bg-amber-50 px-2 py-1 rounded">
            💡 Tips: {card.hint}
          </span>
        )}
      </div>

      {/* Card */}
      <motion.div
        className="relative perspective-1000"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="bg-white rounded-2xl shadow-lg border-2 border-gray-100 overflow-hidden">
          {/* Question */}
          <div className="p-6 md:p-8">
            <div className="text-sm text-purple-600 font-medium mb-2 uppercase tracking-wide">
              {card.category}
            </div>
            <h2 className="text-2xl md:text-3xl font-bold text-gray-800 leading-tight">
              {card.question}
            </h2>

            {/* Answer input */}
            {renderAnswerInput()}
          </div>

          {/* Result feedback with contextual messages */}
          <AnimatePresence>
            {isCorrect !== null && feedbackMessage && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className={`p-6 border-t-2 ${
                  feedbackMessage.isMastery
                    ? 'bg-gradient-to-r from-yellow-50 via-amber-50 to-yellow-50 border-yellow-300'
                    : isCorrect
                    ? 'bg-green-50 border-green-200'
                    : 'bg-red-50 border-red-200'
                }`}
              >
                <div className="flex items-center gap-3 mb-2">
                  <motion.span
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: 'spring', stiffness: 500, damping: 15 }}
                    className={`text-4xl ${feedbackMessage.isMastery ? 'text-5xl' : ''}`}
                  >
                    {feedbackMessage.isMastery ? '🏆' : isCorrect ? '✓' : '✗'}
                  </motion.span>
                  <div>
                    <motion.span
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.1 }}
                      className={`text-xl font-bold block ${
                        feedbackMessage.isMastery
                          ? 'text-2xl text-transparent bg-clip-text bg-gradient-to-r from-yellow-600 via-amber-500 to-yellow-600'
                          : isCorrect
                          ? 'text-green-700'
                          : 'text-red-700'
                      }`}
                    >
                      {feedbackMessage.title}
                    </motion.span>
                    {feedbackMessage.subtitle && (
                      <motion.span
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        className={`text-sm ${
                          feedbackMessage.isMastery ? 'text-amber-700' : 'text-gray-600'
                        }`}
                      >
                        {feedbackMessage.subtitle}
                      </motion.span>
                    )}
                  </div>
                </div>

                {/* Bucket transition message - skill atom feedback */}
                {feedbackMessage.bucketTransition && !feedbackMessage.isMastery && (
                  <motion.div
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="mt-2 text-sm font-medium text-purple-700 bg-purple-50 px-3 py-1.5 rounded-lg inline-block"
                  >
                    {feedbackMessage.bucketTransition}
                  </motion.div>
                )}

                {/* Mastery celebration sparkles */}
                {feedbackMessage.isMastery && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="absolute inset-0 pointer-events-none overflow-hidden"
                  >
                    {[...Array(8)].map((_, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, scale: 0 }}
                        animate={{
                          opacity: [0, 1, 0],
                          scale: [0, 1, 0],
                          x: Math.cos((i / 8) * Math.PI * 2) * 100,
                          y: Math.sin((i / 8) * Math.PI * 2) * 100,
                        }}
                        transition={{
                          duration: 1,
                          delay: 0.1 * i,
                          ease: 'easeOut',
                        }}
                        className="absolute top-1/2 left-1/2 w-2 h-2 bg-yellow-400 rounded-full"
                        style={{ boxShadow: '0 0 10px #fbbf24' }}
                      />
                    ))}
                  </motion.div>
                )}

                {!isCorrect && (
                  <p className="text-gray-700">
                    <span className="font-medium">{STRINGS.CORRECT_ANSWER} </span>
                    <span className="text-green-700 font-bold">{card.answer}</span>
                  </p>
                )}

                {card.funFact && isCorrect && (
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className="mt-3 text-gray-600 italic bg-yellow-50 p-3 rounded-lg"
                  >
                    💡 {card.funFact}
                  </motion.p>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}
