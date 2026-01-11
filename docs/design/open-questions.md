# Open Design Questions

Unresolved tensions, future considerations, and ideas to explore.

---

## Reward System Tensions

### Speed Bonus (Level 20) - Implementation Needed

**Current state:** Defined in `playerLevel.ts` but not implemented.

**Questions:**
- What counts as "fast"? 3 seconds? 5 seconds?
- Should it scale with question difficulty?
- Risk: Encouraging speed over learning?

**Koster concern:** Speed pressure might shift focus from pattern learning to reflexive answering.

**Possible solution:** Only award speed bonus for cards already in bucket 3+, where the player has demonstrated understanding.

---

### Streak Shield Usage UX

**Current state:** Shield exists but no UI to activate it.

**Questions:**
- Automatic use when streak would break?
- Manual button to "activate shield for this session"?
- Visual indicator that shield is active/available?

**Trade-off:** Automatic feels supportive but removes player agency. Manual creates decision but might feel punishing if forgotten.

---

### Double Mastery Bonus (Level 12) - Not Visible

**Current state:** Applied in `addXP` but player can't see when it triggers.

**Questions:**
- Should mastery moments show "2x XP!" indicator?
- Is this reward too subtle to notice?
- Does it need celebration?

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

### Sound Effects - Not Implemented

**Opportunities:**
- Level-up fanfare
- Card mastery chime
- Correct/incorrect answer sounds
- Streak milestone sounds

**Koster insight:** Audio is powerful feedback. The brain processes sound faster than visual.

**Questions:**
- What sound style fits the game? Cheerful? Calm? Gamified?
- Risk of annoying in classroom settings?
- Volume controls needed?

---

### Haptic Feedback (Mobile)

**Not explored:** Vibration on correct answers, level-ups, achievements.

**Questions:**
- Is this supported in PWA context?
- Would it add or distract?

---

## Engagement Hooks

### Daily Challenge Variety

**Current state:** Adaptive difficulty based on performance.

**Future questions:**
- Themed challenges (e.g., "Judaism Day")?
- Time-limited bonus XP events?
- Social challenges (compare with classmates)?

---

### Returning Player Experience

**Not designed:** What happens when a player returns after days/weeks?

**Questions:**
- Should due cards feel urgent or welcoming?
- "Welcome back" celebration?
- Catch-up mechanics (reduced difficulty)?

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
