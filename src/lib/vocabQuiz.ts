import type { ExerciseItem, VocabularyItem } from '../types/content';
import { shuffle } from './vocabSrs';
import { normalizeTermKey } from './vocabPool';

const OPTION_COUNT = 4;
const ARTICLES = ['der', 'die', 'das'];

export interface VocabQuizBuild {
  items: ExerciseItem[];
  // Maps each generated item's id back to its normalized term key, so the
  // runner's per-item callback can update the right word's Leitner state.
  termKeyById: Record<string, string>;
}

// One word's linguistic profile can support several distinct grammatical
// checks (article, plural, Präteritum, Partizip II, auxiliary) beyond plain
// translation recall. Testing all of them every time a word comes up would
// balloon session length, so this picks at most one at random per word —
// across repeated sessions a word still gets covered from every angle.
const buildGrammarCandidates = (item: VocabularyItem, idBase: string): ExerciseItem[] => {
  const candidates: ExerciseItem[] = [];

  // Vocabulary `term`s for nouns already include their article (e.g. "das
  // Vertrauen", "der Macher" — see the worked reference in .agents/), so
  // the gender-quiz prompt strips it back off rather than asking "___ das
  // Vertrauen", and the plural prompt reuses `term` as-is instead of
  // re-prepending the article.
  if (item.partOfSpeech === 'noun' && item.gender) {
    const bareNoun = item.gender ? item.term.replace(new RegExp(`^${item.gender}\\s+`), '') : item.term;
    candidates.push({
      id: `${idBase}-gender`,
      type: 'multiple-choice',
      instruction: 'Wähle den richtigen Artikel.',
      prompt: `___ ${bareNoun}`,
      options: shuffle(ARTICLES),
      solution: item.gender,
      explanation: item.example,
    });
  }
  if (item.partOfSpeech === 'noun' && item.plural) {
    candidates.push({
      id: `${idBase}-plural`,
      type: 'fill-in-blank',
      instruction: 'Wie lautet der Plural?',
      prompt: item.term,
      solution: item.plural,
      explanation: item.example,
    });
  }
  if (item.partOfSpeech === 'verb' && item.preterite) {
    candidates.push({
      id: `${idBase}-preterite`,
      type: 'fill-in-blank',
      instruction: `Wie lautet das Präteritum (er/sie/es-Form) von "${item.term}"?`,
      prompt: item.term,
      solution: item.preterite,
      explanation: item.example,
    });
  }
  if (item.partOfSpeech === 'verb' && item.participle && item.auxiliary) {
    candidates.push({
      id: `${idBase}-participle`,
      type: 'fill-in-blank',
      instruction: `Wie lautet das Partizip II von "${item.term}"? (mit Hilfsverb, z. B. "hat gemacht")`,
      prompt: item.term,
      solution: `${item.auxiliary === 'sein' ? 'ist' : 'hat'} ${item.participle}`,
      explanation: item.example,
    });
  }
  if (item.partOfSpeech === 'verb' && item.auxiliary) {
    candidates.push({
      id: `${idBase}-auxiliary`,
      type: 'multiple-choice',
      instruction: 'Welches Hilfsverb bildet das Perfekt?',
      prompt: item.term,
      options: ['haben', 'sein'],
      solution: item.auxiliary,
      explanation: item.example,
    });
  }

  return candidates;
};

// Auto-generates quiz items from vocabulary entries. Every queued word gets
// a translation multiple-choice item, alternating direction (DE -> native /
// native -> DE) so Test Mode checks true recall, not just recognition —
// distractors are drawn from the wider selected pool, not just this
// session's queue. Words with a fuller linguistic profile (gender, plural,
// verb principal parts) also get one extra grammatical item at random.
export const buildVocabQuizItems = (queue: VocabularyItem[], pool: VocabularyItem[]): VocabQuizBuild => {
  const termKeyById: Record<string, string> = {};
  const items: ExerciseItem[] = [];

  queue.forEach((item, index) => {
    const key = normalizeTermKey(item.term);
    const idBase = `vq-${index}-${key.replace(/\s+/g, '-')}`;
    const askForNative = index % 2 === 0;
    const prompt = askForNative ? item.term : item.translation;
    const solution = askForNative ? item.translation : item.term;
    const distractors = shuffle(pool.filter((p) => p.term !== item.term))
      .slice(0, OPTION_COUNT - 1)
      .map((p) => (askForNative ? p.translation : p.term));
    const options = shuffle([solution, ...distractors]);
    const translationId = `${idBase}-translate`;

    termKeyById[translationId] = key;
    items.push({
      id: translationId,
      type: 'multiple-choice',
      instruction: askForNative ? 'Wähle die richtige Übersetzung.' : 'Wähle den richtigen deutschen Begriff.',
      prompt,
      options,
      solution,
      explanation: item.example,
    });

    const grammarCandidates = buildGrammarCandidates(item, idBase);
    if (grammarCandidates.length > 0) {
      const chosen = shuffle(grammarCandidates)[0];
      termKeyById[chosen.id] = key;
      items.push(chosen);
    }
  });

  return { items: shuffle(items), termKeyById };
};
