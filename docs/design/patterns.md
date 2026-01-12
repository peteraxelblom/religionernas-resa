# Reusable Game Design Patterns

Patterns discovered during development that can be applied to future features.

---

## Pattern: Feedback Loop Closure

### Problem
Player actions that produce no meaningful game world changes feel pointless.

### Solution
Ensure every player action completes the Skill Atom:
```
Action → Simulation → Feedback → Model Update
```

### Implementation Checklist
- [ ] Action triggers a state change
- [ ] State change is visible to player
- [ ] Player can learn from the outcome
- [ ] Learning enables better future decisions

### Example: XP System
**Before (broken):** Answer → XP number increases → Nothing happens
**After (working):** Answer → XP increases → Level might increase → New abilities unlock

---

## Pattern: Granular Progress Indicators

### Problem
Large milestones (e.g., "Complete all 39 levels") feel distant and demotivating.

### Solution
Create multiple overlapping progress systems at different timescales:

| Timescale | Progress Type | Example |
|-----------|---------------|---------|
| Immediate | Per-action | XP numbers flying |
| Short-term | Per-session | Daily streak, review count |
| Medium-term | Per-week | Player level progression |
| Long-term | Per-month | Level completion, mastery |

### Implementation
- Use exponential curves for levels (fast early, slow late)
- Show "next milestone" not just "total progress"
- Multiple parallel tracks (XP, mastery, completion)

---

## Pattern: Anticipation Through Preview

### Problem
Locked content feels like a barrier, not a goal.

### Solution
Show what's behind the lock to create anticipation:
- Preview next reward before earning it
- Show progress toward unlock
- Explain how to unlock (multiple paths if possible)

### Example: Locked Level Modal
Instead of just showing a lock icon:
- Display level name and description
- Show "Complete X to unlock" OR "Master Y cards to unlock"
- Display progress bar toward unlock

---

## Pattern: Functional Over Cosmetic Rewards

### Problem
Cosmetic rewards (titles, colors) feel hollow after initial novelty.

### Solution
Rewards should enable new player actions or decisions:

| Reward Type | Example | New Decision Created |
|-------------|---------|---------------------|
| Defensive | Streak Shield | "Should I use it now or save it?" |
| Offensive | XP Boost | "Optimal time to play more?" |
| Strategic | Bonus Hint | "When to use my free hint?" |
| Recovery | Extra Life | "I can take more risks now" |

### Key Insight
The best rewards close new Skill Atom loops, not just decorate existing ones.

---

## Pattern: Celebration Moments

### Problem
Achievements go unnoticed if not highlighted.

### Solution
Create dedicated celebration UI for key moments:
- Confetti/particles for visual impact
- Sound cues for audio reinforcement (Web Audio API)
- Transition animations (old state → new state)
- Clear statement of what was earned

### When to Celebrate
- Level up (player level)
- Card mastery (bucket 5)
- Level completion
- Achievement unlock
- Daily challenge completion

### When NOT to Celebrate
- Every correct answer (too frequent)
- Minor XP gains (noise)
- Routine actions

---

## Pattern: Dual Unlock Paths

### Problem
Linear progression locks out players who excel in specific areas.

### Solution
Offer multiple paths to the same unlock:

1. **Sequential Path**: Complete prerequisites in order
2. **Mastery Path**: Demonstrate deep knowledge to skip ahead

### Benefits
- Rewards different learning styles
- Creates meaningful choice
- Reduces frustration for skilled players

### Example: Comparison Levels
- Path 1: Complete Judaism, Christianity, Islam basics
- Path 2: Master 15 cards from each religion

---

## Pattern: Hero Element Hierarchy

### Problem
Too many equal-weight UI elements make progress feel scattered.

### Solution
Create clear visual hierarchy:

```
┌─────────────────────────────────────────┐
│          HERO ELEMENT (40%)             │  ← Primary identity/progress
│         Player Level Card               │
├─────────────────────────────────────────┤
│     SECONDARY ACTIONS (30%)             │  ← Quick stats, CTAs
│     Stats row, main buttons             │
├─────────────────────────────────────────┤
│     TERTIARY INFO (30%)                 │  ← Context, categories
│     Religion cards, footer              │
└─────────────────────────────────────────┘
```

### Implementation
- One primary visual anchor per screen
- Support elements frame but don't compete
- Progress should be visible without scrolling

---

## Pattern: Spaced Repetition as Game Mechanic

### Problem
Spaced repetition is effective but often feels like work.

