export type ThemePreference = 'system' | 'light' | 'dark';
export type TargetLanguage = 'de';
export type NativeLanguage = 'es' | 'en';
export type LektionStatus = 'red' | 'yellow' | 'green';
export type Tier = 'easy' | 'medium' | 'hard';

export interface Preferences {
  theme: ThemePreference;
  targetLanguage: TargetLanguage;
  nativeLanguage: NativeLanguage;
}

export interface VocabularyProgressEntry {
  repetitions: number;
  lastReviewed: string;
  mastered: boolean;
}

export interface TierScore {
  completed: boolean;
  score: number;
  attempts: number;
}

// Direct Test Mode is deliberately decoupled from `practice` — it's never
// gated by it, and tracked separately so a strong test score can fast-track
// a Lektion to Green without requiring every practice tier to be cleared.
export interface TestScore {
  attempted: boolean;
  bestScore: number;
  attempts: number;
}

export interface LektionProgressEntry {
  vocabCompleted: boolean;
  status: LektionStatus;
  practice: {
    easy: TierScore;
    medium: TierScore;
    hard: TierScore;
  };
  test: TestScore;
}

// Per-word Leitner-box state for the Wortschatz-Trainer (see lib/vocabSrs.ts).
// Keyed by normalized term (lib/vocabPool.ts) rather than the vocabulary
// item's own `id`, since those ids are only unique within a single Lektion
// and collide across Lektionen/Levels (e.g. every Lektion 1 starts its
// vocab ids back at "l1v01").
export interface VocabWordProgress {
  box: number;
  seenCount: number;
  correctCount: number;
  lastSeen: string;
  dueAt: string;
}

export interface VocabTrainerState {
  words: Record<string, VocabWordProgress>;
  xp: number;
  bestSessionStreak: number;
  sessionsCompleted: number;
  lastPracticeDate: string | null;
  dailyStreak: number;
}

export interface AppState {
  version: 2;
  updatedAt: string;
  preferences: Preferences;
  vocabularyProgress: Record<string, VocabularyProgressEntry>;
  lektionProgress: Record<string, LektionProgressEntry>;
  vocabTrainer: VocabTrainerState;
}

export const emptyTierScore = (): TierScore => ({
  completed: false,
  score: 0,
  attempts: 0,
});

export const emptyTestScore = (): TestScore => ({
  attempted: false,
  bestScore: 0,
  attempts: 0,
});

export const emptyLektionProgress = (): LektionProgressEntry => ({
  vocabCompleted: false,
  status: 'red',
  practice: {
    easy: emptyTierScore(),
    medium: emptyTierScore(),
    hard: emptyTierScore(),
  },
  test: emptyTestScore(),
});

export const emptyVocabWordProgress = (): VocabWordProgress => ({
  box: 0,
  seenCount: 0,
  correctCount: 0,
  lastSeen: new Date(0).toISOString(),
  dueAt: new Date(0).toISOString(),
});

export const emptyVocabTrainerState = (): VocabTrainerState => ({
  words: {},
  xp: 0,
  bestSessionStreak: 0,
  sessionsCompleted: 0,
  lastPracticeDate: null,
  dailyStreak: 0,
});

export const createInitialAppState = (): AppState => ({
  version: 2,
  updatedAt: new Date(0).toISOString(),
  preferences: {
    theme: 'system',
    targetLanguage: 'de',
    nativeLanguage: 'es',
  },
  vocabularyProgress: {},
  lektionProgress: {},
  vocabTrainer: emptyVocabTrainerState(),
});
