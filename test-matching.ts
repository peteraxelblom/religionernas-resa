/**
 * Quick test script for answer matching
 * Run with: npx tsx test-matching.ts
 */

import { isCorrect, getMatchDetails } from './lib/answerMatching';

// Test cases - note: GradingRule uses 'accepted' not 'acceptedAnswers'
const tests = [
  // Monoteism - exact and fuzzy
  {
    name: 'Monoteism - exact match',
    input: 'Tron på en enda Gud',
    answer: 'Tron på en enda Gud',
    rule: {
      accepted: ['Tron på en enda Gud', 'Tro på en gud'],
      conceptGroups: [['tro', 'tron', 'finns'], ['en', 'enda', 'bara'], ['gud']],
      ngramThreshold: 0.7,
    },
    expected: true,
  },
  {
    name: 'Monoteism - lowercase variant',
    input: 'tron på en enda gud',
    answer: 'Tron på en enda Gud',
    rule: {
      accepted: ['Tron på en enda Gud', 'Tro på en gud'],
      conceptGroups: [['tro', 'tron', 'finns'], ['en', 'enda', 'bara'], ['gud']],
      ngramThreshold: 0.7,
    },
    expected: true,
  },
  {
    name: 'Monoteism - concept match (different phrasing)',
    input: 'Det finns bara en gud',
    answer: 'Tron på en enda Gud',
    rule: {
      accepted: ['Tron på en enda Gud', 'Tro på en gud'],
      conceptGroups: [['tro', 'tron', 'finns'], ['en', 'enda', 'bara'], ['gud']],
      ngramThreshold: 0.7,
    },
    expected: true,
  },
  {
    name: 'Monoteism - short form',
    input: 'Tro på en gud',
    answer: 'Tron på en enda Gud',
    rule: {
      accepted: ['Tron på en enda Gud', 'Tro på en gud'],
      conceptGroups: [['tro', 'tron', 'finns'], ['en', 'enda', 'bara'], ['gud']],
      ngramThreshold: 0.7,
    },
    expected: true,
  },
  {
    name: 'Monoteism - typo',
    input: 'Tron på en enda gudd',
    answer: 'Tron på en enda Gud',
    rule: {
      accepted: ['Tron på en enda Gud', 'Tro på en gud'],
      conceptGroups: [['tro', 'tron', 'finns'], ['en', 'enda', 'bara'], ['gud']],
      ngramThreshold: 0.7,
    },
    expected: true,
  },
  {
    name: 'Monoteism - WRONG (multiple gods)',
    input: 'Tro på flera gudar',
    answer: 'Tron på en enda Gud',
    rule: {
      accepted: ['Tron på en enda Gud', 'Tro på en gud'],
      conceptGroups: [['tro', 'tron', 'finns'], ['en', 'enda', 'bara'], ['gud']],
      ngramThreshold: 0.7,
    },
    expected: false,
  },

  // Abraham - simple name matching (lower threshold for short names)
  {
    name: 'Abraham - exact',
    input: 'Abraham',
    answer: 'Abraham',
    rule: { accepted: ['Abraham', 'Abram', 'Ibrahim'], ngramThreshold: 0.6 },
    expected: true,
  },
  {
    name: 'Abraham - typo',
    input: 'Abrahm',
    answer: 'Abraham',
    rule: { accepted: ['Abraham', 'Abram', 'Ibrahim'], ngramThreshold: 0.6 },
    expected: true,
  },
  {
    name: 'Abraham - Islamic name',
    input: 'Ibrahim',
    answer: 'Abraham',
    rule: { accepted: ['Abraham', 'Abram', 'Ibrahim'], ngramThreshold: 0.6 },
    expected: true,
  },
  {
    name: 'Abraham - WRONG',
    input: 'Moses',
    answer: 'Abraham',
    rule: { accepted: ['Abraham', 'Abram', 'Ibrahim'], ngramThreshold: 0.6 },
    expected: false,
  },

  // Jerusalem
  {
    name: 'Jerusalem - exact',
    input: 'Jerusalem',
    answer: 'Jerusalem',
    rule: { accepted: ['Jerusalem', 'Jeruzalem', 'Yerushalayim'], ngramThreshold: 0.7 },
    expected: true,
  },
  {
    name: 'Jerusalem - typo',
    input: 'Jerusalm',
    answer: 'Jerusalem',
    rule: { accepted: ['Jerusalem', 'Jeruzalem', 'Yerushalayim'], ngramThreshold: 0.7 },
    expected: true,
  },

  // Mellanöstern - should NOT accept individual countries
  {
    name: 'Mellanöstern - exact',
    input: 'Mellanöstern',
    answer: 'Mellanöstern',
    rule: { accepted: ['Mellanöstern', 'Mellan östern', 'Främre orienten'], ngramThreshold: 0.8 },
    expected: true,
  },
  {
    name: 'Mellanöstern - WRONG (individual country)',
    input: 'Israel',
    answer: 'Mellanöstern',
    rule: { accepted: ['Mellanöstern', 'Mellan östern', 'Främre orienten'], ngramThreshold: 0.8 },
    expected: false,
  },

  // No rule - fallback behavior
  {
    name: 'No rule - exact match',
    input: 'Korset',
    answer: 'Korset',
    rule: undefined,
    expected: true,
  },
  {
    name: 'No rule - substring (>3 chars)',
    input: 'Kors',
    answer: 'Korset',
    rule: undefined,
    expected: true,
  },

  // Edge cases
  {
    name: 'Empty input - WRONG',
    input: '',
    answer: 'Something',
    rule: undefined,
    expected: false,
  },
  {
    name: 'Whitespace only - WRONG',
    input: '   ',
    answer: 'Something',
    rule: undefined,
    expected: false,
  },
];

// Run tests
console.log('Answer Matching Tests\n' + '='.repeat(50));

let passed = 0;
let failed = 0;

for (const test of tests) {
  const result = isCorrect(test.input, test.answer, test.rule);
  const details = getMatchDetails(test.input, test.answer, test.rule);
  const status = result === test.expected ? '✓' : '✗';

  if (result === test.expected) {
    passed++;
    console.log(`${status} ${test.name}`);
  } else {
    failed++;
    console.log(`${status} ${test.name}`);
    console.log(`   Input: "${test.input}"`);
    console.log(`   Expected: ${test.expected}, Got: ${result}`);
    console.log(`   Details: ${JSON.stringify(details)}`);
  }
}

console.log('\n' + '='.repeat(50));
console.log(`Results: ${passed} passed, ${failed} failed`);

if (failed > 0) {
  process.exit(1);
}
