import { CardProgress, CardBucket } from '@/types/card';

// SM-2 inspired spaced repetition algorithm adapted for a 5-day learning period

export function createInitialCardProgress(cardId: string): CardProgress {
  return {
    cardId,
    bucket: 'new',
    correctStreak: 0,
    totalAttempts: 0,
    correctAttempts: 0,
    lastSeen: null,
    nextReview: null,
  };
}

export function updateCardProgress(
  progress: CardProgress,
  correct: boolean,
  responseTimeMs: number
): CardProgress {
  const now = new Date().toISOString();
  const wasQuick = responseTimeMs < 3000; // Under 3 seconds

  const updated: CardProgress = {
    ...progress,
    totalAttempts: progress.totalAttempts + 1,
    correctAttempts: correct ? progress.correctAttempts + 1 : progress.correctAttempts,
    lastSeen: now,
  };

  if (correct) {
    updated.correctStreak = progress.correctStreak + 1;

    // Move to next bucket based on streak
    // The bucket thresholds (streak ≥2 for reviewing, ≥4 for mastered)
    // already ensure sufficient practice before advancement
    updated.bucket = getNextBucket(progress.bucket, progress.correctStreak + 1);

    // Set next review based on bucket
    updated.nextReview = calculateNextReview(updated.bucket);
  } else {
    // Wrong answer - reset streak and potentially move back a bucket
    updated.correctStreak = 0;
    updated.bucket = getPreviousBucket(progress.bucket);

    // Show again soon
    updated.nextReview = calculateNextReview('learning');
  }

  return updated;
}

function getNextBucket(current: CardBucket, streak: number): CardBucket {
  switch (current) {
    case 'new':
      return 'learning';
    case 'learning':
      return streak >= 2 ? 'reviewing' : 'learning';
    case 'reviewing':
      return streak >= 4 ? 'mastered' : 'reviewing';
    case 'mastered':
      return 'mastered';
    default:
      return 'learning';
  }
}

function getPreviousBucket(current: CardBucket): CardBucket {
  switch (current) {
    case 'mastered':
      return 'reviewing';
    case 'reviewing':
      return 'learning';
    case 'learning':
      return 'learning'; // Don't go back to 'new'
    case 'new':
      return 'new';
    default:
      return 'learning';
  }
}

function calculateNextReview(bucket: CardBucket): string {
  const now = new Date();
  let hoursToAdd: number;

  switch (bucket) {
    case 'new':
      hoursToAdd = 0; // Show immediately
      break;
    case 'learning':
      hoursToAdd = 0.5; // Show in 30 minutes
      break;
    case 'reviewing':
      hoursToAdd = 4; // Show in 4 hours
      break;
    case 'mastered':
      hoursToAdd = 24; // Show tomorrow
      break;
    default:
      hoursToAdd = 0;
  }

  now.setTime(now.getTime() + hoursToAdd * 60 * 60 * 1000);
  return now.toISOString();
}

export function isDueForReview(progress: CardProgress): boolean {
  if (!progress.nextReview) return true;
  return new Date(progress.nextReview) <= new Date();
}

export function sortByPriority(cards: CardProgress[]): CardProgress[] {
  const now = new Date();

  return [...cards].sort((a, b) => {
    // Priority: new > due for review > learning > reviewing > mastered
    const bucketPriority: Record<CardBucket, number> = {
      new: 0,
      learning: 1,
      reviewing: 2,
      mastered: 3,
    };

    // First, prioritize by due status
    const aIsDue = !a.nextReview || new Date(a.nextReview) <= now;
    const bIsDue = !b.nextReview || new Date(b.nextReview) <= now;

    if (aIsDue && !bIsDue) return -1;
    if (!aIsDue && bIsDue) return 1;

    // Then by bucket priority
    const bucketDiff = bucketPriority[a.bucket] - bucketPriority[b.bucket];
    if (bucketDiff !== 0) return bucketDiff;

    // Then by when last seen (older first)
    if (a.lastSeen && b.lastSeen) {
      return new Date(a.lastSeen).getTime() - new Date(b.lastSeen).getTime();
    }

    return 0;
  });
}

export function getBucketLabel(bucket: CardBucket): string {
  switch (bucket) {
    case 'new':
      return 'Ny';
    case 'learning':
      return 'Övar';
    case 'reviewing':
      return 'Repeterar';
    case 'mastered':
      return 'Kan!';
    default:
      return 'Okänd';
  }
}

export function getBucketColor(bucket: CardBucket): string {
  switch (bucket) {
    case 'new':
      return 'gray';
    case 'learning':
      return 'yellow';
    case 'reviewing':
      return 'blue';
    case 'mastered':
      return 'green';
    default:
      return 'gray';
  }
}
