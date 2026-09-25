import type { ExerciseItem } from '../types/content';
import type { VocabWordProgress } from '../types/appState';
import {
  PERSON_LABEL,
  PERSONS,
  TENSE_LABEL,
  conjugate,
  describeVerb,
  hasClearStrength,
  hasFixedAuxiliary,
  principalParts,
  typicalMistakes,
  type Person,
  type Tense,
  type Verb,
  type VerbCategory,
} from './verbConjugation';
import { isMastered, shuffle } from './vocabSrs';

// A "skill" is one learnable facet of a verb. Each verb × skill pair has
// its own Leitner box, so a learner can have "fahren" solid in Präsens but
// still be reviewing its Perfekt.
export type VerbSkill = Tense | 'stammformen';
export const VERB_SKILLS: VerbSkill[] = ['praesens', 'praeteritum', 'perfekt', 'stammformen'];
export const SKILL_LABEL: Record<VerbSkill, string> = { ...TENSE_LABEL, stammformen: 'Stammformen' };

export type VerbFilter = 'all' | VerbCategory;

export const skillKey = (verb: Verb, skill: VerbSkill): string => `${verb.key}::${skill}`;

export interface VerbUnit {
  verb: Verb;
  skill: VerbSkill;
  key: string;
}

export const filterVerbs = (pool: Verb[], filter: VerbFilter): Verb[] =>
  filter === 'all' ? pool : pool.filter((v) => v.categories.includes(filter));

export const buildUnits = (verbs: Verb[], skills: VerbSkill[]): VerbUnit[] =>
  verbs.flatMap((verb) => skills.map((skill) => ({ verb, skill, key: skillKey(verb, skill) })));

export const isVerbMastered = (verb: Verb, skills: VerbSkill[], progress: Record<string, VocabWordProgress>): boolean =>
  skills.every((skill) => isMastered(progress[skillKey(verb, skill)]));

const pick = <T,>(items: T[]): T => items[Math.floor(Math.random() * items.length)];

// Concrete subject shown in the prompt. Bare "sie" is never used — it's
// ambiguous between 3rd-singular and plural, which take different forms.
// 3rd-person-only verbs ("es regnet", "es lohnt sich") always get "es".
const subjectFor = (verb: Verb, person: Person): string => {
  if (person === 'er') return verb.persons.length < PERSONS.length ? 'es' : pick(['er', 'man']);
  if (person === 'sie') return verb.persons.length < PERSONS.length ? 'sie (Plural)' : pick(['sie (Plural)', 'Sie']);
  return person;
};

const tenseRow = (verb: Verb, tense: Tense): string => {
  const forms = conjugate(verb, tense);
  return verb.persons.map((p) => `${PERSON_LABEL[p]} ${forms[PERSONS.indexOf(p)]}`).join(' · ');
};

const TENSE_INSTRUCTION: Record<Tense, string> = {
  praesens: 'Konjugiere im Präsens.',
  praeteritum: 'Konjugiere im Präteritum.',
  perfekt: 'Bilde das Perfekt (Hilfsverb + Partizip II).',
};

const fullFormNote = (verb: Verb): string =>
  verb.prefix || verb.reflexive ? ' Schreibe die vollständige Form, inklusive Vorsilbe bzw. Reflexivpronomen.' : '';

