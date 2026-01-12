'use client';

// Haptic feedback utility for mobile devices
// Uses the Vibration API when available

type VibrationPattern = number | number[];

// Vibrate with pattern if supported, no-op otherwise
function vibrate(pattern: VibrationPattern): void {
  if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
    navigator.vibrate(pattern);
  }
}

// Light tap - for button presses, correct answers
export function hapticLight(): void {
  vibrate(10);
}

// Medium tap - for important actions like level completion
export function hapticMedium(): void {
  vibrate(25);
}

// Strong tap - for achievements, level-ups, mastery
export function hapticStrong(): void {
  vibrate(50);
}

// Error/wrong answer - double tap pattern
export function hapticError(): void {
  vibrate([30, 50, 30]);
}

// Success pattern - ascending intensity
export function hapticSuccess(): void {
  vibrate([10, 30, 20, 30, 40]);
}

// Celebration pattern - for level-ups and big achievements
export function hapticCelebration(): void {
  vibrate([20, 40, 20, 40, 20, 40, 60]);
}

// Streak milestone pattern - rhythmic pulses
export function hapticStreak(streakCount: number): void {
  const intensity = Math.min(streakCount, 5);
  const pattern = Array.from({ length: intensity }, () => [15, 30]).flat();
  vibrate(pattern);
}

// Warning pattern - before streak breaks, etc.
export function hapticWarning(): void {
  vibrate([50, 100, 50]);
}
