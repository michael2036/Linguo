export type CefrLevel = 'A1' | 'A2' | 'B1' | 'B1+' | 'B2' | 'C1';
export type PartOfSpeech = 'noun' | 'verb' | 'adjective' | 'adverb' | 'phrase';
export type Gender = 'der' | 'die' | 'das' | null;

export interface VocabularyItem {
  id: string;
  term: string;
  translation: string;
  partOfSpeech: PartOfSpeech;
  gender?: Gender;
  plural?: string;
  example: string;
}

export type ExerciseType =
  | 'multiple-choice'
  | 'fill-in-blank'
  | 'sentence-scramble'
  | 'cloze-conjugation'
  | 'targeted-transformation'
  | 'error-correction';

export interface ExerciseItem {
  id: string;
  type: ExerciseType;
  instruction: string;
  prompt: string;
  options?: string[];
  scrambleChunks?: string[];
  solution: string;
  hint?: string;
  explanation: string;
}

export interface ChapterPackage {
  chapterId: string;
  book: string;
  chapterNumber: number;
  title: string;
  targetLevel: CefrLevel;
  grammarFocus: string[];
  vocabulary: VocabularyItem[];
  exercises: {
    easy: ExerciseItem[];
    medium: ExerciseItem[];
    hard: ExerciseItem[];
  };
}

export interface ChapterSummary {
  courseId: string;
  chapterId: string;
  chapterNumber: number;
  title: string;
  targetLevel: CefrLevel;
  path: string;
}
