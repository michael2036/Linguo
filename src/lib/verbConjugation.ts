import type { VocabularyItem } from '../types/content';

// Pure German conjugation engine for the Verben-Trainer. Curriculum content
// only stores a verb's principal parts (infinitive, 3rd-person Präteritum,
// Partizip II, auxiliary) — everything else is derived here by rule, with
// small override tables for the genuinely irregular parts: fully irregular
// presents (sein, haben, modals, …) and present-tense stem-vowel changes
// (fahren → fährt). Präteritum person endings are fully predictable from
// the stored 3rd-person form, so no override is needed there.

export type Person = 'ich' | 'du' | 'er' | 'wir' | 'ihr' | 'sie';
export const PERSONS: Person[] = ['ich', 'du', 'er', 'wir', 'ihr', 'sie'];

// "sie" alone would be ambiguous (3rd-singular vs. plural take different
// forms), so 3rd-singular is always shown as "er/sie/es" and the plural
// with its formal twin, which shares the same form.
export const PERSON_LABEL: Record<Person, string> = {
  ich: 'ich',
  du: 'du',
  er: 'er/sie/es',
  wir: 'wir',
  ihr: 'ihr',
  sie: 'sie/Sie',
};

export type Tense = 'praesens' | 'praeteritum' | 'perfekt';
export const TENSE_LABEL: Record<Tense, string> = {
  praesens: 'Präsens',
  praeteritum: 'Präteritum',
  perfekt: 'Perfekt',
};

export type VerbCategory = 'regular' | 'irregular' | 'separable' | 'reflexive' | 'modal';
export const CATEGORY_LABEL: Record<VerbCategory, string> = {
  regular: 'Regelmäßig',
  irregular: 'Unregelmäßig',
  separable: 'Trennbar',
  reflexive: 'Reflexiv',
  modal: 'Modalverb',
};

export interface Verb {
  // Stable identity for progress tracking, e.g. "sich vorstellen".
  key: string;
  // Display form, e.g. "sich vorstellen".
  term: string;
  // Infinitive without "sich", e.g. "vorstellen".
  infinitive: string;
  // Separable prefix ("vor"), or '' for non-separable verbs.
  prefix: string;
  // Infinitive without the separable prefix ("stellen").
  base: string;
  reflexive: 'acc' | 'dat' | null;
  // 3rd-person Präteritum stem without prefix/"sich" ("stellte").
  preteriteStem: string;
  // Partizip II without "sich" ("vorgestellt").
  participle: string;
  auxiliary: 'haben' | 'sein';
  irregular: boolean;
  translation: string;
  example: string;
  // Governed prepositions from the source term, e.g. ["auf", "über"] for
  // "sich freuen auf" / "sich freuen über" — shown as a note only.
  prepositions: string[];
  categories: VerbCategory[];
  // Persons worth drilling for this verb (see THIRD_PERSON_ONLY).
  persons: Person[];
}

const MODALS = new Set(['können', 'müssen', 'dürfen', 'sollen', 'wollen', 'mögen']);

// Reflexives whose pronoun is dative in their taught sense ("ich wünsche
// mir", "ich stelle mir vor" = imagine). Everything else is accusative.
const DATIVE_REFLEXIVE = new Set(['wünschen', 'vorstellen']);

// Verbs that are only natural in the 3rd person ("das lohnt sich", "die
// Konzerte finden statt") — "ich finde statt" is grammatical noise, so
// drills never ask for the other persons. Weather verbs only take "es".
const WEATHER_VERBS = new Set(['regnen', 'schneien', 'donnern', 'blitzen', 'hageln']);
const THIRD_PERSON_ONLY = new Set(['lohnen', 'stattfinden', 'klappen', 'passieren', 'anfühlen']);

const personsFor = (infinitive: string): Person[] => {
  if (WEATHER_VERBS.has(infinitive)) return ['er'];
  if (THIRD_PERSON_ONLY.has(infinitive)) return ['er', 'sie'];
  return PERSONS;
};

const GOVERNED_PREPOSITIONS = new Set(['an', 'auf', 'über', 'um', 'für', 'mit', 'von', 'vor', 'nach', 'zu']);

const REFLEXIVE_PRONOUN: Record<'acc' | 'dat', Record<Person, string>> = {
  acc: { ich: 'mich', du: 'dich', er: 'sich', wir: 'uns', ihr: 'euch', sie: 'sich' },
  dat: { ich: 'mir', du: 'dir', er: 'sich', wir: 'uns', ihr: 'euch', sie: 'sich' },
};