### Solution
Frame the SR algorithm as a game system:

| SR Concept | Game Frame |
|------------|------------|
| Interval increases | Card "levels up" |
| Due cards | "Cards need attention" |
| Mastery (bucket 5) | Card is "mastered" |
| Lapsed cards | Card "dropped" a level |

### Visual Indicators
- Bucket progress bar on each card
- Mastery celebrations
- "Cards due" as daily quest

---

## Pattern: Session-Scoped Resources

### Problem
Permanent resources can be hoarded; per-action resources feel tedious.

### Solution
Resources that reset each session:
- Fresh start every day
- Use-it-or-lose-it encouragement
- No long-term resource management

### Examples
- "Free hint per level" (per session)
- "Streak shield" (once per session)
- Daily challenge bonuses

---

## Pattern: Instant Win Onboarding

### Problem
New users see complex dashboards before experiencing the core loop. High cognitive load, no emotional hook.

### Solution
Give the player a win within 30 seconds of starting:

1. **Minimal setup** - Name only (no tutorials, no settings)
2. **Immediate action** - One simple task they can succeed at
3. **Big celebration** - Confetti, XP, level reveal
4. **Then dashboard** - Now context is meaningful

### Implementation
```
Name Input → Easy First Card → CELEBRATION → Dashboard
              (guaranteed success)   (XP + Level)
```

### Key Principles
- First question should be easy (70%+ success rate)
- Even wrong answers get partial reward ("everyone wins")
- Celebration should feel disproportionately big
- Player arrives at dashboard with momentum, not confusion

### Example: Religionernas Resa
- Name input with "Börja äventyret!" button
- One multiple-choice card about Abrahamic religions
- "FANTASTISKT!" screen with +10 XP and level badge
- Dashboard shows 10/100 XP progress

---

## Pattern: Variable Daily Rewards

### Problem
Fixed daily rewards become expected and lose excitement. Players return out of obligation, not anticipation.

### Solution
Mystery box with variable rewards based on engagement:

| Streak | Reward Range | Bonus Chance |
|--------|-------------|--------------|
| Day 1 | 25-50 XP | 0% |
| Day 3+ | 40-75 XP | 10% |
| Day 5+ | 50-100 XP | 20% |
| Day 7+ | 75-150 XP | 30% |

### Psychological Mechanics
- **Variable ratio** creates anticipation ("wanting")
- **Streak multiplier** rewards consistency
- **Bonus items** (shields, hints) add surprise
- **Animation sequence** builds tension before reveal

### Animation Sequence
1. Mystery box appears (subtle shake)
2. Player taps → box shakes more intensely
3. Open animation with burst particles
4. Reward reveals with bouncing numbers
5. "Kom tillbaka imorgon!" reminder

### Key Insight
The reveal animation is as important as the reward. Anticipation activates dopamine more than the actual reward.

---

## Pattern: Atomic State Updates

### Problem
Multi-step flows break when state updates happen separately with persist middleware.

### Solution
Combine related state changes into single atomic actions:

```typescript
// WRONG - race condition risk
setPlayerName(name);
setOnboardingStep('firstCard');

// CORRECT - atomic update
startOnboarding: (name) => {
  set({ playerName: name, onboardingStep: 'firstCard' });
}
```

### When to Apply
- Multi-step flows (onboarding, wizard)
- Related state that must stay in sync
- Using zustand/redux persist middleware

### Symptoms of the Problem
- Steps get skipped randomly
- Flow works in dev but fails in production
- Refreshing at wrong time causes invalid state

---

## Pattern Catalog

Quick reference for common design situations:

| Situation | Pattern to Apply |
|-----------|------------------|
| Players ignore a system | Feedback Loop Closure |
| Progression feels slow | Granular Progress Indicators |
| Locked content frustrates | Anticipation Through Preview |
| Rewards feel hollow | Functional Over Cosmetic |
| Achievements unnoticed | Celebration Moments |
| Players stuck on prerequisites | Dual Unlock Paths |
| UI feels cluttered | Hero Element Hierarchy |
| Learning feels like work | Spaced Repetition as Game |
| Players hoard resources | Session-Scoped Resources |
| New users overwhelmed | Instant Win Onboarding |
| Daily returns feel obligatory | Variable Daily Rewards |
| Multi-step flows break | Atomic State Updates |

---

## Adding New Patterns

When you identify a new pattern during development:

1. Name it clearly
2. Describe the problem it solves
3. Explain the solution principle
4. Provide concrete implementation examples
5. Add to the pattern catalog table
