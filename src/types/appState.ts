export type ThemePreference = 'system' | 'light' | 'dark';
export type TargetLanguage = 'de';
export type NativeLanguage = 'es' | 'en';
export type ChapterStatus = 'red' | 'yellow' | 'green';
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

export interface ChapterProgressEntry {
  vocabCompleted: boolean;
  status: ChapterStatus;
  levels: {
    easy: TierScore;
    medium: TierScore;
    hard: TierScore;
  };
}

export interface AppState {
  version: 1;
  updatedAt: string;
  preferences: Preferences;
  vocabularyProgress: Record<string, VocabularyProgressEntry>;
  chapterProgress: Record<string, ChapterProgressEntry>;
}

export const emptyTierScore = (): TierScore => ({
  completed: false,
  score: 0,
  attempts: 0,
});

export const emptyChapterProgress = (): ChapterProgressEntry => ({
  vocabCompleted: false,
  status: 'red',
  levels: {
    easy: emptyTierScore(),
    medium: emptyTierScore(),
    hard: emptyTierScore(),
  },
});

export const createInitialAppState = (): AppState => ({
  version: 1,
  updatedAt: new Date(0).toISOString(),
  preferences: {
    theme: 'system',
    targetLanguage: 'de',
    nativeLanguage: 'es',
  },
  vocabularyProgress: {},
  chapterProgress: {},
});
