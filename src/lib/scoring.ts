import type { LektionProgressEntry, LektionStatus, Tier } from '../types/appState';

export const VOCAB_PASS_THRESHOLD = 80;
export const TIER_PASS_THRESHOLDS: Record<Tier, number> = {
  easy: 80,
  medium: 75,
  hard: 85,
};
const YELLOW_MEDIUM_THRESHOLD = 60;

// A strong Direct Test Mode result fast-tracks a Lektion to Green on its
// own, without requiring every practice tier to be cleared — that's the
// point of a diagnostic test.
export const TEST_MASTERY_THRESHOLD = 85;

export const tierPassed = (tier: Tier, score: number): boolean =>
  score >= TIER_PASS_THRESHOLDS[tier];

export const vocabPassed = (recognitionRate: number): boolean =>
  recognitionRate >= VOCAB_PASS_THRESHOLD;

export const computeLektionStatus = (entry: LektionProgressEntry): LektionStatus => {
  const { easy, medium, hard } = entry.practice;

  const practiceMastered =
    entry.vocabCompleted &&
    easy.completed &&
    medium.completed &&
    hard.completed &&
    tierPassed('easy', easy.score) &&
    tierPassed('medium', medium.score) &&
    tierPassed('hard', hard.score);

  const testMastered = entry.test.attempted && entry.test.bestScore >= TEST_MASTERY_THRESHOLD;

  if (practiceMastered || testMastered) {
    return 'green';
  }

  const practiceInProgress =
    entry.vocabCompleted &&
    easy.completed &&
    tierPassed('easy', easy.score) &&
    medium.completed &&
    medium.score >= YELLOW_MEDIUM_THRESHOLD;

  if (practiceInProgress || entry.test.attempted) {
    return 'yellow';
  }

  return 'red';
};

// Navigation is intentionally open: vocab, all three practice tiers, and
// Test are all reachable at any time (see AGENTS.md's "no gating" note) —
// this file only computes *mastery* (green/yellow/red), never access.