// Complete presents for verbs no rule can produce.
const FULL_PRESENT: Record<string, [string, string, string, string, string, string]> = {
  sein: ['bin', 'bist', 'ist', 'sind', 'seid', 'sind'],
  haben: ['habe', 'hast', 'hat', 'haben', 'habt', 'haben'],
  werden: ['werde', 'wirst', 'wird', 'werden', 'werdet', 'werden'],
  wissen: ['weiß', 'weißt', 'weiß', 'wissen', 'wisst', 'wissen'],
  tun: ['tue', 'tust', 'tut', 'tun', 'tut', 'tun'],
  können: ['kann', 'kannst', 'kann', 'können', 'könnt', 'können'],
  müssen: ['muss', 'musst', 'muss', 'müssen', 'müsst', 'müssen'],
  dürfen: ['darf', 'darfst', 'darf', 'dürfen', 'dürft', 'dürfen'],
  sollen: ['soll', 'sollst', 'soll', 'sollen', 'sollt', 'sollen'],
  wollen: ['will', 'willst', 'will', 'wollen', 'wollt', 'wollen'],
  mögen: ['mag', 'magst', 'mag', 'mögen', 'mögt', 'mögen'],
};

// Present-tense stem-vowel changes (du, er/sie/es only). Keyed by the
// simple verb and matched as a suffix, so "vergessen" picks up "essen" and
// "widersprechen" picks up "sprechen" — but only for verbs flagged
// `irregular`, so a regular verb that merely ends the same way (e.g.
// "beantragen" vs. "tragen") never gets a vowel change.
const STEM_CHANGE: Record<string, [string, string]> = {
  backen: ['backst', 'backt'],
  befehlen: ['befiehlst', 'befiehlt'],
  brechen: ['brichst', 'bricht'],
  empfehlen: ['empfiehlst', 'empfiehlt'],
  essen: ['isst', 'isst'],
  fahren: ['fährst', 'fährt'],
  fallen: ['fällst', 'fällt'],
  fangen: ['fängst', 'fängt'],
  geben: ['gibst', 'gibt'],
  gelten: ['giltst', 'gilt'],
  halten: ['hältst', 'hält'],
  helfen: ['hilfst', 'hilft'],
  laden: ['lädst', 'lädt'],
  lassen: ['lässt', 'lässt'],
  laufen: ['läufst', 'läuft'],
  lesen: ['liest', 'liest'],
  messen: ['misst', 'misst'],
  nehmen: ['nimmst', 'nimmt'],
  raten: ['rätst', 'rät'],
  schlafen: ['schläfst', 'schläft'],
  schlagen: ['schlägst', 'schlägt'],
  sehen: ['siehst', 'sieht'],
  sprechen: ['sprichst', 'spricht'],
  stehlen: ['stiehlst', 'stiehlt'],
  sterben: ['stirbst', 'stirbt'],
  tragen: ['trägst', 'trägt'],
  treffen: ['triffst', 'trifft'],
  vergessen: ['vergisst', 'vergisst'],
  wachsen: ['wächst', 'wächst'],
  waschen: ['wäschst', 'wäscht'],
  werfen: ['wirfst', 'wirft'],
};

// Sorted longest-first so "vergessen" wins over "essen".
const STEM_CHANGE_KEYS = Object.keys(STEM_CHANGE).sort((a, b) => b.length - a.length);

const stripSich = (s: string): string =>
  s
    .split(' ')
    .filter((w) => w !== 'sich')
    .join(' ');

