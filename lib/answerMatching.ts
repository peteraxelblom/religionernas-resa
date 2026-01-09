/**
 * Smart answer matching for flashcards
 *
 * Provides fuzzy matching and concept-based validation without AI API calls.
 * Works client-side with zero cost per request.
 */

/**
 * Grading rules for a card. Cards can define multiple ways to validate answers.
 */
export interface GradingRule {
  /** List of accepted answer phrasings */
  accepted?: string[];
  /** Minimum n-gram similarity threshold (0-1, default 0.75) */
  ngramThreshold?: number;
  /**
   * Concept groups - answer must match at least one pattern from each group.
   * Each group is an array of regex patterns (as strings).
   * Example: [['tro', 'finns', 'existerar'], ['en', 'enda', 'bara'], ['gud']]
   */
  conceptGroups?: string[][];
}

/**
 * Normalize text for comparison.
 * - Lowercase
 * - Trim whitespace
 * - Remove punctuation (preserving Swedish characters)
 * - Convert digit '1' to 'en'
 * - Collapse multiple spaces
 */
export function normalize(s: string): string {
  return s
    .toLowerCase()
    .replace(/[''""`´]/g, '')           // Remove quotes
    .replace(/\b1\b/g, ' en ')          // 1 → en (Swedish "one")
    .replace(/[^\p{L}\p{N}\s]/gu, ' ')  // Keep letters/numbers (åäö preserved)
    .replace(/\s+/g, ' ')               // Collapse whitespace
    .trim();
}

/**
 * Generate character n-grams from a string.
 * Pads with spaces for better edge matching.
 */
export function charNgrams(s: string, n: number = 3): Map<string, number> {
  const padded = ` ${s} `;
  const grams = new Map<string, number>();

  for (let i = 0; i <= padded.length - n; i++) {
    const gram = padded.slice(i, i + n);
    grams.set(gram, (grams.get(gram) ?? 0) + 1);
  }

  return grams;
}

/**
 * Calculate cosine similarity between two n-gram vectors.
 * Returns a value between 0 (no similarity) and 1 (identical).
 */
export function cosineSimilarity(a: Map<string, number>, b: Map<string, number>): number {
  let dot = 0;
  let normA = 0;
  let normB = 0;

  for (const [, v] of a) normA += v * v;
  for (const [, v] of b) normB += v * v;
  for (const [k, v] of a) dot += v * (b.get(k) ?? 0);

  const denominator = Math.sqrt(normA) * Math.sqrt(normB);
  if (denominator === 0) return 0;

  return dot / denominator;
}

/**
 * Check if normalized answer matches all concept groups.
 * Each group must have at least one matching pattern.
 */
export function matchesConceptGroups(normalizedAnswer: string, groups: string[][]): boolean {
  return groups.every(group =>
    group.some(pattern => {
      try {
        const regex = new RegExp(`\\b${pattern}\\b`, 'iu');
        return regex.test(normalizedAnswer);
      } catch {
        // If regex is invalid, try simple includes
        return normalizedAnswer.includes(pattern.toLowerCase());
      }
    })
  );
}

/**
 * Calculate n-gram similarity between user input and a target answer.
 */
export function ngramSimilarity(userInput: string, targetAnswer: string): number {
  const normalizedUser = normalize(userInput);
  const normalizedTarget = normalize(targetAnswer);

  if (!normalizedUser || !normalizedTarget) return 0;

  const userGrams = charNgrams(normalizedUser, 3);
  const targetGrams = charNgrams(normalizedTarget, 3);

  return cosineSimilarity(userGrams, targetGrams);
}

/**
 * Main answer checking function.
 *
 * Checks in order:
 * 1. Exact match (after normalization)
 * 2. Concept groups (if defined)
 * 3. N-gram fuzzy match against accepted answers
 *
 * @param userInput - The user's answer
 * @param correctAnswer - The canonical correct answer
 * @param rule - Optional grading rules for more flexible matching
 * @returns true if the answer should be accepted
 */
export function isCorrect(
  userInput: string,
  correctAnswer: string,
  rule?: GradingRule
): boolean {
  const normalizedUser = normalize(userInput);
  const normalizedCorrect = normalize(correctAnswer);

  // Empty input is always wrong
  if (!normalizedUser) return false;

  // 1. Exact match (most common case)
  if (normalizedUser === normalizedCorrect) return true;

  // If no grading rule, fall back to simple substring check
  if (!rule) {
    // Check if user's answer is a substantial part of the correct answer
    if (normalizedCorrect.includes(normalizedUser) && normalizedUser.length > 3) {
      return true;
    }
    return false;
  }

  // 2. Concept groups check (catches paraphrases)
  if (rule.conceptGroups && rule.conceptGroups.length > 0) {
    if (matchesConceptGroups(normalizedUser, rule.conceptGroups)) {
      return true;
    }
  }

  // 3. N-gram fuzzy match against accepted answers
  const threshold = rule.ngramThreshold ?? 0.75;
  const acceptedAnswers = rule.accepted ?? [correctAnswer];

  // Also check against the canonical correct answer
  const allAnswers = acceptedAnswers.includes(correctAnswer)
    ? acceptedAnswers
    : [correctAnswer, ...acceptedAnswers];

  for (const accepted of allAnswers) {
    const similarity = ngramSimilarity(normalizedUser, accepted);
    if (similarity >= threshold) {
      return true;
    }
  }

  return false;
}

/**
 * Get match details for debugging/feedback purposes.
 * Returns information about why an answer was accepted or rejected.
 */
export function getMatchDetails(
  userInput: string,
  correctAnswer: string,
  rule?: GradingRule
): {
  isCorrect: boolean;
  matchType: 'exact' | 'concept' | 'fuzzy' | 'substring' | 'none';
  similarity?: number;
  matchedAnswer?: string;
} {
  const normalizedUser = normalize(userInput);
  const normalizedCorrect = normalize(correctAnswer);

  if (!normalizedUser) {
    return { isCorrect: false, matchType: 'none' };
  }

  // Exact match
  if (normalizedUser === normalizedCorrect) {
    return { isCorrect: true, matchType: 'exact', similarity: 1.0 };
  }

  if (!rule) {
    if (normalizedCorrect.includes(normalizedUser) && normalizedUser.length > 3) {
      return { isCorrect: true, matchType: 'substring' };
    }
    return { isCorrect: false, matchType: 'none' };
  }

  // Concept match
  if (rule.conceptGroups && rule.conceptGroups.length > 0) {
    if (matchesConceptGroups(normalizedUser, rule.conceptGroups)) {
      return { isCorrect: true, matchType: 'concept' };
    }
  }

  // Fuzzy match
  const threshold = rule.ngramThreshold ?? 0.75;
  const acceptedAnswers = rule.accepted ?? [correctAnswer];
  const allAnswers = acceptedAnswers.includes(correctAnswer)
    ? acceptedAnswers
    : [correctAnswer, ...acceptedAnswers];

  let bestSimilarity = 0;
  let bestMatch = '';

  for (const accepted of allAnswers) {
    const similarity = ngramSimilarity(normalizedUser, accepted);
    if (similarity > bestSimilarity) {
      bestSimilarity = similarity;
      bestMatch = accepted;
    }
  }

  if (bestSimilarity >= threshold) {
    return {
      isCorrect: true,
      matchType: 'fuzzy',
      similarity: bestSimilarity,
      matchedAnswer: bestMatch
    };
  }

  return {
    isCorrect: false,
    matchType: 'none',
    similarity: bestSimilarity
  };
}
