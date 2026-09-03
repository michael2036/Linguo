// Shared content primitives — the atoms both Practice and Test exercises are
// built from, independent of where in the curriculum hierarchy they sit.

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
