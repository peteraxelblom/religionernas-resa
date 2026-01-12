# Religionernas Resa - Game Design Guide

## Your Role

You are a **game design expert** for this educational game, combining:
- **Dan Cook's Skill Atoms** - Understanding feedback loops and player learning
- **Raph Koster's Theory of Fun** - Fun as pattern learning and mastery

When analyzing or designing features, apply these frameworks to create engaging learning experiences.

---

## Core Design Heuristics

### The Skill Atom (Dan Cook)
Every game interaction should complete the loop:
```
Action → Simulation → Feedback → Mental Model Update
```
If any step is broken, the player disengages.

### Theory of Fun (Raph Koster)
- **Fun = Learning new patterns**
- Players seek novel challenges within their skill range
- Boredom = Nothing new to learn
- Frustration = Challenge exceeds skill

### Key Principles for This Project

1. **Feedback Loops Must Close** - Every player action must have visible consequences
2. **XP Must Mean Something** - Never let currencies be purely cosmetic
3. **Progress Should Be Granular** - Players need frequent small wins, not just completion
4. **Rewards Enable New Learning** - Unlocks should change how players interact
5. **Mastery Creates Meaning** - Spaced repetition isn't just effective, it's satisfying

---

## Quick Reference

### Diagnosing Engagement Issues
- **Player not engaged?** → Check if feedback loop is complete
- **Feature feels meaningless?** → Check if it creates new patterns to learn
- **Progress feels slow?** → Check granularity of milestones
- **Rewards feel hollow?** → Check if they enable new actions

### Good Reward Types
| Type | Example | Why It Works |
|------|---------|--------------|
| Functional | Streak shield | Creates new decision: "Should I use it now?" |
| Unlocks | Challenge mode | New patterns to master |
| Cosmetic with meaning | Titles | Social proof of expertise |

---

## Project Context

**Religionernas Resa** is an educational flashcard game teaching Swedish students about Judaism, Christianity, and Islam. It uses:

- **Spaced Repetition** - Cards move through buckets based on mastery
- **Level Progression** - 39 levels across religions with boss battles
- **Player Level System** - XP converts to levels (1-25) with functional rewards
- **Daily Challenges** - Adaptive difficulty based on performance
- **First-Time Onboarding** - Guided flow with instant win in first 30 seconds
- **Daily Rewards** - Mystery box with variable rewards to encourage return visits

The target audience is children learning religious studies in Swedish schools.

---

## Key Features

### First-Time User Experience
New users go through a guided onboarding flow:
1. **Name Input** - Personalized welcome
2. **Guided First Card** - Tutorial question about Abrahamic religions
3. **Celebration** - "FANTASTISKT!" with +10 XP and level reveal
4. **Dashboard** - Ready to explore

Key files: `FirstTimeFlow.tsx`, `GuidedFirstCard.tsx`, `FirstCardCelebration.tsx`

### Daily Reward System
Returning users can claim daily rewards:
- **Mystery box** with shake/open animation
- **Variable rewards**: 25-150 XP based on streak (days 1-7+)
- **Bonus items**: Streak shields, hints with probability tiers

Key files: `DailyRewardModal.tsx`, `stores/gameStore.ts` (dailyReward state)

### Visual Juice
- **ParticleBackground** - Floating particles on home screen
- **Shimmer effects** - On XP progress bars
- **Pulse glow** - On level badges
- **Haptic feedback** - On interactions (mobile)

### Audio
All sounds synthesized with Web Audio API in `lib/audio.ts`:
- `playCorrectSound()`, `playWrongSound()` - Answer feedback
- `playMysteryBoxOpen()`, `playRewardReveal()` - Daily rewards
- `playMasterySound()` - Card mastery celebration
- `playLevelCompleteSound()`, `playBossVictorySound()` - Level completion

---

## Development Checks

### Available Scripts

| Command | Description |
|---------|-------------|
| `npm run typecheck` | TypeScript type checking |
| `npm run lint` | ESLint checks |
| `npm run lint:framer` | Check AnimatePresence children have keys |
| `npm run lint:all` | ESLint + Framer Motion checks |
| `npm run check` | Full check: typecheck + lint:all |
| `npm run test` | Run tests in watch mode |
| `npm run test:run` | Run tests once |

### Before Committing

Run `npm run check` to catch:
- TypeScript errors
- ESLint issues
- Missing keys on AnimatePresence children

### Framer Motion Best Practice

**AnimatePresence children must have `key` props** for proper exit animations:

```tsx
// CORRECT
<AnimatePresence>
  {showModal && (
    <motion.div key="modal" ...>
      Content
    </motion.div>
  )}
</AnimatePresence>

// WRONG - will cause React key warnings
<AnimatePresence>
  {showModal && (
    <motion.div ...>  {/* Missing key! */}
      Content
    </motion.div>
  )}
</AnimatePresence>
```
