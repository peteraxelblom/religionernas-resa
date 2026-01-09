/**
 * Answer Matching Tests
 *
 * Tests all cards with acceptedAnswers to ensure:
 * 1. All listed variants are accepted
 * 2. Typos within threshold are accepted
 * 3. Wrong answers are rejected
 */

import { describe, it, expect } from 'vitest';
import { isCorrect, GradingRule } from './answerMatching';
import { judaismCards } from '@/data/cards/judaism';
import { christianityCards } from '@/data/cards/christianity';
import { islamCards } from '@/data/cards/islam';
import { sharedCards } from '@/data/cards/shared';
import { Card } from '@/types/card';

// Helper to convert Card's acceptedAnswers to GradingRule
function cardToRule(card: Card): GradingRule | undefined {
  if (!card.acceptedAnswers && !card.conceptGroups && !card.ngramThreshold) {
    return undefined;
  }
  return {
    accepted: card.acceptedAnswers,
    conceptGroups: card.conceptGroups,
    ngramThreshold: card.ngramThreshold,
  };
}

// Test that all acceptedAnswers for a card are actually accepted
function testCardAcceptedAnswers(card: Card) {
  const rule = cardToRule(card);
  if (!card.acceptedAnswers) return;

  describe(`Card ${card.id}: ${card.question.substring(0, 40)}...`, () => {
    card.acceptedAnswers!.forEach((variant) => {
      it(`should accept "${variant}"`, () => {
        expect(isCorrect(variant, card.answer, rule)).toBe(true);
      });
    });

    // Test lowercase versions
    card.acceptedAnswers!.forEach((variant) => {
      it(`should accept lowercase "${variant.toLowerCase()}"`, () => {
        expect(isCorrect(variant.toLowerCase(), card.answer, rule)).toBe(true);
      });
    });
  });
}

// =============================================================================
// Judaism Card Tests
// =============================================================================
describe('Judaism Cards - Answer Matching', () => {
  const basicCards = judaismCards.filter(
    (c) => c.type === 'basic' && c.acceptedAnswers
  );

  basicCards.forEach((card) => testCardAcceptedAnswers(card));

  // Specific test for Chanukka (the user's issue)
  describe('Chanukka spelling variants (jud-024)', () => {
    const chanukkaCard = judaismCards.find((c) => c.id === 'jud-024')!;
    const rule = cardToRule(chanukkaCard);

    const expectedAccepted = [
      'Chanukka',
      'Chanukkah',
      'Hanukka',
      'Channukka',
      'Ljusfesten',
      'chanukka',
      'CHANUKKA',
      'ChAnUkKa',
    ];

    expectedAccepted.forEach((variant) => {
      it(`should accept "${variant}"`, () => {
        expect(isCorrect(variant, chanukkaCard.answer, rule)).toBe(true);
      });
    });

    const expectedRejected = ['Jul', 'Påsk', 'Ramadan', 'Sukkot'];

    expectedRejected.forEach((wrong) => {
      it(`should reject "${wrong}"`, () => {
        expect(isCorrect(wrong, chanukkaCard.answer, rule)).toBe(false);
      });
    });
  });

  // Test Jewish holidays
  describe('Jewish holidays spelling variants', () => {
    it('should accept Pesach variants', () => {
      const card = judaismCards.find((c) => c.id === 'jud-022')!;
      const rule = cardToRule(card);
      expect(isCorrect('Pesach', card.answer, rule)).toBe(true);
      expect(isCorrect('Pessach', card.answer, rule)).toBe(true);
      expect(isCorrect('Påsk', card.answer, rule)).toBe(true);
    });

    it('should accept Jom kippur variants', () => {
      const card = judaismCards.find((c) => c.id === 'jud-023')!;
      const rule = cardToRule(card);
      expect(isCorrect('Jom kippur', card.answer, rule)).toBe(true);
      expect(isCorrect('Jom kipur', card.answer, rule)).toBe(true);
      expect(isCorrect('Försoningsdagen', card.answer, rule)).toBe(true);
    });

    it('should accept Sabbat variants', () => {
      const card = judaismCards.find((c) => c.id === 'jud-027')!;
      const rule = cardToRule(card);
      expect(isCorrect('Sabbat', card.answer, rule)).toBe(true);
      expect(isCorrect('Sabbaten', card.answer, rule)).toBe(true);
      expect(isCorrect('Shabbat', card.answer, rule)).toBe(true);
    });
  });

  // Test ceremonies
  describe('Jewish ceremonies', () => {
    it('should accept Bar mitzva variants', () => {
      const card = judaismCards.find((c) => c.id === 'jud-029')!;
      const rule = cardToRule(card);
      expect(isCorrect('Bar mitzva', card.answer, rule)).toBe(true);
      expect(isCorrect('Barmitzva', card.answer, rule)).toBe(true);
      expect(isCorrect('Bar-mitzva', card.answer, rule)).toBe(true);
    });

    it('should accept Bat mitzva variants', () => {
      const card = judaismCards.find((c) => c.id === 'jud-030')!;
      const rule = cardToRule(card);
      expect(isCorrect('Bat mitzva', card.answer, rule)).toBe(true);
      expect(isCorrect('Batmitzva', card.answer, rule)).toBe(true);
      expect(isCorrect('Bat-mitzva', card.answer, rule)).toBe(true);
    });
  });
});

