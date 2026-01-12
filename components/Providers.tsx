'use client';

import { useEffect, useRef, useState } from 'react';
import { useGameStore } from '@/stores/gameStore';
import AchievementToast from './AchievementToast';
import LevelUpModal from './LevelUpModal';

interface ProvidersProps {
  children: React.ReactNode;
}

function LevelUpDetector() {
  const { getPlayerLevel, playerName } = useGameStore();
  const playerLevel = getPlayerLevel();
  const previousLevelRef = useRef<number | null>(null);
  const [levelUpData, setLevelUpData] = useState<{ newLevel: number; previousLevel: number } | null>(null);

  useEffect(() => {
    // Initialize previous level on first render
    if (previousLevelRef.current === null) {
      previousLevelRef.current = playerLevel.level;
      return;
    }

    // Check if level increased
    if (playerLevel.level > previousLevelRef.current) {
      setLevelUpData({
        newLevel: playerLevel.level,
        previousLevel: previousLevelRef.current,
      });
    }

    previousLevelRef.current = playerLevel.level;
  }, [playerLevel.level]);

  if (!levelUpData) return null;

  return (
    <LevelUpModal
      newLevel={levelUpData.newLevel}
      previousLevel={levelUpData.previousLevel}
      onClose={() => setLevelUpData(null)}
      playerName={playerName}
    />
  );
}

export default function Providers({ children }: ProvidersProps) {
  return (
    <>
      {children}
      <AchievementToast />
      <LevelUpDetector />
    </>
  );
}
