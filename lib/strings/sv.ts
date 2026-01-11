/**
 * Swedish UI strings used throughout the application.
 * Consolidates commonly used strings for consistency and maintainability.
 */

export const STRINGS = {
  // Stats and Score
  POINTS: 'Poäng',
  CORRECT: 'Rätt',
  ACCURACY: 'Noggrannhet',
  BONUS_XP: 'Bonus XP',
  TOTAL_TIME: 'Total tid',

  // Actions
  RETRY: 'Försök igen',
  CONTINUE: 'Fortsätt',
  BACK: 'Tillbaka',
  TO_HOME: 'Till startsidan',
  TO_MAP: 'Till kartan',
  BACK_TO_MAP: 'Tillbaka till kartan',

  // Loading states
  LOADING: 'Laddar...',
  LOADING_BOSS: 'Laddar boss...',
  LOADING_MAP: 'Laddar karta...',
  LOADING_LEVEL: 'Laddar nivå...',

  // Success messages
  LEVEL_COMPLETE: 'Nivå klar!',
  WELL_DONE: 'Bra jobbat!',
  ALMOST_THERE: 'Nästan!',

  // Feedback
  CORRECT_ANSWER: 'Rätt svar:',
  IN_A_ROW: 'i rad',
  CORRECT_IN_A_ROW: 'rätt i rad',
} as const;
