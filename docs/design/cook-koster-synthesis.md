# Dan Cook + Raph Koster: Theory Synthesis

## Dan Cook's Skill Atoms

### The Model
Every game mechanic is built from **Skill Atoms** - the smallest unit of player learning:

```
┌─────────────────────────────────────────────────────────────┐
│                     SKILL ATOM                               │
│                                                              │
│   ACTION ──→ SIMULATION ──→ FEEDBACK ──→ MODEL UPDATE       │
│      │            │             │              │             │
│   Player       Game          Player        Player           │
│   does         responds      sees          learns           │
│   something    to action     result        pattern          │
└─────────────────────────────────────────────────────────────┘
```

### The Four Steps

1. **Action**: Player performs an input (click, answer, choice)
2. **Simulation**: Game world responds according to rules
3. **Feedback**: Player observes the consequences
4. **Model Update**: Player's mental model of "how this works" evolves

### Broken Loops
When any step is missing or weak, engagement suffers:

| Broken Step | Symptom | Example |
|-------------|---------|---------|
| No Simulation | Actions feel pointless | XP that does nothing |
| Weak Feedback | Players don't notice results | Silent progress |
| No Model Update | No learning, boredom | Trivially easy challenges |

---

## Raph Koster's Theory of Fun

### Core Thesis
**Fun is the brain's reward for learning patterns.**

When players engage with a game, their brain is:
1. Recognizing patterns
2. Predicting outcomes
3. Testing hypotheses
4. Feeling satisfaction when predictions are correct

### The Fun Curve

```
Engagement
    │
    │         ┌── Sweet Spot ──┐
    │        /                  \
    │       /                    \
    │      /                      \
    │     /                        \
    │    /                          \
    └───/────────────────────────────\───→ Skill
       Too Easy              Too Hard
       (Boring)              (Frustrating)
```

### Key Insights

1. **Novelty is fuel** - Games must continuously introduce new patterns
2. **Mastery is satisfying** - Feeling skilled is intrinsically rewarding
3. **Boredom = Pattern exhaustion** - When there's nothing new to learn
4. **Frustration = Cognitive overload** - Too many patterns at once

---

## How They Interrelate

### Cook Provides the Mechanism, Koster Explains the Motivation

| Cook (How) | Koster (Why) |
|------------|--------------|
| Skill Atom loop | Pattern learning process |
| Model Update | Brain's pattern recognition |
| Feedback | Confirmation/surprise signals |
| Simulation | The system generating patterns |

### The Combined Framework

A well-designed game feature:
1. **Creates a complete Skill Atom loop** (Cook)
2. **Introduces learnable patterns** (Koster)
3. **Scales difficulty appropriately** (Koster's curve)
4. **Updates player's mental model** (Cook's Model Update + Koster's learning)

---

## Applied to Religionernas Resa

### The XP Problem (Before Fix)

**Analysis using frameworks:**
```
ACTION:      Player answers correctly
SIMULATION:  ??? (XP increases, but nothing else)
FEEDBACK:    Number goes up
MODEL UPDATE: Player learns XP is meaningless → stops caring
```

Koster: No new patterns to learn from XP accumulation.

### The Player Level Solution (After Fix)

**Analysis using frameworks:**
```
ACTION:      Player answers correctly
SIMULATION:  XP increases → Level may increase → Rewards unlock
FEEDBACK:    Level-up celebration, new abilities shown
MODEL UPDATE: Player learns "answering well → new powers"
```

Koster: New patterns introduced at each level (rewards change gameplay).

### Spaced Repetition as Skill Atoms

```
ACTION:      Answer flashcard
SIMULATION:  Card moves between buckets
FEEDBACK:    Bucket indicator, mastery celebration
MODEL UPDATE: "This card is harder/easier than I thought"
```

The bucket system creates visible progress AND affects future encounters.

---

## Key Takeaways

1. **Always close the loop** - Every action must reach Model Update
2. **Patterns must be learnable** - Not random, not trivial
3. **Rewards should enable new actions** - Not just cosmetic
4. **Difficulty should scale** - Keep players in the "sweet spot"
5. **Make progress visible** - Feedback is the bridge to learning

---

## Sources

- Dan Cook: "Game Design Theory Applied" series, particularly "Loops and Arcs"
- Raph Koster: "A Theory of Fun for Game Design" (2004, updated 2013)
- GDC talks on skill atoms and engagement loops
