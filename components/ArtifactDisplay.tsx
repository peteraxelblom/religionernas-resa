'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Artifact, getRarityColor, getRarityLabel } from '@/data/artifacts';

interface ArtifactDisplayProps {
  artifact: Artifact;
  isUnlocked: boolean;
  size?: 'sm' | 'md' | 'lg';
  showDetails?: boolean;
}

const sizeConfig = {
  sm: { container: 'w-12 h-12', emoji: 'text-xl', text: 'text-xs' },
  md: { container: 'w-16 h-16', emoji: 'text-3xl', text: 'text-sm' },
  lg: { container: 'w-24 h-24', emoji: 'text-5xl', text: 'text-base' },
};

export default function ArtifactDisplay({
  artifact,
  isUnlocked,
  size = 'md',
  showDetails = false,
}: ArtifactDisplayProps) {
  const config = sizeConfig[size];
  const rarityClass = getRarityColor(artifact.rarity);

  return (
    <motion.div
      className="flex flex-col items-center"
      whileHover={isUnlocked ? { scale: 1.1 } : undefined}
    >
      {/* Artifact icon */}
      <div
        className={`
          ${config.container} rounded-xl flex items-center justify-center
          border-2 relative overflow-hidden
          ${isUnlocked ? rarityClass : 'bg-gray-200 border-gray-300 opacity-50'}
        `}
      >
        {isUnlocked ? (
          <>
            {/* Legendary glow */}
            {artifact.rarity === 'legendary' && (
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-amber-300/30 to-transparent"
                animate={{ x: ['-100%', '200%'] }}
                transition={{ duration: 2, repeat: Infinity, repeatDelay: 1 }}
              />
            )}

            {/* Emoji */}
            <motion.span
              className={config.emoji}
              animate={artifact.rarity === 'legendary' ? { rotate: [0, 5, -5, 0] } : undefined}
              transition={{ duration: 2, repeat: Infinity }}
            >
              {artifact.emoji}
            </motion.span>
          </>
        ) : (
          <span className={`${config.emoji} opacity-30`}>?</span>
        )}
      </div>

      {/* Details */}
      {showDetails && (
        <div className="mt-2 text-center">
          <p className={`${config.text} font-bold ${isUnlocked ? 'text-gray-800' : 'text-gray-400'}`}>
            {isUnlocked ? artifact.name : '???'}
          </p>
          {isUnlocked && (
            <span className={`text-xs px-2 py-0.5 rounded-full ${rarityClass}`}>
              {getRarityLabel(artifact.rarity)}
            </span>
          )}
        </div>
      )}
    </motion.div>
  );
}

// Artifact unlock celebration
export function ArtifactUnlockCelebration({
  artifact,
  isVisible,
  onComplete,
}: {
  artifact: Artifact;
  isVisible: boolean;
  onComplete?: () => void;
}) {
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          key="artifact-unlock"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 flex items-center justify-center z-50 bg-black/60"
          onClick={onComplete}
        >
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            exit={{ scale: 0, rotate: 180 }}
            transition={{ type: 'spring', stiffness: 200, damping: 15 }}
            className={`
              p-8 rounded-3xl shadow-2xl text-center
              ${artifact.rarity === 'legendary'
                ? 'bg-gradient-to-br from-amber-100 via-yellow-50 to-amber-100 border-4 border-amber-400'
                : 'bg-white border-2 border-gray-200'
              }
            `}
          >
            {/* Sparkles */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-3xl">
              {[...Array(12)].map((_, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{
                    opacity: [0, 1, 0],
                    scale: [0, 1, 0],
                    x: Math.cos((i / 12) * Math.PI * 2) * 120,
                    y: Math.sin((i / 12) * Math.PI * 2) * 120,
                  }}
                  transition={{
                    duration: 1.5,
                    delay: 0.1 * i,
                    ease: 'easeOut',
                    repeat: Infinity,
                    repeatDelay: 0.5,
                  }}
                  className="absolute top-1/2 left-1/2 w-3 h-3 bg-yellow-400 rounded-full"
                  style={{ boxShadow: '0 0 10px #fbbf24' }}
                />
              ))}
            </div>

            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring' }}
            >
              <span className="text-lg font-bold text-purple-600 block mb-2">
                NY ARTEFAKT UPPLÅST!
              </span>

              <motion.span
                className="text-7xl block mb-4"
                animate={{ scale: [1, 1.2, 1], rotate: [0, 10, -10, 0] }}
                transition={{ duration: 0.5, repeat: 2 }}
              >
                {artifact.emoji}
              </motion.span>

              <h3 className="text-2xl font-black text-gray-800 mb-1">
                {artifact.name}
              </h3>

              <p className="text-gray-600 mb-3">
                {artifact.description}
              </p>

              <span className={`px-4 py-1 rounded-full text-sm font-bold ${getRarityColor(artifact.rarity)}`}>
                {getRarityLabel(artifact.rarity)}
              </span>
            </motion.div>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1 }}
              className="text-sm text-gray-400 mt-6"
            >
              Tryck för att fortsätta
            </motion.p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// Progress bar to next artifact
export function ArtifactProgressBar({
  current,
  required,
  nextArtifact,
}: {
  current: number;
  required: number;
  nextArtifact: Artifact | null;
}) {
  if (!nextArtifact) {
    return (
      <div className="flex items-center gap-3 bg-amber-50 p-3 rounded-xl border border-amber-200">
        <span className="text-2xl">🏆</span>
        <span className="text-sm font-bold text-amber-700">
          Alla artefakter upplåsta!
        </span>
      </div>
    );
  }

  const percentage = Math.min((current / required) * 100, 100);

  return (
    <div className="flex items-center gap-3 bg-white p-3 rounded-xl border border-gray-200 shadow-sm">
      <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center">
        <span className="text-xl opacity-50">{nextArtifact.emoji}</span>
      </div>

      <div className="flex-1">
        <div className="flex justify-between text-xs mb-1">
          <span className="text-gray-500">Nästa artefakt</span>
          <span className="font-medium text-gray-700">
            {current}/{required}
          </span>
        </div>
        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${percentage}%` }}
            className={`h-full rounded-full ${getRarityColor(nextArtifact.rarity).includes('amber') ? 'bg-amber-500' : 'bg-purple-500'}`}
          />
        </div>
      </div>
    </div>
  );
}

// Showcase of all unlocked artifacts
export function ArtifactShowcase({
  unlockedArtifacts,
  allArtifacts,
}: {
  unlockedArtifacts: Artifact[];
  allArtifacts: Artifact[];
}) {
  const unlockedIds = new Set(unlockedArtifacts.map(a => a.id));

  return (
    <div className="grid grid-cols-4 md:grid-cols-7 gap-3">
      {allArtifacts.map((artifact) => (
        <ArtifactDisplay
          key={artifact.id}
          artifact={artifact}
          isUnlocked={unlockedIds.has(artifact.id)}
          size="sm"
          showDetails={false}
        />
      ))}
    </div>
  );
}
