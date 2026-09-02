import type { ChapterProgressEntry, ChapterStatus, Tier } from '../types/appState';

export const VOCAB_PASS_THRESHOLD = 80;
export const TIER_PASS_THRESHOLDS: Record<Tier, number> = {
  easy: 80,
  medium: 75,
  hard: 85,
};
const YELLOW_MEDIUM_THRESHOLD = 60;

export const tierPassed = (tier: Tier, score: number): boolean =>
  score >= TIER_PASS_THRESHOLDS[tier];

export const vocabPassed = (recognitionRate: number): boolean =>
  recognitionRate >= VOCAB_PASS_THRESHOLD;

export const computeChapterStatus = (entry: ChapterProgressEntry): ChapterStatus => {
  const { easy, medium, hard } = entry.levels;

  if (!entry.vocabCompleted) {
    return 'red';
  }

  const mastered =
    easy.completed &&
    medium.completed &&
    hard.completed &&
    tierPassed('easy', easy.score) &&
    tierPassed('medium', medium.score) &&
    tierPassed('hard', hard.score);

  if (mastered) {
    return 'green';
  }

  const inProgress =
    entry.vocabCompleted &&
    easy.completed &&
    tierPassed('easy', easy.score) &&
    medium.completed &&
    medium.score >= YELLOW_MEDIUM_THRESHOLD;

  return inProgress ? 'yellow' : 'red';
};

export const isTierUnlocked = (entry: ChapterProgressEntry, tier: Tier): boolean => {
  if (!entry.vocabCompleted) return false;
  if (tier === 'easy') return true;
  if (tier === 'medium') return entry.levels.easy.completed && tierPassed('easy', entry.levels.easy.score);
  return entry.levels.medium.completed && tierPassed('medium', entry.levels.medium.score);
};
