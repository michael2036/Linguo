import type { VocabWordProgress } from '../types/appState';
import { emptyVocabWordProgress } from '../types/appState';
import type { VocabularyItem } from '../types/content';

// Leitner-system spaced repetition: each correct answer promotes a word one
// box (reviewed less often afterwards), each miss demotes it one box
// (reviewed sooner). Box 5 ("mastered") is next due in 16 days.
const BOX_INTERVAL_DAYS = [0, 1, 2, 4, 8, 16];
export const MAX_BOX = BOX_INTERVAL_DAYS.length - 1;

export const applyAnswer = (
  progress: VocabWordProgress | undefined,
  correct: boolean,
  now: Date = new Date(),
): VocabWordProgress => {
  const prev = progress ?? emptyVocabWordProgress();
  const box = correct ? Math.min(MAX_BOX, prev.box + 1) : Math.max(0, prev.box - 1);
  const dueAt = new Date(now.getTime() + BOX_INTERVAL_DAYS[box] * 86_400_000).toISOString();
  return {
    box,
    seenCount: prev.seenCount + 1,
    correctCount: prev.correctCount + (correct ? 1 : 0),
    lastSeen: now.toISOString(),
    dueAt,
  };
};

export const isMastered = (progress: VocabWordProgress | undefined): boolean => (progress?.box ?? 0) >= MAX_BOX;

export const shuffle = <T,>(items: T[]): T[] => {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
};

// A word never seen before always outranks one that has been — it needs its
// first exposure. Large but finite (not Infinity) so two never-seen words
// don't produce a NaN when the sort comparator subtracts their priorities.
const NEVER_SEEN_PRIORITY = 100_000;

// Priority score for the adaptive practice queue: never-seen words first,
// then whichever known words are most overdue for review, weighted so a
// lower box (weaker word) outranks a higher one at the same overdue amount.
const priority = (progress: VocabWordProgress | undefined, nowMs: number): number => {
  if (!progress) return NEVER_SEEN_PRIORITY;
  const overdueDays = Math.max(0, (nowMs - new Date(progress.dueAt).getTime()) / 86_400_000);
  return (MAX_BOX - progress.box) * 20 + overdueDays;
};

export const pickPracticeQueue = (
  pool: VocabularyItem[],
  wordProgress: Record<string, VocabWordProgress>,
  keyOf: (item: VocabularyItem) => string,
  size: number,
): VocabularyItem[] => {
  const nowMs = Date.now();
  const ranked = [...pool].sort(
    (a, b) => priority(wordProgress[keyOf(b)], nowMs) - priority(wordProgress[keyOf(a)], nowMs),
  );
  return shuffle(ranked.slice(0, Math.min(size, ranked.length)));
};

export const pickTestQueue = (pool: VocabularyItem[], size: number): VocabularyItem[] =>
  shuffle(pool).slice(0, Math.min(size, pool.length));
