import type { LektionProgressEntry } from '../types/appState';
import { TEST_MASTERY_THRESHOLD } from './scoring';

// A purely presentational read of the existing LektionProgressEntry —
// no changes to computeLektionStatus or any grading in scoring.ts. This
// only reinterprets already-computed progress into UI-friendly buckets so
// the dashboard can stop showing red on content nobody has touched yet.
export type DisplayStatus = 'unattempted' | 'in-progress' | 'completed' | 'needs-review';

// Below this representative score, a *mastered* Lektion still gets a soft
// "quick review" nudge from Linguo instead of a plain green checkmark.
// Never affects whether the Lektion actually counts as mastered.
export const NEEDS_REVIEW_SCORE_THRESHOLD = 80;

export const hasLektionEngagement = (entry: LektionProgressEntry): boolean =>
  entry.vocabCompleted ||
  entry.practice.easy.attempts > 0 ||
  entry.practice.medium.attempts > 0 ||
  entry.practice.hard.attempts > 0 ||
  entry.test.attempted;

// The score that actually earned a "green" status: the test score if that's
// what fast-tracked mastery, otherwise the average across completed
// practice tiers. Used only to decide the review nudge above.
const masteryScore = (entry: LektionProgressEntry): number => {
  if (entry.test.attempted && entry.test.bestScore >= TEST_MASTERY_THRESHOLD) {
    return entry.test.bestScore;
  }
  const tierScores = [entry.practice.easy, entry.practice.medium, entry.practice.hard]
    .filter((t) => t.completed)
    .map((t) => t.score);
  if (tierScores.length === 0) return 100;
  return tierScores.reduce((sum, s) => sum + s, 0) / tierScores.length;
};

export const getDisplayStatus = (entry: LektionProgressEntry): DisplayStatus => {
  if (entry.status === 'green') {
    return masteryScore(entry) < NEEDS_REVIEW_SCORE_THRESHOLD ? 'needs-review' : 'completed';
  }
  return hasLektionEngagement(entry) ? 'in-progress' : 'unattempted';
};
