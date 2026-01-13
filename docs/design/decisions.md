# Design Decisions Log

Document significant design decisions with rationale to prevent re-litigation.

---

## Player Level System

### Decision: Convert XP to Player Levels (1-25)
**Date:** January 2025
**Status:** Implemented

**Problem:**
XP was purely cosmetic - accumulating but doing nothing. Progress bar only showed "X av 39 nivåer" which was only gratifying at 100% completion.

**Analysis (Cook):**
The Skill Atom was broken at the Simulation step. XP went up, but nothing changed in the game world.

**Analysis (Koster):**
No new patterns to learn from XP. Players would quickly learn it's decorative noise.

**Solution:**
- 25 player levels with exponential XP curve
- Early levels come fast (100 XP = level 2)
- Max level requires significant mastery (25,800 XP)

**Why this works:**
- Closes the feedback loop (XP → Level → Rewards)
- Creates granular progress (multiple level-ups per session possible)
- Introduces new patterns at each level

---

### Decision: Permanent Unlocks (Not Consumables)
**Date:** January 2025
**Status:** Implemented

**Options Considered:**
1. Consumable rewards (use once, earn more)
2. Permanent unlocks (once earned, always available)
3. Hybrid (some permanent, some consumable)

**Chosen:** Permanent unlocks