const buildTenseItem = (verb: Verb, tense: Tense, id: string, withHint: boolean): ExerciseItem => {
  const person = pick(verb.persons);
  const forms = conjugate(verb, tense);
  const solution = forms[PERSONS.indexOf(person)];
  const prompt = `${subjectFor(verb, person)} ___ (${verb.term})`;
  const explanation = `${TENSE_LABEL[tense]} von „${verb.term}“: ${tenseRow(verb, tense)}.`;
  const hint = withHint ? describeVerb(verb) : undefined;

  if (Math.random() < 0.5) {
    // Typical learner mistakes first (so the item tests the actual rule),
    // then other persons' forms of the same tense as filler.
    const candidates = [...typicalMistakes(verb, tense, person), ...shuffle(forms)];
    const distractors = [...new Set(candidates.filter((c) => c !== solution))].slice(0, 3);
    if (distractors.length >= 2) {
      return {
        id,
        type: 'multiple-choice',
        instruction: TENSE_INSTRUCTION[tense],
        prompt,
        options: shuffle([solution, ...distractors]),
        solution,
        hint,
        explanation,
      };
    }
  }
  return {
    id,
    type: 'cloze-conjugation',
    instruction: TENSE_INSTRUCTION[tense] + fullFormNote(verb),
    prompt,
    solution,
    hint,
    explanation,
  };
};

const buildStammformenItem = (verb: Verb, id: string, withHint: boolean): ExerciseItem => {
  const explanation = `Stammformen: ${principalParts(verb)}${verb.irregular ? ' (unregelmäßig)' : ' (regelmäßig)'}.`;
  const hint = withHint ? describeVerb(verb) : undefined;
  const er = PERSONS.indexOf('er');
  // Variants with no single defensible answer for this verb are skipped
  // (e.g. "haben oder sein?" for schwimmen, "regelmäßig?" for hängen).
  const variants: ('preterite' | 'perfect' | 'auxiliary' | 'regularity')[] = ['preterite', 'perfect'];
  if (hasFixedAuxiliary(verb)) variants.push('auxiliary');
  if (hasClearStrength(verb)) variants.push('regularity');
  const variant = pick(variants);

  switch (variant) {
    case 'preterite':
      return {
        id,
        type: 'fill-in-blank',
        instruction: 'Wie lautet das Präteritum (er/sie/es-Form)?' + fullFormNote(verb),
        prompt: verb.term,
        solution: conjugate(verb, 'praeteritum')[er],
        hint,
        explanation,
      };
    case 'perfect':
      return {
        id,
        type: 'fill-in-blank',
        instruction: 'Wie lautet das Perfekt (er/sie/es-Form)? Mit Hilfsverb, z. B. „hat gemacht“.',
        prompt: verb.term,
        solution: conjugate(verb, 'perfekt')[er],
        hint,
        explanation,
      };
    case 'auxiliary':
      return {
        id,
        type: 'multiple-choice',
        instruction: 'Welches Hilfsverb bildet das Perfekt?',
        prompt: verb.term,
        options: ['haben', 'sein'],
        solution: verb.auxiliary,
        hint: withHint ? 'Bewegung von A nach B oder Zustandsänderung → meistens „sein“.' : undefined,
        explanation,
      };
    case 'regularity':
      return {
        id,
        type: 'multiple-choice',
        instruction: 'Ist dieses Verb regelmäßig oder unregelmäßig?',
        prompt: verb.term,
        options: ['regelmäßig', 'unregelmäßig'],
        solution: verb.irregular ? 'unregelmäßig' : 'regelmäßig',
        hint: withHint ? 'Unregelmäßige Verben ändern im Präteritum oder Partizip II den Stammvokal.' : undefined,
        explanation,
      };
  }
};

export interface VerbQuizBuild {
  items: ExerciseItem[];
  // Exercise id -> skill key, so each graded answer updates the right box.
  keyById: Record<string, string>;
}

export const buildVerbQuizItems = (units: VerbUnit[], withHints: boolean): VerbQuizBuild => {
  const keyById: Record<string, string> = {};
  const items = units.map((unit, index) => {
    const id = `vt-${index}-${unit.key.replace(/[^a-zäöüß]+/g, '-')}`;
    keyById[id] = unit.key;
    return unit.skill === 'stammformen'
      ? buildStammformenItem(unit.verb, id, withHints)
      : buildTenseItem(unit.verb, unit.skill, id, withHints);
  });
  return { items, keyById };
};
