import { Card } from '@/types/card';

export const comparisonCards: Card[] = [
  // Comparison level 1: Similarities
  {
    id: 'cmp-001',
    religion: 'shared',
    category: 'jamforelse',
    difficulty: 2,
    type: 'multiple_choice',
    question: 'Vad har judendom, kristendom och islam gemensamt?',
    answer: 'Alla tror på en enda Gud (monoteism)',
    options: ['Alla tror på en enda Gud (monoteism)', 'Alla har samma heliga bok', 'Alla firar jul', 'Alla har samma religiösa ledare'],
    levelId: 'comparison-1'
  },
  {
    id: 'cmp-002',
    religion: 'shared',
    category: 'jamforelse',
    difficulty: 2,
    type: 'true_false',
    question: 'Abraham är en viktig person i alla tre abrahamitiska religioner.',
    answer: 'Sant',
    levelId: 'comparison-1'
  },
  {
    id: 'cmp-003',
    religion: 'shared',
    category: 'jamforelse',
    difficulty: 2,
    type: 'true_false',
    question: 'Jerusalem är en helig stad i alla tre abrahamitiska religioner.',
    answer: 'Sant',
    levelId: 'comparison-1'
  },
  {
    id: 'cmp-004',
    religion: 'shared',
    category: 'jamforelse',
    difficulty: 2,
    type: 'multiple_choice',
    question: 'Vilken person är profet i både judendom, kristendom och islam?',
    answer: 'Mose',
    options: ['Mose', 'Muhammed', 'Påven', 'Buddha'],
    levelId: 'comparison-1'
  },

  // Comparison level 2: Holy books
  {
    id: 'cmp-005',
    religion: 'shared',
    category: 'jamforelse',
    difficulty: 2,
    type: 'basic',
    question: 'Vad heter den heliga boken inom judendom?',
    answer: 'Tanach',
    levelId: 'comparison-2'
  },
  {
    id: 'cmp-006',
    religion: 'shared',
    category: 'jamforelse',
    difficulty: 2,
    type: 'basic',
    question: 'Vad heter den heliga boken inom kristendom?',
    answer: 'Bibeln',
    levelId: 'comparison-2'
  },
  {
    id: 'cmp-007',
    religion: 'shared',
    category: 'jamforelse',
    difficulty: 2,
    type: 'basic',
    question: 'Vad heter den heliga boken inom islam?',
    answer: 'Koranen',
    levelId: 'comparison-2'
  },
  {
    id: 'cmp-008',
    religion: 'shared',
    category: 'jamforelse',
    difficulty: 2,
    type: 'true_false',
    question: 'Gamla testamentet och Tanach innehåller samma texter.',
    answer: 'Sant',
    levelId: 'comparison-2'
  },

  // Comparison level 3: Religious leaders and places
  {
    id: 'cmp-009',
    religion: 'shared',
    category: 'jamforelse',
    difficulty: 2,
    type: 'basic',
    question: 'Vad kallas den religiösa ledaren inom judendom?',
    answer: 'Rabbin',
    levelId: 'comparison-3'
  },
  {
    id: 'cmp-010',
    religion: 'shared',
    category: 'jamforelse',
    difficulty: 2,
    type: 'basic',
    question: 'Vad kallas den religiösa ledaren inom kristendom?',
    answer: 'Präst',
    levelId: 'comparison-3'
  },
  {
    id: 'cmp-011',
    religion: 'shared',
    category: 'jamforelse',
    difficulty: 2,
    type: 'basic',
    question: 'Vad kallas den religiösa ledaren inom islam?',
    answer: 'Imam',
    levelId: 'comparison-3'
  },
  {
    id: 'cmp-012',
    religion: 'shared',
    category: 'jamforelse',
    difficulty: 2,
    type: 'multiple_choice',
    question: 'Para ihop rätt: Synagoga hör till vilken religion?',
    answer: 'Judendom',
    options: ['Judendom', 'Kristendom', 'Islam', 'Alla tre'],
    levelId: 'comparison-3'
  },
  {
    id: 'cmp-013',
    religion: 'shared',
    category: 'jamforelse',
    difficulty: 2,
    type: 'multiple_choice',
    question: 'Para ihop rätt: Moské hör till vilken religion?',
    answer: 'Islam',
    options: ['Islam', 'Kristendom', 'Judendom', 'Alla tre'],
    levelId: 'comparison-3'
  },
  {
    id: 'cmp-014',
    religion: 'shared',
    category: 'jamforelse',
    difficulty: 2,
    type: 'multiple_choice',
    question: 'Para ihop rätt: Kyrka hör till vilken religion?',
    answer: 'Kristendom',
    options: ['Kristendom', 'Islam', 'Judendom', 'Alla tre'],
    levelId: 'comparison-3'
  },

  // Comparison level 4: Differences
  {
    id: 'cmp-015',
    religion: 'shared',
    category: 'jamforelse',
    difficulty: 2,
    type: 'multiple_choice',
    question: 'Vilken religion tror att Jesus är Guds son?',
    answer: 'Kristendom',
    options: ['Kristendom', 'Judendom', 'Islam', 'Alla tre'],
    levelId: 'comparison-4'
  },
  {
    id: 'cmp-016',
    religion: 'shared',
    category: 'jamforelse',
    difficulty: 2,
    type: 'multiple_choice',
    question: 'Vilken religion väntar fortfarande på Messias?',
    answer: 'Judendom',
    options: ['Judendom', 'Kristendom', 'Islam', 'Ingen av dem'],
    levelId: 'comparison-4'
  },
  {
    id: 'cmp-017',
    religion: 'shared',
    category: 'jamforelse',
    difficulty: 2,
    type: 'true_false',
    question: 'Treenigheten finns bara i kristendomen, inte i judendom eller islam.',
    answer: 'Sant',
    levelId: 'comparison-4'
  },
  {
    id: 'cmp-018',
    religion: 'shared',
    category: 'jamforelse',
    difficulty: 3,
    type: 'multiple_choice',
    question: 'Vilken är den största skillnaden mellan hur kristna och muslimer ser på Jesus?',
    answer: 'Kristna tror Jesus är Guds son, muslimer tror han är en profet',
    options: ['Kristna tror Jesus är Guds son, muslimer tror han är en profet', 'Muslimer tror inte Jesus fanns', 'Kristna tror inte Jesus var viktig', 'Det finns ingen skillnad'],
    levelId: 'comparison-4'
  },

  // Comparison level 5: Food rules and holidays
  {
    id: 'cmp-019',
    religion: 'shared',
    category: 'jamforelse',
    difficulty: 2,
    type: 'multiple_choice',
    question: 'Vilka religioner förbjuder griskött?',
    answer: 'Judendom och islam',
    options: ['Judendom och islam', 'Bara judendom', 'Bara islam', 'Alla tre'],
    levelId: 'comparison-5'
  },
  {
    id: 'cmp-020',
    religion: 'shared',
    category: 'jamforelse',
    difficulty: 2,
    type: 'basic',
    question: 'Vad kallas de judiska matreglerna?',
    answer: 'Kosher',
    levelId: 'comparison-5'
  },
  {
    id: 'cmp-021',
    religion: 'shared',
    category: 'jamforelse',
    difficulty: 2,
    type: 'basic',
    question: 'Vad kallas de muslimska matreglerna?',
    answer: 'Halal',
    levelId: 'comparison-5'
  },
  {
    id: 'cmp-022',
    religion: 'shared',
    category: 'jamforelse',
    difficulty: 2,
    type: 'multiple_choice',
    question: 'Vilken religion har sabbat som vilodag?',
    answer: 'Judendom',
    options: ['Judendom', 'Kristendom', 'Islam', 'Alla tre'],
    levelId: 'comparison-5'
  },
  {
    id: 'cmp-023',
    religion: 'shared',
    category: 'jamforelse',
    difficulty: 2,
    type: 'multiple_choice',
    question: 'Vilken religion har ramadan som fastemånad?',
    answer: 'Islam',
    options: ['Islam', 'Kristendom', 'Judendom', 'Alla tre'],
    levelId: 'comparison-5'
  },
  {
    id: 'cmp-024',
    religion: 'shared',
    category: 'jamforelse',
    difficulty: 2,
    type: 'multiple_choice',
    question: 'Vilken religion firar jul?',
    answer: 'Kristendom',
    options: ['Kristendom', 'Judendom', 'Islam', 'Alla tre'],
    levelId: 'comparison-5'
  },
];
