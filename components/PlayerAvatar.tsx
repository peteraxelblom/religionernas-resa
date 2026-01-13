'use client';

import { motion } from 'framer-motion';
import { getAvatarById, defaultAvatarId } from '@/data/avatars';

interface PlayerAvatarProps {
  avatarId?: string;
  size?: 'sm' | 'md' | 'lg';
  isAnimating?: boolean;
  showGlow?: boolean;
  className?: string;
}

const sizeClasses = {
  sm: 'w-8 h-8 text-lg',
  md: 'w-12 h-12 text-2xl',
  lg: 'w-16 h-16 text-3xl',
};

export default function PlayerAvatar({
  avatarId = defaultAvatarId,
  size = 'md',
  isAnimating = false,
  showGlow = false,
  className = '',
}: PlayerAvatarProps) {
  const avatar = getAvatarById(avatarId) || getAvatarById(defaultAvatarId)!;

  return (
    <motion.div
      className={`
        relative flex items-center justify-center rounded-full
        ${sizeClasses[size]}
        ${className}
      `}
      style={{
        background: `linear-gradient(135deg, ${avatar.primaryColor}, ${avatar.secondaryColor})`,
        boxShadow: showGlow
          ? `0 0 20px ${avatar.primaryColor}80, 0 0 40px ${avatar.primaryColor}40`
          : '0 2px 8px rgba(0,0,0,0.15)',
      }}
      animate={
        isAnimating
          ? {
              y: [0, -4, 0],
            }
          : {}
      }
      transition={
        isAnimating
          ? {
              duration: 0.6,
              repeat: Infinity,
              ease: 'easeInOut',
            }
          : {}
      }
    >
      <span className="select-none">{avatar.emoji}</span>

      {/* Pulse ring for current position */}
      {showGlow && (
        <motion.div
          className="absolute inset-0 rounded-full border-2"
          style={{ borderColor: avatar.primaryColor }}
          animate={{
            scale: [1, 1.5, 1],
            opacity: [0.8, 0, 0.8],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: 'easeOut',
          }}
        />
      )}
    </motion.div>
  );
}

// Animated walking avatar for path visualization
export function WalkingAvatar({
  avatarId = defaultAvatarId,
  fromX,
  fromY,
  toX,
  toY,
  duration = 1,
  onComplete,
}: {
  avatarId?: string;
  fromX: number;
  fromY: number;
  toX: number;
  toY: number;
  duration?: number;
  onComplete?: () => void;
}) {
  const avatar = getAvatarById(avatarId) || getAvatarById(defaultAvatarId)!;

  return (
    <motion.div
      className="absolute z-50 pointer-events-none"
      initial={{ x: fromX, y: fromY }}
      animate={{ x: toX, y: toY }}
      transition={{
        duration,
        ease: 'easeInOut',
      }}
      onAnimationComplete={onComplete}
    >
      <motion.div
        className="w-10 h-10 rounded-full flex items-center justify-center text-xl"
        style={{
          background: `linear-gradient(135deg, ${avatar.primaryColor}, ${avatar.secondaryColor})`,
          boxShadow: `0 0 15px ${avatar.primaryColor}80`,
        }}
        animate={{
          y: [0, -3, 0],
          rotate: [0, 5, -5, 0],
        }}
        transition={{
          duration: 0.4,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      >
        <span className="select-none">{avatar.emoji}</span>
      </motion.div>
    </motion.div>
  );
}

// Celebration avatar animation (for level completion)
export function CelebrationAvatar({
  avatarId = defaultAvatarId,
}: {
  avatarId?: string;
}) {
  const avatar = getAvatarById(avatarId) || getAvatarById(defaultAvatarId)!;

  return (
    <motion.div
      className="relative"
      initial={{ scale: 0, rotate: -180 }}
      animate={{ scale: 1, rotate: 0 }}
      transition={{
        type: 'spring',
        stiffness: 300,
        damping: 20,
      }}
    >
      <motion.div
        className="w-20 h-20 rounded-full flex items-center justify-center text-4xl"
        style={{
          background: `linear-gradient(135deg, ${avatar.primaryColor}, ${avatar.secondaryColor})`,
          boxShadow: `0 0 30px ${avatar.primaryColor}80`,
        }}
        animate={{
          scale: [1, 1.1, 1],
          rotate: [0, 10, -10, 0],
        }}
        transition={{
          duration: 0.8,
          repeat: 3,
          ease: 'easeInOut',
        }}
      >
        <span className="select-none">{avatar.emoji}</span>
      </motion.div>

      {/* Celebration sparkles */}
      {[...Array(8)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-3 h-3 rounded-full"
          style={{
            background: i % 2 === 0 ? avatar.primaryColor : avatar.secondaryColor,
            left: '50%',
            top: '50%',
          }}
          initial={{ opacity: 0, scale: 0, x: 0, y: 0 }}
          animate={{
            opacity: [0, 1, 0],
            scale: [0, 1, 0],
            x: Math.cos((i / 8) * Math.PI * 2) * 60,
            y: Math.sin((i / 8) * Math.PI * 2) * 60,
          }}
          transition={{
            duration: 0.8,
            delay: 0.1 + i * 0.1,
            ease: 'easeOut',
          }}
        />
      ))}
    </motion.div>
  );
}