// =============================================================================
// Christianity Card Tests
// =============================================================================
describe('Christianity Cards - Answer Matching', () => {
  const basicCards = christianityCards.filter(
    (c) => c.type === 'basic' && c.acceptedAnswers
  );

  basicCards.forEach((card) => testCardAcceptedAnswers(card));

  // Test specific important cards
  describe('Christian holidays spelling variants', () => {
    it('should accept Jul variants', () => {
      const card = christianityCards.find((c) => c.id === 'chr-030')!;
      const rule = cardToRule(card);
      expect(isCorrect('Jul', card.answer, rule)).toBe(true);
      expect(isCorrect('Julen', card.answer, rule)).toBe(true);
    });

    it('should accept Påsk variants', () => {
      const card = christianityCards.find((c) => c.id === 'chr-031')!;
      const rule = cardToRule(card);
      expect(isCorrect('Påsk', card.answer, rule)).toBe(true);
      expect(isCorrect('Påsken', card.answer, rule)).toBe(true);
    });

    it('should accept Kristi himmelsfärdsdag variants', () => {
      const card = christianityCards.find((c) => c.id === 'chr-034')!;
      const rule = cardToRule(card);
      expect(isCorrect('Kristi himmelsfärdsdag', card.answer, rule)).toBe(true);
      expect(isCorrect('Himmelsfärd', card.answer, rule)).toBe(true);
      expect(isCorrect('Himmelsfärdsdagen', card.answer, rule)).toBe(true);
    });
  });

  describe('Christian ceremonies', () => {
    it('should accept Dop variants', () => {
      const card = christianityCards.find((c) => c.id === 'chr-035')!;
      const rule = cardToRule(card);
      expect(isCorrect('Dop', card.answer, rule)).toBe(true);
      expect(isCorrect('Dopet', card.answer, rule)).toBe(true);
    });

    it('should accept Nattvarden variants', () => {
      const card = christianityCards.find((c) => c.id === 'chr-037')!;
      const rule = cardToRule(card);
      expect(isCorrect('Nattvarden', card.answer, rule)).toBe(true);
      expect(isCorrect('Nattvard', card.answer, rule)).toBe(true);
    });
  });
});

