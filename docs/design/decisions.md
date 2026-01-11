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
- Sound effect (TODO: not yet implemented)

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