**Rationale:**
- Reduces cognitive load (don't need to manage inventory)
- Creates clear progression milestones
- Avoids "hoarding" behavior where players never use consumables
- Better for educational context (focus on learning, not resource management)

---

### Decision: Functional Rewards Over Cosmetic
**Date:** January 2025
**Status:** Implemented

**Rewards implemented:**
| Level | Reward | Effect |
|-------|--------|--------|
| 2 | Bonus Hint | Free hint per level |
| 4 | Streak Shield | Protect streak once per session |
| 6 | XP Boost | +10% XP from all sources |
| 8 | Extra Life | 4 lives in boss battles |
| 12 | Double Mastery | 2x XP when mastering cards |
| 20 | Speed Bonus | Bonus XP for fast answers |

**Rationale (Cook):**
Each reward creates a NEW Skill Atom. "I used my shield" → "My streak survived" → "Shields are valuable".

**Rationale (Koster):**
Functional rewards introduce new patterns to learn and decisions to make.

---

### Decision: Hero Element for Level Display
**Date:** January 2025
**Status:** Implemented

**Problem:**
Player stats (XP, streak, etc.) were shown in small cards. Level needed more prominence.

**Solution:**
Large PlayerLevelCard as hero element on home page with:
- Prominent level badge with gradient
- Current title
- XP progress bar to next level
- Next reward preview
- Unlocked rewards display

**Rationale:**
- Makes progression the central narrative
- XP progress bar moves with every correct answer (not just level completions)
- Preview of next reward creates anticipation

---

### Decision: Level-Up Celebration Modal
**Date:** January 2025
**Status:** Implemented

**Implementation:**
- Confetti animation
- Title transition display (old → new with sparkles)
- New reward showcase
- Sound effects via Web Audio API (`lib/audio.ts`)

**Rationale (Koster):**
Celebration is feedback that reinforces the reward of learning. The brain needs clear signals that "this was good."

---

## Map & Level Structure

### Decision: Locked Level Modal Instead of Silent Lock
**Date:** January 2025
**Status:** Implemented

**Problem:**
Locked levels showed a lock icon but tapping did nothing. Players had no information about how to unlock.

**Solution:**
Engaging modal that explains:
- What the level contains
- How to unlock it (prerequisites or mastery path)
- Progress toward unlock for mastery-based levels

**Rationale:**
- Converts dead-end tap into learning moment
- Shows multiple paths to unlock (linear OR mastery)
- Creates anticipation ("When I master 6 more cards...")

---

### Decision: Comparison Levels with Mastery Unlock Path
**Date:** January 2025
**Status:** Implemented

**Problem:**
Comparison levels (comparing religions) were locked until previous levels completed, but players might want to access them earlier.

**Solution:**
Dual unlock path:
1. Linear: Complete prerequisite levels
2. Mastery: Master X cards from relevant topics

**Rationale:**
- Rewards deep learning, not just completion
- Creates alternative progression path for engaged players
- Connects mastery system to level unlocks

---

## UI Decisions

### Decision: Consistent Card Heights in Map Grid
**Date:** January 2025
**Status:** Implemented

**Problem:**
Level cards in map had inconsistent heights due to varying content.

**Solution:**
- `auto-rows-fr` on grid
- `h-full` and `min-h-[130px]` on cards

**Rationale:**
Visual consistency improves perceived quality and scannability.

---

## Reset Functionality

### Decision: Add "Start Over" Option
**Date:** January 2025
**Status:** Implemented

**Problem:**
No way to reset progress for testing or fresh start.

**Solution:**
Subtle "Börja om från början" link in footer with confirmation dialog.

**Rationale:**
- Accessible but not prominent (prevents accidental reset)
- Clear warning about data loss
- Useful for testing and demo purposes

---

## State Management

### Decision: Stable Card Order During Gameplay
**Date:** January 11, 2025
**Status:** Implemented

**Problem:**
After answering a question, the app would flip back to question 1 after 1-2 seconds.

**Root Cause:**
The `cards` useMemo in level/boss pages included `cardProgress` and `flowState` as dependencies. When `recordCardAnswer()` updated the store, these changes triggered a recomputation of the cards array. Functions like `sortCardsByAdaptivePriority()` would reorder cards based on new progress, but `currentCardIndex` stayed the same number—now pointing to a different card.

**Solution:**
Remove `cardProgress` and `flowState` from useMemo dependencies. Card order is computed once when the level starts using a seeded shuffle, then remains stable throughout the session.

**Trade-off:**
We lose mid-level adaptive card sorting (prioritizing struggling cards). However, the shuffle already provides randomization, and adaptive sorting can happen at level start based on initial progress state.

**Lesson Learned:**
When using useMemo with arrays that determine UI position (like card order), be careful about dependencies that update frequently. The index-to-item mapping must remain stable during the session.

---

## First-Time User Experience

### Decision: Guided First Card Before Dashboard
**Date:** January 2025
**Status:** Implemented

**Problem:**
New users saw a dense dashboard immediately after naming. Information overload with no clear action. No dopamine hook in first 60 seconds.

**Analysis (Cook):**
The onboarding flow had no Skill Atom - user completed naming but got no feedback about their learning potential.

**Analysis (Koster):**
No pattern to learn yet. The dashboard showed systems but user hadn't experienced them.

**Solution:**
After name input, show ONE guided flashcard immediately:
1. Name input → "Börja äventyret!"
2. Guided first card (simple Abrahamic religions question)
3. Celebration screen ("FANTASTISKT!") with XP and level reveal
4. Dashboard (now meaningful - user has progress)

**Key insight:** Player gets instant win within 30 seconds of naming.

**Technical note:** Required atomic state update (`startOnboarding`) to prevent race condition with zustand persist middleware. See "Atomic State Updates" pattern.

---

### Decision: Variable Daily Rewards with Mystery Box
**Date:** January 2025
**Status:** Implemented

**Problem:**
Returning users saw informational welcome modal but no compelling reason to return daily. No "pull" mechanic.

**Analysis (Koster):**
Variable rewards create anticipation ("wanting"). Fixed rewards become expected and lose emotional impact.

**Solution:**
Mystery box with tiered rewards based on streak:
- Day 1: 25-50 XP
- Day 3+: 40-75 XP, 10% bonus item chance
- Day 5+: 50-100 XP, 20% bonus item chance
- Day 7+: 75-150 XP, 30% bonus item chance

Bonus items: streak shields, hint tokens.

**Animation sequence:**
1. Box shakes with anticipation
2. Tap to open → burst animation
3. Reward reveals with bouncing numbers
4. "Kom tillbaka imorgon!" reminder

**Rationale:**
- Creates daily ritual
- Variable rewards maintain excitement
- Streak multiplier incentivizes consecutive days
- Functional rewards (shields, hints) close new Skill Atoms

---

### Decision: Atomic State Updates for Multi-Step Flows
**Date:** January 12, 2025
**Status:** Implemented

**Problem:**
First-time flow was skipping the guided card step, jumping directly from name input to dashboard.

**Root Cause:**
Two separate zustand state updates (`setPlayerName(name)` then `setOnboardingStep('firstCard')`) caused race condition with persist middleware. The persist would trigger between updates, sometimes writing intermediate state.

**Solution:**
Create atomic action that updates both values in single `set()` call:
```typescript
startOnboarding: (name) => {
  set({ playerName: name, onboardingStep: 'firstCard' });
}
```

**Lesson Learned:**
When using zustand persist middleware with multi-step flows, combine related state changes into atomic actions to prevent intermediate states from being persisted.

---

## Avatar System

### Decision: Avatar Selection During Onboarding
**Date:** January 2025
**Status:** Implemented

**Problem:**
The game lacked player identity and personalization. Progress on the map was represented only by abstract level markers.

**Analysis (Cook):**
Missing identification with game character weakens emotional investment in progress.

**Analysis (Koster):**
Customization creates ownership. "This is MY journey" feels different from "this is A journey."

**Solution:**
- 6 character avatars: Explorer, Scholar, Sage, Seeker, Guide, Mystic
- Selection happens during onboarding (after name, before first card)
- Avatar appears on journey map at current level position
- Avatar shown in PlayerLevelCard and celebrations

**Technical note:**
- Default avatar 'explorer' for existing saves (backwards compatible)
- New onboarding step 'avatar' added between 'naming' and 'firstCard'
- Avatar stored in gameStore.avatarId, persisted to localStorage

---

## Collection & Discovery

### Decision: Collection Page with Three Tabs
**Date:** January 2025
**Status:** Implemented

**Problem:**
Players had no visibility into their overall card mastery or what they could collect. Progress felt invisible between levels.

**Analysis (Cook):**
Cards reaching mastery bucket produced no feedback. The Skill Atom ended abruptly.

**Analysis (Koster):**
Collecting creates a meta-game. "I have 47 of 200 cards" creates long-term goal structure.

**Solution:**
Collection page with three tabs:
1. **Cards** - All cards with mastered/unmastered status, filter by religion
2. **Achievements** - Grouped by category (progress, skill, streak, special)
3. **Artifacts** - Unlock at mastery milestones

**Key insight:**
The collection transforms individual card mastery into visible cumulative progress.

---

### Decision: Artifact Unlocks at Mastery Milestones
**Date:** January 2025
**Status:** Implemented

**Problem:**
Mastering cards had no tangible reward beyond the mastery animation.

**Solution:**
14 artifacts unlocking at milestones:
- 5 cards: Ancient Scroll
- 10 cards: Menorah, Cross, Crescent (religion-specific)
- 15 cards: Star of Abraham
- 25 cards: Torah, Bible, Quran (religion-specific)
- 40 cards: Star of David, Dove, Kaaba (religion-specific)
- 60 cards: Lamp of Wisdom (legendary)
- 80 cards: Globe of Unity (legendary)
- 100 cards: Master's Key (legendary)

**Rationale:**
- Creates collecting meta-game
- Religion-specific artifacts reward focused study
- Legendary artifacts reward comprehensive mastery
- Progress bar shows next artifact milestone

---

### Decision: Delayed Achievement Toast
**Date:** January 2025
**Status:** Implemented

**Problem:**
Achievement toasts would appear simultaneously with level complete celebrations, creating visual chaos.

**Solution:**
Add 2-second delay before showing achievement toast, allowing other celebrations to finish first.

**Rationale:**
- Celebrations should be sequential, not overlapping
- The immediate celebration (level complete) takes priority
- Achievement feels like a "bonus discovery" when shown after

---

## Journey Map Visualization

### Decision: JourneyPath Component for Level Connections
**Date:** January 2025
**Status:** Implemented

**Problem:**
Level grid showed levels but no sense of journey or progression path.

**Solution:**
SVG-based JourneyPath showing:
- Paths connecting consecutive levels within each religion
- Completed paths as solid lines
- Uncompleted paths as dashed lines
- Player avatar at current level with glow effect
- Larger nodes for boss battles

**Design constraints:**
- Only connect levels within same religion (no cross-religion lines)
- Path colors match religion themes (blue/gold/green)
- Avatar positioned as DOM overlay (not SVG) for rich animations

**Rationale (Koster):**
Visual journey metaphor makes progress tangible. "I've come this far" is more meaningful when you can see the path behind you.