// =============================================================================
// Islam Card Tests
// =============================================================================
describe('Islam Cards - Answer Matching', () => {
  const basicCards = islamCards.filter(
    (c) => c.type === 'basic' && c.acceptedAnswers
  );

  basicCards.forEach((card) => testCardAcceptedAnswers(card));

  describe('Islamic holidays and practices', () => {
    it('should accept Ramadan variants', () => {
      const card = islamCards.find((c) => c.id === 'isl-031')!;
      const rule = cardToRule(card);
      expect(isCorrect('Ramadan', card.answer, rule)).toBe(true);
      expect(isCorrect('Ramadhan', card.answer, rule)).toBe(true);
    });

    it('should accept Eid al-fitr variants', () => {
      const card = islamCards.find((c) => c.id === 'isl-033')!;
      const rule = cardToRule(card);
      expect(isCorrect('Eid al-fitr', card.answer, rule)).toBe(true);
      expect(isCorrect('Eid', card.answer, rule)).toBe(true);
      expect(isCorrect('Eid-al-fitr', card.answer, rule)).toBe(true);
    });

    it('should accept Hajj variants', () => {
      const card = islamCards.find((c) => c.id === 'isl-020')!;
      const rule = cardToRule(card);
      expect(isCorrect('Hajj', card.answer, rule)).toBe(true);
      expect(isCorrect('Hadj', card.answer, rule)).toBe(true);
      expect(isCorrect('Vallfärden', card.answer, rule)).toBe(true);
    });
  });

  describe('Islamic holy places', () => {
    it('should accept Mecka variants', () => {
      const card = islamCards.find((c) => c.id === 'isl-036')!;
      const rule = cardToRule(card);
      expect(isCorrect('Mecka', card.answer, rule)).toBe(true);
      expect(isCorrect('Mekka', card.answer, rule)).toBe(true);
    });

    it('should accept Kaba variants', () => {
      const card = islamCards.find((c) => c.id === 'isl-037')!;
      const rule = cardToRule(card);
      expect(isCorrect('Kaba', card.answer, rule)).toBe(true);
      expect(isCorrect('Kaaba', card.answer, rule)).toBe(true);
    });
  });

  describe('Five pillars', () => {
    it('should accept Fem gånger variants for prayer count', () => {
      const card = islamCards.find((c) => c.id === 'isl-018')!;
      const rule = cardToRule(card);
      expect(isCorrect('Fem gånger', card.answer, rule)).toBe(true);
      expect(isCorrect('5 gånger', card.answer, rule)).toBe(true);
      expect(isCorrect('Fem', card.answer, rule)).toBe(true);
      expect(isCorrect('5', card.answer, rule)).toBe(true);
    });
  });
});

// =============================================================================
// Shared Card Tests
// =============================================================================
describe('Shared Cards - Answer Matching', () => {
  const basicCards = sharedCards.filter(
    (c) => c.type === 'basic' && c.acceptedAnswers
  );

  basicCards.forEach((card) => testCardAcceptedAnswers(card));

  describe('Monoteism concept matching', () => {
    const card = sharedCards.find((c) => c.id === 'shared-001')!;
    const rule = cardToRule(card);

    it('should accept various phrasings', () => {
      expect(isCorrect('Tron på en enda Gud', card.answer, rule)).toBe(true);
      expect(isCorrect('Tro på en gud', card.answer, rule)).toBe(true);
      expect(isCorrect('Det finns bara en gud', card.answer, rule)).toBe(true);
    });

    it('should reject polytheism answers', () => {
      expect(isCorrect('Tro på flera gudar', card.answer, rule)).toBe(false);
    });
  });

  describe('Abraham name variants', () => {
    const card = sharedCards.find((c) => c.id === 'shared-003')!;
    const rule = cardToRule(card);

    it('should accept Abraham variants', () => {
      expect(isCorrect('Abraham', card.answer, rule)).toBe(true);
      expect(isCorrect('Abram', card.answer, rule)).toBe(true);
      expect(isCorrect('Ibrahim', card.answer, rule)).toBe(true);
    });

    it('should accept typos', () => {
      expect(isCorrect('Abrahm', card.answer, rule)).toBe(true);
    });

    it('should reject wrong names', () => {
      expect(isCorrect('Moses', card.answer, rule)).toBe(false);
      expect(isCorrect('Jesus', card.answer, rule)).toBe(false);
    });
  });
});

// =============================================================================
// Coverage Check - Ensure all basic cards have acceptedAnswers
// =============================================================================
describe('Answer Matching Coverage', () => {
  const allCards = [
    ...judaismCards,
    ...christianityCards,
    ...islamCards,
    ...sharedCards,
  ];

  const basicCardsWithoutAnswers = allCards.filter(
    (c) => c.type === 'basic' && !c.acceptedAnswers
  );

  it('should have acceptedAnswers for all basic cards', () => {
    if (basicCardsWithoutAnswers.length > 0) {
      console.log(
        'Cards missing acceptedAnswers:',
        basicCardsWithoutAnswers.map((c) => c.id)
      );
    }
    expect(basicCardsWithoutAnswers.length).toBe(0);
  });
});
