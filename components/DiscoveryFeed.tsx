'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Card, Religion } from '@/types/card';

interface DiscoveryItem {
  type: 'mastered' | 'learned' | 'golden' | 'artifact';
  title: string;
  description: string;
  emoji: string;
  religion?: Religion;
}

interface DiscoveryFeedProps {
  items: DiscoveryItem[];
  isVisible: boolean;
  onDismiss?: () => void;
}

const getReligionColor = (religion?: Religion) => {
  switch (religion) {
    case 'judaism': return 'border-blue-300 bg-blue-50';
    case 'christianity': return 'border-yellow-300 bg-yellow-50';
    case 'islam': return 'border-green-300 bg-green-50';
    default: return 'border-purple-300 bg-purple-50';
  }
};

export default function DiscoveryFeed({
  items,
  isVisible,
  onDismiss,
}: DiscoveryFeedProps) {
  if (items.length === 0) return null;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          key="discovery-feed"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 50 }}
          className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6 max-w-md mx-auto"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
              <span>📚</span>
              Du lärde dig...
            </h3>
            {onDismiss && (
              <button
                onClick={onDismiss}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            )}
          </div>

          <div className="space-y-3">
            {items.map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`
                  flex items-start gap-3 p-3 rounded-xl border-2
                  ${getReligionColor(item.religion)}
                `}
              >
                <span className="text-2xl flex-shrink-0">{item.emoji}</span>
                <div className="flex-1 min-w-0">
                  <h4 className="font-bold text-gray-800 text-sm truncate">
                    {item.title}
                  </h4>
                  <p className="text-xs text-gray-600 line-clamp-2">
                    {item.description}
                  </p>
                </div>
                {item.type === 'mastered' && (
                  <span className="text-green-500 text-lg flex-shrink-0">✓</span>
                )}
                {item.type === 'golden' && (
                  <span className="text-yellow-500 text-lg flex-shrink-0">⭐</span>
                )}
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: items.length * 0.1 + 0.3 }}
            className="mt-4 pt-4 border-t border-gray-100 text-center"
          >
            <p className="text-sm text-gray-500">
              {items.length} {items.length === 1 ? 'ny sak' : 'nya saker'} lärt dig!
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// Helper to generate discovery items from session data
export function generateDiscoveryItems(
  newlyMasteredCards: Card[],
  goldenCardsFound: Card[],
  newArtifacts: { name: string; emoji: string }[],
): DiscoveryItem[] {
  const items: DiscoveryItem[] = [];

  // Add mastered cards
  newlyMasteredCards.forEach(card => {
    items.push({
      type: 'mastered',
      title: 'Kort behärskat!',
      description: card.question,
      emoji: '🎓',
      religion: card.religion,
    });
  });

  // Add golden cards
  goldenCardsFound.forEach(card => {
    items.push({
      type: 'golden',
      title: 'Guldkort hittat!',
      description: card.question,
      emoji: '✨',
      religion: card.religion,
    });
  });

  // Add artifacts
  newArtifacts.forEach(artifact => {
    items.push({
      type: 'artifact',
      title: 'Ny artefakt!',
      description: artifact.name,
      emoji: artifact.emoji,
    });
  });

  return items;
}

// Floating notification for single discoveries
export function DiscoveryNotification({
  item,
  isVisible,
  onComplete,
}: {
  item: DiscoveryItem;
  isVisible: boolean;
  onComplete?: () => void;
}) {
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          key="discovery-notification"
          initial={{ opacity: 0, y: 100, scale: 0.8 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -50, scale: 0.8 }}
          transition={{ type: 'spring', stiffness: 300, damping: 25 }}
          onAnimationComplete={() => {
            setTimeout(() => onComplete?.(), 2000);
          }}
          className="fixed bottom-24 left-1/2 -translate-x-1/2 z-40 pointer-events-none"
        >
          <div className={`
            flex items-center gap-3 px-4 py-3 rounded-full shadow-lg
            ${getReligionColor(item.religion)} border-2
          `}>
            <span className="text-xl">{item.emoji}</span>
            <span className="font-medium text-gray-800">{item.title}</span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
