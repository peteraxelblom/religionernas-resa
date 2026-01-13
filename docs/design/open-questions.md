# Open Design Questions

Unresolved tensions, future considerations, and ideas to explore.

---

## Reward System Tensions

### ✅ Speed Bonus (Level 20) - RESOLVED

**Resolution (Jan 2025):**
- Implemented in `calculateSpeedBonus()` in `playerLevel.ts`
- Threshold: 3 seconds for fast answers
- Only applies to cards in `reviewing` or `mastered` bucket (bucket 3+)
- Awards flat +5 XP bonus
- UI feedback: "⚡ Snabbhetsbonus +5 XP!" shown in FlashCard feedback

---

### ✅ Streak Shield Usage UX - RESOLVED

**Resolution (Jan 2025):**
- **Automatic activation** when streak would break (no manual button needed)
- Visual indicator: 🛡️ icon shown in level/boss/daily/review headers when shield is available
- When triggered: Shows "🛡️ SKÖLDEN SKYDDADE!" feedback message
- Resets daily (one use per day)

---

### ✅ Double Mastery Bonus (Level 12) - RESOLVED

**Resolution (Jan 2025):**
- Applied in `recordCardAnswer` via `applyMasteryBonus()`
- Visible in mastery celebration: "+50 XP (2x bonus!)" subtitle
- Combined with mastery celebration animation and sound

---

## Progression Balance

### Early Game vs Late Game Pacing

**Observation:** First few levels come very fast (100 XP = level 2), but later levels slow dramatically.

**Questions:**
- Is the exponential curve too steep?
- Do players need milestones between level 20-25?
- Should there be "prestige" after level 25?

**Data needed:** Track where players stall or disengage.

---

### Comparison Levels Unlock Threshold

**Current state:** "Master X cards" to unlock comparison levels.

**Questions:**
- What's the right X? Too low = trivial, too high = frustrating
- Should it be a percentage of cards rather than absolute number?
- Do players understand the mastery path exists?

---

## Audio & Polish

### ✅ Sound Effects - RESOLVED

**Resolution (Jan 2025):**
- All sounds synthesized with Web Audio API in `lib/audio.ts`
- Style: Cheerful, gamified (short melodic phrases)
- Implemented sounds:
  - `playCorrectSound()`, `playWrongSound()` - Answer feedback
  - `playMysteryBoxOpen()`, `playRewardReveal()` - Daily rewards
  - `playMasterySound()` - Card mastery celebration
  - `playLevelCompleteSound()`, `playBossVictorySound()` - Level completion

**Volume:** Sounds are subtle (0.1-0.3 gain), suitable for classroom.

---

### ✅ Haptic Feedback (Mobile) - RESOLVED

**Resolution (Jan 2025):**
- Implemented using `navigator.vibrate()` API
- Used for: correct answers, level-ups, button taps
- Graceful fallback when not supported (PWA/desktop)
- Pattern: Short pulse (50ms) for feedback, longer (100ms) for celebrations

---

## Engagement Hooks

### Daily Challenge Variety

**Current state:** Adaptive difficulty based on performance.

**Future questions:**
- Themed challenges (e.g., "Judaism Day")?
- Time-limited bonus XP events?
- Social challenges (compare with classmates)?

---

### ✅ Returning Player Experience - RESOLVED

**Resolution (Jan 2025):**
- **Welcome Back Modal**: Shows personalized greeting, streak status, due cards count
- **Daily Reward System**: Mystery box with variable XP (25-150) based on streak tier
- **Tone**: Welcoming, not urgent ("Välkommen tillbaka, {name}!")
- **Streak handling**:
  - Maintained: "Bra jobbat! X dagar i rad"
  - Broken: "Din streak nollställdes, men sköldar kan skydda dig!"
- **Key files**: `WelcomeBackModal.tsx`, `DailyRewardModal.tsx`, `lib/returningPlayer.ts`

See decisions.md "Variable Daily Rewards with Mystery Box" and patterns.md "Variable Daily Rewards" for design rationale.

---

### Multiplayer/Social Elements

**Not designed:** Currently single-player only.

**Ideas to explore:**
- Classroom leaderboards
- Cooperative challenges
- "Send a challenge to friend"

**Concerns:**
- Competition might demotivate struggling learners
- Privacy in school context
- Complexity vs learning focus

---

## Content Questions

### Card Difficulty Ratings

**Current state:** Cards have difficulty levels but unclear how they affect gameplay.

**Questions:**
- Should difficulty affect XP rewards?
- Should SR algorithm weight difficulty?
- Are difficulty ratings accurate?

---

### Boss Battle Design

**Current state:** Bosses are timed multi-card challenges.

**Questions:**
- Are bosses too hard/easy?
- Do lives (3 default, 4 with reward) feel fair?
- Should failed bosses be repeatable immediately?

---

## Experimental Branches (In Progress)

### Swipe Interactions (alt/swipe-interactions)

**Status:** Branch exists, not yet merged

**Features being tested:**
- Swipe right = Sant, swipe left = Falskt for true/false cards
- Drag-and-drop for multiple choice
- Gesture-based interactions for more tactile feel

**Open questions:**
- Does swiping feel natural on mobile?
- Is drag-and-drop intuitive for multiple choice?
- How does accessibility work with gestures?

---

### Timer & Tension Mechanics (alt/tension-timers)

**Status:** Branch exists, not yet merged

**Features being tested:**
- Visual countdown timer on cards
- Tap-to-disable timer (for stressed kids)
- Options: disable for level or disable for session

**Open questions:**
- Does timer add helpful urgency or harmful stress?
- Is tap-to-disable discoverable enough?
- Should timer be opt-in rather than opt-out?

---

## Collection & Avatar System

### Avatar Customization Depth

**Current state:** 6 fixed avatars chosen at onboarding.

**Questions:**
- Should players be able to change avatar later?
- Unlockable avatars as rewards?
- Avatar accessories or upgrades?

---

### Golden Card Discovery Rate

**Current state:** 1 in 20 cards is "golden" (deterministic based on card ID hash).

**Questions:**
- Is 5% the right frequency?
- Should golden cards have special content?
- Does the celebration feel special enough?

---

## Technical Debt

### Performance with Many Cards

**Not tested:** What happens with 500+ cards in localStorage?

**Questions:**
- Does app slow down?
- Need pagination or lazy loading?
- Archive mastered cards?

---

### Offline Support

**Current state:** PWA basics but not tested offline.

**Questions:**
- Do levels work offline?
- Is progress synced when back online?
- Clear offline indicators?

---

## How to Use This Document

When exploring one of these questions:

1. **Test a hypothesis** - Build a small prototype or A/B test
2. **Document the result** in `decisions.md`
3. **Extract patterns** to `patterns.md` if generally applicable
4. **Remove from this list** once resolved

When new questions arise:

1. **Add them here** with context
2. **Note the frameworks** - What would Cook/Koster say?
3. **Identify data needed** to answer the question
