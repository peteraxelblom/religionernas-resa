'use client';

import { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface TimerRingProps {
  durationMs: number; // Total time in milliseconds
  isActive: boolean;
  isPaused?: boolean;
  onTimeUp?: () => void;
  onTick?: (remainingMs: number) => void;
  size?: 'sm' | 'md' | 'lg';
  showTimeText?: boolean;
  className?: string;
}

const sizeConfig = {
  sm: { dimension: 48, strokeWidth: 4, fontSize: 'text-xs' },
  md: { dimension: 64, strokeWidth: 5, fontSize: 'text-sm' },
  lg: { dimension: 80, strokeWidth: 6, fontSize: 'text-base' },
};

export default function TimerRing({
  durationMs,
  isActive,
  isPaused = false,
  onTimeUp,
  onTick,
  size = 'md',
  showTimeText = true,
  className = '',
}: TimerRingProps) {
  const [remainingMs, setRemainingMs] = useState(durationMs);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [pausedAt, setPausedAt] = useState<number | null>(null);

  const { dimension, strokeWidth, fontSize } = sizeConfig[size];
  const radius = (dimension - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  // Calculate progress (0 to 1, where 1 is full/start)
  const progress = remainingMs / durationMs;
  const strokeDashoffset = circumference * (1 - progress);

  // Determine color based on remaining time
  const getColor = useCallback(() => {
    if (progress > 0.5) return { stroke: '#22c55e', bg: '#dcfce7' }; // green
    if (progress > 0.25) return { stroke: '#eab308', bg: '#fef9c3' }; // yellow
    return { stroke: '#ef4444', bg: '#fee2e2' }; // red
  }, [progress]);

  const color = getColor();

  // Timer logic
  useEffect(() => {
    if (!isActive || isPaused) {
      if (isPaused && startTime && !pausedAt) {
        // eslint-disable-next-line react-hooks/set-state-in-effect -- Required for pause/resume functionality
        setPausedAt(Date.now());
      }
      return;
    }

    if (pausedAt && startTime) {
      // Resume from pause
      const pauseDuration = Date.now() - pausedAt;
      setStartTime(startTime + pauseDuration);
      setPausedAt(null);
    }

    if (!startTime) {
      setStartTime(Date.now());
    }

    const interval = setInterval(() => {
      const elapsed = Date.now() - (startTime || Date.now());
      const remaining = Math.max(0, durationMs - elapsed);
      setRemainingMs(remaining);

      if (onTick) {
        onTick(remaining);
      }

      if (remaining <= 0) {
        clearInterval(interval);
        if (onTimeUp) {
          onTimeUp();
        }
      }
    }, 50); // Update every 50ms for smooth animation

    return () => clearInterval(interval);
  }, [isActive, isPaused, startTime, pausedAt, durationMs, onTimeUp, onTick]);

  // Reset when duration or active state changes
  useEffect(() => {
    if (isActive) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- Required to reset timer state when props change
      setRemainingMs(durationMs);
      setStartTime(Date.now());
      setPausedAt(null);
    }
  }, [durationMs, isActive]);

  const formatTime = (ms: number) => {
    const seconds = Math.ceil(ms / 1000);
    return seconds.toString();
  };

  const isUrgent = progress <= 0.25;
  const isCritical = progress <= 0.1;

  return (
    <div className={`relative inline-flex items-center justify-center ${className}`}>
      {/* Background circle */}
      <svg
        width={dimension}
        height={dimension}
        className={`transform -rotate-90 ${isCritical ? 'animate-pulse' : ''}`}
      >
        {/* Background track */}
        <circle
          cx={dimension / 2}
          cy={dimension / 2}
          r={radius}
          fill="none"
          stroke={color.bg}
          strokeWidth={strokeWidth}
        />

        {/* Progress arc */}
        <motion.circle
          cx={dimension / 2}
          cy={dimension / 2}
          r={radius}
          fill="none"
          stroke={color.stroke}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          style={{
            filter: isUrgent ? `drop-shadow(0 0 4px ${color.stroke})` : 'none',
          }}
        />
      </svg>

      {/* Time text */}
      {showTimeText && (
        <motion.span
          className={`absolute ${fontSize} font-bold`}
          style={{ color: color.stroke }}
          animate={isCritical ? { scale: [1, 1.1, 1] } : {}}
          transition={{ duration: 0.3, repeat: Infinity }}
        >
          {formatTime(remainingMs)}
        </motion.span>
      )}

      {/* Urgent glow effect */}
      <AnimatePresence>
        {isCritical && (
          <motion.div
            initial={{ opacity: 0, scale: 1 }}
            animate={{ opacity: [0.5, 0, 0.5], scale: [1, 1.3, 1] }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5, repeat: Infinity }}
            className="absolute inset-0 rounded-full"
            style={{ border: `2px solid ${color.stroke}` }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

// Time's up overlay component
export function TimesUpOverlay({
  isVisible,
  onDismiss,
}: {
  isVisible: boolean;
  onDismiss?: () => void;
}) {
  useEffect(() => {
    if (isVisible && onDismiss) {
      const timer = setTimeout(onDismiss, 2000);
      return () => clearTimeout(timer);
    }
  }, [isVisible, onDismiss]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 flex items-center justify-center z-50 bg-black/50"
        >
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            exit={{ scale: 0, rotate: 180 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            className="bg-red-500 text-white px-12 py-8 rounded-2xl shadow-2xl"
          >
            <motion.div
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 0.3, repeat: 3 }}
              className="text-center"
            >
              <span className="text-4xl block mb-2">⏱️</span>
              <span className="text-3xl font-black">TIDEN ÄR SLUT!</span>
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
