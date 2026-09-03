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

export interface AppState {
  version: 2;
  updatedAt: string;
  preferences: Preferences;
  vocabularyProgress: Record<string, VocabularyProgressEntry>;
  lektionProgress: Record<string, LektionProgressEntry>;
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
});
