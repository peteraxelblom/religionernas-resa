import { Card } from '@/types/card';

export const sharedCards: Card[] = [
  // Origin/Tutorial - Shared concepts
  {
    id: 'shared-001',
    religion: 'shared',
    category: 'grundbegrepp',
    difficulty: 1,
    type: 'basic',
    question: 'Vad betyder monoteism?',
    answer: 'Tron på en enda Gud',
    hint: 'Mono = en',
    funFact: 'Judendom, kristendom och islam är alla monoteistiska religioner!',
    levelId: 'origin-1',
    // Smart matching: accept various phrasings about belief in one god
    acceptedAnswers: [
      'Tron på en enda Gud',
      'Tro på en gud',
      'Tron på en gud',
      'Att tro på en gud',
      'Det finns bara en gud',
      'Tro på endast en gud',
    ],
    conceptGroups: [
      ['tro', 'tron', 'dyrka', 'finns', 'existerar', 'att'],  // belief/existence
      ['en', 'enda', 'endast', 'bara', '1'],                   // one/single
      ['gud'],                                                  // god
    ],
    ngramThreshold: 0.7,
  },
  {
    id: 'shared-002',
    religion: 'shared',
    category: 'grundbegrepp',
    difficulty: 1,
    type: 'multiple_choice',
    question: 'Vilka tre religioner kallas de abrahamitiska religionerna?',
    answer: 'Judendom, kristendom och islam',
    options: ['Judendom, kristendom och islam', 'Buddhism, hinduism och islam', 'Kristendom, buddhism och judendom', 'Islam, hinduism och kristendom'],
    levelId: 'origin-1'
  },
  {
    id: 'shared-003',
    religion: 'shared',
    category: 'historia',
    difficulty: 1,
    type: 'basic',
    question: 'Vem är stamfader för alla tre abrahamitiska religionerna?',
    answer: 'Abraham',
    hint: 'Namnet börjar på A',
    funFact: 'Abraham levde för cirka 4000 år sedan i Mesopotamien!',
    levelId: 'origin-1',
    // Simple name - fuzzy match handles typos; lower threshold for short names
    acceptedAnswers: ['Abraham', 'Abram', 'Ibrahim'],
    ngramThreshold: 0.6,
  },
  {
    id: 'shared-004',
    religion: 'shared',
    category: 'grundbegrepp',
    difficulty: 1,
    type: 'true_false',
    question: 'De abrahamitiska religionerna kallas också syskonreligioner.',
    answer: 'Sant',
    funFact: 'De kallas så eftersom de har samma ursprung och delar många berättelser.',
    levelId: 'origin-2'
  },
  {
    id: 'shared-005',
    religion: 'shared',
    category: 'platser',
    difficulty: 1,
    type: 'basic',
    question: 'Vilken stad är helig för alla tre abrahamitiska religioner?',
    answer: 'Jerusalem',
    hint: 'Staden ligger i Israel',
    levelId: 'origin-2',
    // City name - fuzzy match handles typos
    acceptedAnswers: ['Jerusalem', 'Jeruzalem', 'Yerushalayim', 'Al-Quds'],
    ngramThreshold: 0.7,
  },
  {
    id: 'shared-006',
    religion: 'shared',
    category: 'grundbegrepp',
    difficulty: 2,
    type: 'multiple_choice',
    question: 'Vad har judendom, kristendom och islam gemensamt?',
    answer: 'De tror alla på en enda Gud',
    options: ['De tror alla på en enda Gud', 'De har samma heliga bok', 'De firar samma högtider', 'De har samma religiösa ledare'],
    levelId: 'origin-2'
  },
  {
    id: 'shared-007',
    religion: 'shared',
    category: 'profeter',
    difficulty: 2,
    type: 'true_false',
    question: 'Abraham är en viktig person i både judendom, kristendom och islam.',
    answer: 'Sant',
    levelId: 'origin-3'
  },
  {
    id: 'shared-008',
    religion: 'shared',
    category: 'profeter',
    difficulty: 2,
    type: 'true_false',
    question: 'Moses är bara viktig inom judendomen.',
    answer: 'Falskt',
    funFact: 'Moses nämns också i kristendomen och islam!',
    levelId: 'origin-3'
  },
];
