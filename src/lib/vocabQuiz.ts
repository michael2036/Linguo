import type { ExerciseItem, VocabularyItem } from '../types/content';
import { shuffle } from './vocabSrs';
import { normalizeTermKey } from './vocabPool';

const OPTION_COUNT = 4;

export interface VocabQuizBuild {
  items: ExerciseItem[];
  // Maps each generated item's id back to its normalized term key, so the
  // runner's per-item callback can update the right word's Leitner state.
  termKeyById: Record<string, string>;
}

// Auto-generates multiple-choice items from vocabulary pairs, alternating
// direction (DE -> native / native -> DE) so Test Mode checks true recall,
// not just recognition. Distractors are drawn from the wider selected pool,
// not just this session's queue.
export const buildVocabQuizItems = (queue: VocabularyItem[], pool: VocabularyItem[]): VocabQuizBuild => {
  const termKeyById: Record<string, string> = {};

  const items = queue.map((item, index) => {
    const askForNative = index % 2 === 0;
    const prompt = askForNative ? item.term : item.translation;
    const solution = askForNative ? item.translation : item.term;
    const distractors = shuffle(pool.filter((p) => p.term !== item.term))
      .slice(0, OPTION_COUNT - 1)
      .map((p) => (askForNative ? p.translation : p.term));
    const options = shuffle([solution, ...distractors]);
    const id = `vq-${index}-${normalizeTermKey(item.term).replace(/\s+/g, '-')}`;
    termKeyById[id] = normalizeTermKey(item.term);

    return {
      id,
      type: 'multiple-choice',
      instruction: askForNative ? 'Wähle die richtige Übersetzung.' : 'Wähle den richtigen deutschen Begriff.',
      prompt,
      options,
      solution,
      explanation: item.example,
    } satisfies ExerciseItem;
  });

  return { items, termKeyById };
};
