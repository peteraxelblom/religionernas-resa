'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '@/stores/gameStore';
import { playCorrectSound, playWrongSound } from '@/lib/audio';
import { hapticLight, hapticSuccess, hapticError } from '@/lib/haptics';

// The tutorial card - a simple multiple choice question about the Abrahamic religions
const TUTORIAL_CARD = {
  id: 'shared-002',
  question: 'Vilka tre religioner kallas de abrahamitiska religionerna?',
  answer: 'Judendom, kristendom och islam',
  options: [
    'Judendom, kristendom och islam',
    'Buddhism, hinduism och islam',
    'Kristendom, buddhism och judendom',
    'Islam, hinduism och kristendom',
  ],
};

interface GuidedFirstCardProps {
  onComplete: (correct: boolean) => void;
}

export default function GuidedFirstCard({ onComplete }: GuidedFirstCardProps) {
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [showResult, setShowResult] = useState(false);
  // Shuffle options on initial render using lazy initialization
  const [shuffledOptions] = useState<string[]>(() =>
    [...TUTORIAL_CARD.options].sort(() => Math.random() - 0.5)
  );

  const playerName = useGameStore((state) => state.playerName);
  const settings = useGameStore((state) => state.settings);

  const handleOptionSelect = (option: string) => {
    if (showResult) return;

    hapticLight();
    setSelectedOption(option);
  };

  const handleSubmit = () => {
    if (!selectedOption || showResult) return;

    const isCorrect = selectedOption === TUTORIAL_CARD.answer;
    setShowResult(true);

    if (isCorrect) {
      if (settings.soundEnabled) playCorrectSound();
      hapticSuccess();
    } else {
      if (settings.soundEnabled) playWrongSound();
      hapticError();
    }

    // Delay before showing celebration - shorter for correct (just see green highlight)
    // longer for wrong (time to read correct answer)
    setTimeout(() => {
      onComplete(isCorrect);
    }, isCorrect ? 1000 : 2000);
  };

  const isCorrect = selectedOption === TUTORIAL_CARD.answer;

  return (
    <div className="fixed inset-0 bg-gradient-to-b from-purple-900/95 to-indigo-900/95 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', damping: 20, stiffness: 300 }}
        className="bg-white rounded-3xl shadow-2xl p-6 md:p-8 max-w-lg w-full"
      >
        {/* Intro text */}
        <motion.div
          initial={{ y: -10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-center mb-6"
        >
          <span className="text-4xl mb-2 block">🎯</span>
          <h2 className="text-xl font-bold text-purple-800 mb-1">
            Redo, {playerName}?
          </h2>
          <p className="text-gray-600 text-sm">
            Här är ditt första kort!
          </p>
        </motion.div>

        {/* Question */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-2xl p-5 mb-6"
        >
          <p className="text-lg font-medium text-gray-800 text-center">
            {TUTORIAL_CARD.question}
          </p>
        </motion.div>

        {/* Options */}
        <div className="space-y-3 mb-6">
          {shuffledOptions.map((option, index) => {
            const isSelected = selectedOption === option;
            const isCorrectOption = option === TUTORIAL_CARD.answer;
            const showCorrectHighlight = showResult && isCorrectOption;
            const showWrongHighlight = showResult && isSelected && !isCorrectOption;

            return (
              <motion.button
                key={option}
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.5 + index * 0.1 }}
                onClick={() => handleOptionSelect(option)}
                disabled={showResult}
                className={`
                  w-full p-4 rounded-xl text-left transition-all duration-200
                  ${showCorrectHighlight
                    ? 'bg-green-100 border-2 border-green-500 text-green-800'
                    : showWrongHighlight
                      ? 'bg-red-100 border-2 border-red-500 text-red-800'
                      : isSelected
                        ? 'bg-purple-100 border-2 border-purple-500 text-purple-800'
                        : 'bg-gray-50 border-2 border-gray-200 text-gray-700 hover:border-purple-300 hover:bg-purple-50'
                  }
                  ${showResult ? 'cursor-default' : 'cursor-pointer'}
                `}
              >
                <div className="flex items-center gap-3">
                  <span className={`
                    w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold
                    ${showCorrectHighlight
                      ? 'bg-green-500 text-white'
                      : showWrongHighlight
                        ? 'bg-red-500 text-white'
                        : isSelected
                          ? 'bg-purple-500 text-white'
                          : 'bg-gray-200 text-gray-600'
                    }
                  `}>
                    {showCorrectHighlight ? '✓' : showWrongHighlight ? '✗' : String.fromCharCode(65 + index)}
                  </span>
                  <span className="font-medium">{option}</span>
                </div>
              </motion.button>
            );
          })}
        </div>

        {/* Brief feedback for wrong answer only - correct goes straight to celebration */}
        <AnimatePresence>
          {showResult && !isCorrect && (
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="p-3 rounded-xl mb-4 text-center bg-amber-50 border border-amber-200"
            >
              <p className="text-sm text-amber-700">
                Rätt svar: <span className="font-medium">{TUTORIAL_CARD.answer}</span>
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Submit button */}
        {!showResult && (
          <motion.button
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.9 }}
            onClick={handleSubmit}
            disabled={!selectedOption}
            whileHover={selectedOption ? { scale: 1.02 } : {}}
            whileTap={selectedOption ? { scale: 0.98 } : {}}
            className={`
              w-full py-4 rounded-xl font-bold text-lg transition-all
              ${selectedOption
                ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg hover:shadow-xl'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              }
            `}
          >
            Svara! ✨
          </motion.button>
        )}

        {/* Loading indicator when transitioning */}
        {showResult && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-center text-gray-500 text-sm"
          >
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 1, repeat: Infinity }}
              className="inline-block"
            >
              ⏳
            </motion.div>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