// Parses a curriculum vocabulary item into a Verb, or null if it isn't a
// single conjugatable verb (multi-word idioms like "sich Sorgen machen"
// are left to the Wortschatz-Trainer).
export const parseVerb = (item: VocabularyItem): Verb | null => {
  if (item.partOfSpeech !== 'verb' || !item.preterite || !item.participle || !item.auxiliary) return null;

  const words = item.term.trim().split(/\s+/);
  const prepositions: string[] = [];
  while (words.length > 1 && GOVERNED_PREPOSITIONS.has(words[words.length - 1])) {
    prepositions.unshift(words.pop() as string);
  }
  const isReflexive = words[0] === 'sich';
  const core = isReflexive ? words.slice(1) : words;
  if (core.length !== 1 || !/^[a-zäöüß]+$/.test(core[0])) return null;
  const infinitive = core[0];

  const preteriteWords = stripSich(item.preterite).split(' ');
  if (preteriteWords.length > 2) return null;
  const preteriteStem = preteriteWords[0];
  const prefix = preteriteWords[1] ?? '';
  if (prefix && !infinitive.startsWith(prefix)) return null;
  const base = infinitive.slice(prefix.length);

  const reflexive = isReflexive ? (DATIVE_REFLEXIVE.has(infinitive) ? 'dat' : 'acc') : null;
  const term = isReflexive ? `sich ${infinitive}` : infinitive;
  const irregular = item.irregular ?? false;

  const categories: VerbCategory[] = [irregular ? 'irregular' : 'regular'];
  if (prefix) categories.push('separable');
  if (reflexive) categories.push('reflexive');
  if (MODALS.has(infinitive)) categories.push('modal');

  return {
    key: term,
    term,
    infinitive,
    prefix,
    base,
    reflexive,
    preteriteStem,
    participle: stripSich(item.participle),
    auxiliary: item.auxiliary,
    irregular,
    translation: item.translation,
    example: item.example,
    prepositions,
    categories,
    persons: personsFor(infinitive),
  };
};

const endsWithAny = (s: string, endings: string[]): boolean => endings.some((e) => s.endsWith(e));

// "arbeit-", "öffn-", "regn-", "atm-" need a linking -e- before -st/-t.
const needsLinkingE = (stem: string): boolean => {
  if (endsWithAny(stem, ['d', 't'])) return true;
  const last = stem.slice(-1);
  const prev = stem.slice(-2, -1);
  return (last === 'm' || last === 'n') && !!prev && !'aeiouäöülrhmn'.includes(prev);
};

// Present of the (prefix-less) base verb, before prefix/pronoun placement.
const presentBase = (verb: Verb): string[] => {
  const full = FULL_PRESENT[verb.base];
  if (full) return [...full];

  const inf = verb.base;
  let stem: string;
  let ich: string;
  if (inf.endsWith('eln')) {
    stem = inf.slice(0, -1);
    ich = `${inf.slice(0, -3)}le`;
  } else if (inf.endsWith('ern')) {
    stem = inf.slice(0, -1);
    ich = `${stem}e`;
  } else if (inf.endsWith('en')) {
    stem = inf.slice(0, -2);
    ich = `${stem}e`;
  } else {
    stem = inf.slice(0, -1);
    ich = `${stem}e`;
  }

  let du: string;
  let er: string;
  let ihr: string;
  if (needsLinkingE(stem)) {
    du = `${stem}est`;
    er = `${stem}et`;
    ihr = `${stem}et`;
  } else {
    du = endsWithAny(stem, ['s', 'ß', 'z', 'x']) ? `${stem}t` : `${stem}st`;
    er = `${stem}t`;
    ihr = `${stem}t`;
  }

  if (verb.irregular) {
    const changeKey = STEM_CHANGE_KEYS.find((k) => inf.endsWith(k));
    if (changeKey) {
      const lead = inf.slice(0, inf.length - changeKey.length);
      const [changedDu, changedEr] = STEM_CHANGE[changeKey];
      du = lead + changedDu;
      er = lead + changedEr;
    }
  }

  return [ich, du, er, inf, ihr, inf];
};

const preteriteBase = (verb: Verb): string[] => {
  const p = verb.preteriteStem;
  if (p.endsWith('e')) {
    return [p, `${p}st`, p, `${p}n`, `${p}t`, `${p}n`];
  }
  const du = endsWithAny(p, ['s', 'ß', 'z', 'x', 'd', 't']) ? `${p}est` : `${p}st`;
  const ihr = endsWithAny(p, ['d', 't']) ? `${p}et` : `${p}t`;
  return [p, du, p, `${p}en`, ihr, `${p}en`];
};

const AUX_PRESENT: Record<'haben' | 'sein', string[]> = {
  haben: FULL_PRESENT.haben,
  sein: FULL_PRESENT.sein,
};

// Finite verb phrase as it follows the subject in a main clause:
// "stehe auf", "erinnere mich", "stelle mir vor", "bin aufgestanden",
// "habe mich erinnert".
export const conjugate = (verb: Verb, tense: Tense): string[] =>
  PERSONS.map((person, i) => {
    const pronoun = verb.reflexive ? REFLEXIVE_PRONOUN[verb.reflexive][person] : '';
    if (tense === 'perfekt') {
      return [AUX_PRESENT[verb.auxiliary][i], pronoun, verb.participle].filter(Boolean).join(' ');
    }
    const finite = (tense === 'praesens' ? presentBase(verb) : preteriteBase(verb))[i];
    return [finite, pronoun, verb.prefix].filter(Boolean).join(' ');
  });

