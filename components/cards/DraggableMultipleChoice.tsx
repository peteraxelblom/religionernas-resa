'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { motion, useMotionValue, useTransform, PanInfo, AnimatePresence } from 'framer-motion';
import { DRAG_SNAP_DISTANCE, calculateRotation } from '@/lib/gestures';

interface DraggableMultipleChoiceProps {
  options: string[];
  correctAnswer: string;
  onAnswer: (answer: string) => void;
  disabled?: boolean;
  selectedAnswer?: string | null;
}

interface TargetPosition {
  x: number;
  y: number;
  width: number;
  height: number;
}

export default function DraggableMultipleChoice({
  options,
  correctAnswer,
  onAnswer,
  disabled = false,
  selectedAnswer,
}: DraggableMultipleChoiceProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [hoveredTarget, setHoveredTarget] = useState<number | null>(null);
  const [dragPosition, setDragPosition] = useState({ x: 0, y: 0 });

  const containerRef = useRef<HTMLDivElement>(null);
  const targetRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [targetPositions, setTargetPositions] = useState<TargetPosition[]>([]);

  // Motion values for drag
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotate = useTransform(x, (value) => calculateRotation(value) * 0.5);
  const scale = useTransform(
    [x, y],
    ([latestX, latestY]: number[]) => {
      const distance = Math.sqrt(latestX * latestX + latestY * latestY);
      return 1 + Math.min(distance / 500, 0.1);
    }
  );

  // Update target positions on mount and resize
  useEffect(() => {
    const updatePositions = () => {
      const positions = targetRefs.current.map((ref) => {
        if (!ref) return { x: 0, y: 0, width: 0, height: 0 };
        const rect = ref.getBoundingClientRect();
        return {
          x: rect.left + rect.width / 2,
          y: rect.top + rect.height / 2,
          width: rect.width,
          height: rect.height,
        };
      });
      setTargetPositions(positions);
    };

    updatePositions();
    window.addEventListener('resize', updatePositions);
    return () => window.removeEventListener('resize', updatePositions);
  }, [options.length]);

  // Check which target is being hovered
  const checkHoveredTarget = useCallback(
    (clientX: number, clientY: number) => {
      for (let i = 0; i < targetPositions.length; i++) {
        const target = targetPositions[i];
        const distance = Math.sqrt(
          Math.pow(clientX - target.x, 2) + Math.pow(clientY - target.y, 2)
        );
        if (distance < target.width / 2 + DRAG_SNAP_DISTANCE) {
          return i;
        }
      }
      return null;
    },
    [targetPositions]
  );

  const handleDragStart = useCallback(() => {
    if (disabled) return;
    setIsDragging(true);
  }, [disabled]);

  const handleDrag = useCallback(
    (_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
      if (disabled) return;

      // Get drag card's current position
      const dragCard = containerRef.current?.querySelector('[data-drag-card]');
      if (!dragCard) return;

      const rect = dragCard.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      setDragPosition({ x: centerX, y: centerY });

      const hovered = checkHoveredTarget(centerX, centerY);
      setHoveredTarget(hovered);
    },
    [disabled, checkHoveredTarget]
  );

  const handleDragEnd = useCallback(
    (_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
      if (disabled) return;

      setIsDragging(false);

      if (hoveredTarget !== null) {
        // Submit answer
        onAnswer(options[hoveredTarget]);
      }

      setHoveredTarget(null);
    },
    [disabled, hoveredTarget, options, onAnswer]
  );

  // If already answered, show result state
  if (selectedAnswer !== null && selectedAnswer !== undefined) {
    return (
      <div className="grid grid-cols-1 gap-3 mt-6">
        {options.map((option, index) => {
          const isCorrect = option === correctAnswer;
          const isSelected = option === selectedAnswer;

          return (
            <div
              key={index}
              className={`p-4 text-left rounded-xl border-2 transition-all ${
                isCorrect
                  ? 'border-green-500 bg-green-50'
                  : isSelected
                  ? 'border-red-500 bg-red-50'
                  : 'border-gray-200 bg-white opacity-50'
              }`}
            >
              <span className="font-medium">{String.fromCharCode(65 + index)}.</span> {option}
            </div>
          );
        })}
      </div>
    );
  }

  return (
    <div ref={containerRef} className="mt-6">
      {/* Drag instruction */}
      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center text-sm text-gray-500 mb-4"
      >
        🎯 Dra kortet till rätt svar eller klicka för att välja
      </motion.p>

      {/* Answer targets */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        {options.map((option, index) => (
          <motion.div
            key={index}
            ref={(el) => {
              targetRefs.current[index] = el;
            }}
            animate={{
              scale: hoveredTarget === index ? 1.05 : 1,
              borderColor: hoveredTarget === index ? 'rgb(147, 51, 234)' : 'rgb(229, 231, 235)',
              backgroundColor: hoveredTarget === index ? 'rgb(243, 232, 255)' : 'rgb(255, 255, 255)',
            }}
            onClick={() => !disabled && onAnswer(option)}
            className={`
              p-4 rounded-xl border-2 transition-all cursor-pointer
              hover:border-purple-400 hover:bg-purple-50
              ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
            `}
          >
            <span className="font-medium text-purple-600">{String.fromCharCode(65 + index)}.</span>
            <span className="ml-2 text-gray-800">{option}</span>
          </motion.div>
        ))}
      </div>

      {/* Draggable "answer" card */}
      <div className="flex justify-center">
        <motion.div
          data-drag-card
          drag={disabled ? false : true}
          dragConstraints={{ left: -200, right: 200, top: -200, bottom: 200 }}
          dragElastic={0.8}
          onDragStart={handleDragStart}
          onDrag={handleDrag}
          onDragEnd={handleDragEnd}
          style={{ x, y, rotate, scale }}
          whileTap={{ scale: disabled ? 1 : 1.05 }}
          className={`
            px-8 py-4 rounded-xl border-2 border-purple-300 bg-gradient-to-r from-purple-50 to-pink-50
            shadow-lg cursor-grab active:cursor-grabbing select-none
            ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
            ${isDragging ? 'shadow-2xl z-50' : 'z-10'}
          `}
        >
          <div className="text-center">
            <span className="text-lg font-bold text-purple-700">
              {isDragging ? '🎯 Släpp på rätt svar!' : '👆 Dra mig!'}
            </span>
          </div>
        </motion.div>
      </div>

      {/* Connection line when dragging */}
      <AnimatePresence>
        {isDragging && hoveredTarget !== null && (
          <motion.svg
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 pointer-events-none z-40"
            style={{ width: '100%', height: '100%' }}
          >
            <motion.line
              x1={dragPosition.x}
              y1={dragPosition.y}
              x2={targetPositions[hoveredTarget]?.x || 0}
              y2={targetPositions[hoveredTarget]?.y || 0}
              stroke="rgb(147, 51, 234)"
              strokeWidth={3}
              strokeDasharray="8,4"
            />
          </motion.svg>
        )}
      </AnimatePresence>
    </div>
  );
}
