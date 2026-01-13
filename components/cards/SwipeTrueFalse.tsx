'use client';

import { useState, useCallback } from 'react';
import { motion, useMotionValue, useTransform, PanInfo } from 'framer-motion';
import {
  SWIPE_THRESHOLD,
  SWIPE_VELOCITY_THRESHOLD,
  calculateRotation,
  getSwipeDirection,
  getSwipeIndicatorOpacity,
} from '@/lib/gestures';

interface SwipeTrueFalseProps {
  onAnswer: (answer: 'Sant' | 'Falskt') => void;
  disabled?: boolean;
  correctAnswer?: string; // For showing result after answer
  selectedAnswer?: string | null;
}

export default function SwipeTrueFalse({
  onAnswer,
  disabled = false,
  correctAnswer,
  selectedAnswer,
}: SwipeTrueFalseProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [swipeDirection, setSwipeDirection] = useState<'left' | 'right' | null>(null);

  // Motion values for drag
  const x = useMotionValue(0);
  const rotate = useTransform(x, (value) => calculateRotation(value));

  // Opacity for swipe indicators
  const rightOpacity = useTransform(x, [0, SWIPE_THRESHOLD], [0, 1]);
  const leftOpacity = useTransform(x, [-SWIPE_THRESHOLD, 0], [1, 0]);

  // Background color based on drag direction
  const backgroundColor = useTransform(
    x,
    [-SWIPE_THRESHOLD, 0, SWIPE_THRESHOLD],
    ['rgba(239, 68, 68, 0.1)', 'rgba(255, 255, 255, 0)', 'rgba(34, 197, 94, 0.1)']
  );

  const handleDragStart = useCallback(() => {
    if (disabled) return;
    setIsDragging(true);
  }, [disabled]);

  const handleDrag = useCallback(
    (_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
      if (disabled) return;
      const direction = getSwipeDirection(info.offset.x, info.velocity.x);
      setSwipeDirection(direction);
    },
    [disabled]
  );

  const handleDragEnd = useCallback(
    (_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
      if (disabled) return;

      setIsDragging(false);
      const direction = getSwipeDirection(info.offset.x, info.velocity.x);

      if (direction) {
        // Trigger answer based on swipe direction
        const answer = direction === 'right' ? 'Sant' : 'Falskt';
        onAnswer(answer);
      }

      setSwipeDirection(null);
    },
    [disabled, onAnswer]
  );

  // If already answered, show result state
  if (selectedAnswer !== null && selectedAnswer !== undefined) {
    const isCorrect = selectedAnswer.toLowerCase() === correctAnswer?.toLowerCase();
    return (
      <div className="flex gap-4 mt-6 justify-center">
        {['Sant', 'Falskt'].map((option) => {
          const isThisCorrect = option.toLowerCase() === correctAnswer?.toLowerCase();
          const isThisSelected = option.toLowerCase() === selectedAnswer?.toLowerCase();

          return (
            <div
              key={option}
              className={`px-8 py-4 text-lg font-bold rounded-xl border-2 transition-all ${
                isThisCorrect
                  ? 'border-green-500 bg-green-100 text-green-800'
                  : isThisSelected
                  ? 'border-red-500 bg-red-100 text-red-800'
                  : 'border-gray-200 bg-white opacity-50'
              }`}
            >
              {option}
            </div>
          );
        })}
      </div>
    );
  }

  return (
    <div className="mt-6">
      {/* Swipe instruction */}
      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center text-sm text-gray-500 mb-4"
      >
        👈 Svep vänster för <span className="text-red-500 font-medium">Falskt</span>
        {' • '}
        Svep höger för <span className="text-green-500 font-medium">Sant</span> 👉
      </motion.p>

      {/* Swipeable card container */}
      <div className="relative flex justify-center items-center min-h-[120px]">
        {/* Left indicator (Falskt) */}
        <motion.div
          style={{ opacity: leftOpacity }}
          className="absolute left-4 top-1/2 -translate-y-1/2 flex flex-col items-center z-10"
        >
          <span className="text-4xl">👎</span>
          <span className="text-red-500 font-bold text-lg mt-1">Falskt</span>
        </motion.div>

        {/* Right indicator (Sant) */}
        <motion.div
          style={{ opacity: rightOpacity }}
          className="absolute right-4 top-1/2 -translate-y-1/2 flex flex-col items-center z-10"
        >
          <span className="text-4xl">👍</span>
          <span className="text-green-500 font-bold text-lg mt-1">Sant</span>
        </motion.div>

        {/* Swipeable card */}
        <motion.div
          drag={disabled ? false : 'x'}
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={0.9}
          onDragStart={handleDragStart}
          onDrag={handleDrag}
          onDragEnd={handleDragEnd}
          style={{ x, rotate, backgroundColor }}
          whileTap={{ scale: disabled ? 1 : 0.98 }}
          className={`
            relative z-20 px-12 py-8 rounded-2xl border-2 border-gray-200
            bg-white shadow-lg cursor-grab active:cursor-grabbing
            select-none touch-pan-y
            ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
            ${isDragging ? 'shadow-2xl' : ''}
          `}
        >
          {/* Swipe direction indicator overlay */}
          <motion.div
            className="absolute inset-0 rounded-2xl border-4 pointer-events-none"
            style={{
              borderColor: useTransform(
                x,
                [-SWIPE_THRESHOLD, 0, SWIPE_THRESHOLD],
                ['rgb(239, 68, 68)', 'transparent', 'rgb(34, 197, 94)']
              ),
              opacity: useTransform(x, (value) => getSwipeIndicatorOpacity(value)),
            }}
          />

          <div className="text-center">
            <span className="text-2xl font-bold text-gray-800">
              {swipeDirection === 'right' ? '✓ Sant' : swipeDirection === 'left' ? '✗ Falskt' : 'Svep för att svara'}
            </span>
          </div>
        </motion.div>
      </div>

      {/* Fallback buttons for accessibility / desktop */}
      <div className="flex gap-4 mt-6 justify-center">
        {['Sant', 'Falskt'].map((option) => (
          <motion.button
            key={option}
            onClick={() => !disabled && onAnswer(option as 'Sant' | 'Falskt')}
            disabled={disabled}
            whileHover={{ scale: disabled ? 1 : 1.05 }}
            whileTap={{ scale: disabled ? 1 : 0.95 }}
            className={`px-6 py-3 text-sm font-medium rounded-xl border-2 transition-all ${
              disabled
                ? 'border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed'
                : option === 'Sant'
                ? 'border-green-300 bg-green-50 hover:bg-green-100 text-green-700'
                : 'border-red-300 bg-red-50 hover:bg-red-100 text-red-700'
            }`}
          >
            {option === 'Sant' ? '👍' : '👎'} {option}
          </motion.button>
        ))}
      </div>
    </div>
  );
}