// Verbs where Duden accepts both auxiliaries in the taught sense ("ich bin
// / habe geschwommen") — never offer the other auxiliary as "wrong".
const DUAL_AUXILIARY = new Set(['schwimmen', 'joggen', 'klettern']);
export const hasFixedAuxiliary = (verb: Verb): boolean => !DUAL_AUXILIARY.has(verb.base);

// Verbs with both a strong and a weak paradigm in common use (transitive
// "hängte/gehängt" vs. intransitive "hing/gehangen"; "backte"/"buk") — a
// weak form isn't a mistake here, and "regelmäßig?" has no clean answer.
const MIXED_STRENGTH = new Set(['hängen', 'backen']);
export const hasClearStrength = (verb: Verb): boolean => !MIXED_STRENGTH.has(verb.base);

// Whether Partizip II takes the ge- augment: not after an inseparable
// prefix (vergessen, bekommen, gewinnen) or for -ieren verbs — but "ge" that
// is part of the root (gehen → gegangen, geben → gegeben) still does.
const INSEPARABLE_PREFIX = /^(be|emp|ent|er|ge|miss|ver|zer|über|unter|wider|hinter)/;
const GE_ROOT = new Set(['gehen', 'geben', 'gelten', 'genießen']);
const takesGeAugment = (verb: Verb): boolean =>
  !verb.base.endsWith('ieren') && (GE_ROOT.has(verb.base) || !INSEPARABLE_PREFIX.test(verb.base));

// Plausible *wrong* forms a learner typically produces — used as
// multiple-choice distractors so an item tests the actual rule (vowel
// change, strong Präteritum, sein-Perfekt) rather than just "which of these
// is a real word".
export const typicalMistakes = (verb: Verb, tense: Tense, person: Person): string[] => {
  const i = PERSONS.indexOf(person);
  const regularVerb: Verb = { ...verb, irregular: false };
  const mistakes: string[] = [];
  const stem = verb.base.replace(/(e?n)$/, '');
  const linking = needsLinkingE(stem) ? 'e' : '';
  const weakAllowed = verb.irregular && hasClearStrength(verb);

  if (tense === 'praesens' && !FULL_PRESENT[verb.base]) {
    mistakes.push(conjugate(regularVerb, 'praesens')[i]);
  }
  if (tense === 'praeteritum' && weakAllowed) {
    mistakes.push(conjugate({ ...verb, preteriteStem: `${stem}${linking}te` }, 'praeteritum')[i]);
  }
  if (tense === 'perfekt') {
    if (hasFixedAuxiliary(verb)) {
      const other = verb.auxiliary === 'haben' ? 'sein' : 'haben';
      mistakes.push(conjugate({ ...verb, auxiliary: other }, 'perfekt')[i]);
    }
    if (weakAllowed) {
      const weakParticiple = `${verb.prefix}${takesGeAugment(verb) ? 'ge' : ''}${stem}${linking}t`;
      mistakes.push(conjugate({ ...verb, participle: weakParticiple }, 'perfekt')[i]);
    }
  }
  return mistakes;
};

// One-line description of what makes this verb tick, used as the Hinweis
// in practice mode.
export const describeVerb = (verb: Verb): string => {
  const parts: string[] = [verb.irregular ? 'unregelmäßig' : 'regelmäßig'];
  if (verb.prefix) parts.push(`trennbar ("${verb.prefix}" steht am Satzende)`);
  if (verb.reflexive) parts.push(`reflexiv (${verb.reflexive === 'dat' ? 'Dativ: mir/dir' : 'Akkusativ: mich/dich'})`);
  if (MODALS.has(verb.infinitive)) parts.push('Modalverb');
  parts.push(`Perfekt mit "${verb.auxiliary}"`);
  return `${verb.term}: ${parts.join(', ')}.`;
};

export const principalParts = (verb: Verb): string => {
  const pret = [verb.preteriteStem, verb.reflexive ? 'sich' : '', verb.prefix].filter(Boolean).join(' ');
  const aux = verb.auxiliary === 'sein' ? 'ist' : 'hat';
  const perf = [aux, verb.reflexive ? 'sich' : '', verb.participle].filter(Boolean).join(' ');
  return `${verb.term} – ${pret} – ${perf}`;
};
