# Religionernas Resa - Project Status

## Current Status (January 2025)

### Completed Features

#### Core Game
- 39 levels across Judaism, Christianity, Islam, and shared origins
- Spaced repetition system with 4 buckets (new → learning → reviewing → mastered)
- Boss battles with events and damage mechanics
- Daily challenges with adaptive difficulty
- Review mode for due cards

#### Player Progression
- Player Level System (1-25) with XP-based progression
- Functional rewards at key levels:
  | Level | Reward | Effect |
  |-------|--------|--------|
  | 2 | Bonus Hint | Free hint per level |
  | 4 | Streak Shield | Protects streak once per day |
  | 6 | XP Boost | +10% XP from all sources |
  | 8 | Extra Life | 4 lives in boss battles |
  | 12 | Double Mastery XP | 2x XP when mastering cards |
  | 20 | Speed Bonus | +5 XP for fast answers on known cards |

#### Polish & UX
- Contextual feedback messages (speed-based, streak celebrations, near-miss)
- Sound effects (10 synthesized sounds)
- Visual mastery progress on cards
- "Grokking" celebrations for mastery
- Review reminders on home page
- Level-up celebration modal
- Locked level modal with unlock info

### Recent Bug Fixes

#### Card Order Reset Bug (Jan 11, 2025)
**Problem:** After answering a question, the app would flip back to question 1.

**Root Cause:** The `cards` useMemo in level/boss pages depended on `cardProgress` and `flowState`. When `recordCardAnswer()` updated progress, the cards array re-computed and reordered, making `currentCardIndex` point to a different card.

**Fix:** Removed `cardProgress` and `flowState` from useMemo dependencies. Card order is now computed once when level starts.

---

## Architecture Notes

### Key Files
- `stores/gameStore.ts` - Central state management (Zustand)
- `lib/playerLevel.ts` - Level calculations and reward effects
- `lib/spacedRepetition.ts` - Card bucket progression logic
- `lib/adaptiveDifficulty.ts` - Flow state and difficulty adjustments
- `data/cards.ts` - All flashcard content
- `data/levels.ts` - Level definitions and unlock requirements

### Design Documentation
See `/docs/design/` for:
- `cook-koster-synthesis.md` - Game design theory application
- `decisions.md` - Design decision log with rationale
- `patterns.md` - Reusable game design patterns
- `open-questions.md` - Unresolved design tensions

---

## Development

### Scripts
```bash
npm run dev          # Development server
npm run check        # TypeScript + ESLint + Framer Motion checks
npm run test         # Run tests
```

### Before Committing
Always run `npm run check` to catch:
- TypeScript errors
- ESLint issues
- Missing keys on AnimatePresence children
