'use client';

/**
 * StreakShieldIndicator
 *
 * Displays the current streak count and shield availability status.
 * Used in progress bar sections across level, daily, and review pages.
 */

interface StreakShieldIndicatorProps {
  streak: number;
  isShieldAvailable: boolean;
}

export default function StreakShieldIndicator({
  streak,
  isShieldAvailable,
}: StreakShieldIndicatorProps): React.ReactElement {
  return (
    <span className="flex items-center gap-2">
      {isShieldAvailable && (
        <span className="text-blue-500 font-medium" title="Streak-sköld redo">
          🛡️
        </span>
      )}
      {streak > 0 && (
        <span className="text-orange-500 font-bold animate-pulse">
          🔥 {streak}x
        </span>
      )}
    </span>
  );
}
