'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, Religion } from '@/types/card';

interface CollectionCardProps {
  card: Card;
  isMastered: boolean;
  isGolden?: boolean;
  onClick?: () => void;
}

// Get religion-themed colors
const getReligionTheme = (religion: Religion) => {
  switch (religion) {
    case 'judaism':
      return {
        gradient: 'from-blue-400 to-blue-600',
        bg: 'bg-blue-50',
        border: 'border-blue-300',
        accent: 'text-blue-600',
        icon: '✡️',
      };
    case 'christianity':
      return {
        gradient: 'from-yellow-400 to-orange-500',
        bg: 'bg-yellow-50',
        border: 'border-yellow-300',
        accent: 'text-yellow-600',
        icon: '✝️',
      };
    case 'islam':
      return {
        gradient: 'from-green-400 to-green-600',
        bg: 'bg-green-50',
        border: 'border-green-300',
        accent: 'text-green-600',
        icon: '☪️',
      };
    case 'shared':
      return {
        gradient: 'from-purple-400 to-purple-600',
        bg: 'bg-purple-50',
        border: 'border-purple-300',
        accent: 'text-purple-600',
        icon: '🌟',
      };
  }
};

export default function CollectionCard({
  card,
  isMastered,
  isGolden = false,
  onClick,
}: CollectionCardProps) {
  const [isFlipped, setIsFlipped] = useState(false);
  const theme = getReligionTheme(card.religion);

  const handleClick = () => {
    if (isMastered) {
      setIsFlipped(!isFlipped);
    }
    onClick?.();
  };

  // Locked card (silhouette)
  if (!isMastered) {
    return (
      <motion.div
        className="relative aspect-[3/4] rounded-xl bg-gray-200 border-2 border-gray-300 overflow-hidden cursor-not-allowed"
        whileHover={{ scale: 1.02 }}
      >
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-4xl mb-2 opacity-30">🔒</span>
          <span className="text-sm text-gray-400 font-medium">Inte behärskad</span>
        </div>
        {/* Silhouette pattern */}
        <div className="absolute inset-0 bg-gradient-to-br from-gray-300/50 to-transparent" />
      </motion.div>
    );
  }

  return (
    <motion.div
      className="relative aspect-[3/4] cursor-pointer perspective-1000"
      style={{ transformStyle: 'preserve-3d' }}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.98 }}
      onClick={handleClick}
    >
      <motion.div
        className="absolute inset-0"
        style={{ transformStyle: 'preserve-3d' }}
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={{ duration: 0.6, type: 'spring', stiffness: 100 }}
      >
        {/* Front of card */}
        <div
          className={`absolute inset-0 rounded-xl border-2 overflow-hidden backface-hidden ${
            isGolden
              ? 'bg-gradient-to-br from-yellow-100 via-amber-50 to-yellow-100 border-yellow-400'
              : `${theme.bg} ${theme.border}`
          }`}
          style={{ backfaceVisibility: 'hidden' }}
        >
          {/* Golden shimmer effect */}
          {isGolden && (
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-yellow-300/30 to-transparent"
              animate={{ x: ['-100%', '200%'] }}
              transition={{ duration: 2, repeat: Infinity, repeatDelay: 1 }}
            />
          )}

          {/* Religion icon */}
          <div className="absolute top-2 left-2">
            <span className="text-lg">{theme.icon}</span>
          </div>

          {/* Golden badge */}
          {isGolden && (
            <div className="absolute top-2 right-2">
              <motion.span
                className="text-lg"
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 1, repeat: Infinity }}
              >
                ✨
              </motion.span>
            </div>
          )}

          {/* Card content */}
          <div className="flex flex-col items-center justify-center h-full p-4">
            <span className="text-3xl mb-3">📚</span>
            <h3 className="text-sm font-bold text-center text-gray-800 line-clamp-3 mb-1">
              {card.question}
            </h3>
            <span className={`text-xs ${theme.accent} font-medium`}>
              {card.category}
            </span>
          </div>

          {/* Tap to flip hint */}
          <div className="absolute bottom-2 left-0 right-0 text-center">
            <span className="text-xs text-gray-400">Tryck för att vända</span>
          </div>
        </div>

        {/* Back of card */}
        <div
          className={`absolute inset-0 rounded-xl border-2 overflow-hidden ${
            isGolden
              ? 'bg-gradient-to-br from-amber-200 via-yellow-100 to-amber-200 border-yellow-400'
              : `bg-gradient-to-br ${theme.gradient} border-white/20`
          }`}
          style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
        >
          <div className="flex flex-col items-center justify-center h-full p-4 text-center">
            {isGolden ? (
              <>
                <span className="text-3xl mb-2">🏆</span>
                <h3 className="text-sm font-bold text-amber-800 mb-2">
                  GULDKORT!
                </h3>
              </>
            ) : (
              <span className="text-3xl mb-2">💡</span>
            )}
            <p className={`text-sm font-bold ${isGolden ? 'text-amber-900' : 'text-white'}`}>
              {card.answer}
            </p>
            {card.funFact && (
              <p className={`text-xs mt-2 ${isGolden ? 'text-amber-700' : 'text-white/80'}`}>
                {card.funFact}
              </p>
            )}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

// Mini version for collection overview
export function CollectionCardMini({
  card,
  isMastered,
  isGolden = false,
}: {
  card: Card;
  isMastered: boolean;
  isGolden?: boolean;
}) {
  const theme = getReligionTheme(card.religion);

  if (!isMastered) {
    return (
      <div className="aspect-square rounded-lg bg-gray-200 border border-gray-300 flex items-center justify-center">
        <span className="text-xl opacity-30">?</span>
      </div>
    );
  }

  return (
    <motion.div
      className={`aspect-square rounded-lg border-2 flex items-center justify-center relative overflow-hidden ${
        isGolden
          ? 'bg-gradient-to-br from-yellow-200 to-amber-200 border-yellow-400'
          : `${theme.bg} ${theme.border}`
      }`}
      whileHover={{ scale: 1.1, rotate: 5 }}
    >
      {isGolden && (
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-yellow-300/50 to-transparent"
          animate={{ x: ['-100%', '200%'] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        />
      )}
      <span className="text-lg">{isGolden ? '✨' : theme.icon}</span>
    </motion.div>
  );
}
