import type { LektionProgressEntry } from '../types/appState';
import { emptyLektionProgress } from '../types/appState';
import { MODUL_CATALOG } from './curriculumLoader';

export interface NextStepSuggestion {
  lektionId: string;
  modulTitle: string;
  lektionTitle: string;
  hasStarted: boolean;
}

const ALL_LEKTIONEN = MODUL_CATALOG.flatMap((modul) =>
  modul.lektionen.map((l) => ({ ...l, modulTitle: modul.title })),
);

// Picks one Lektion to resume on the home page's "Weiter lernen" card:
// prefer something already in progress, then something with the vocab
// primer done but nothing else attempted, then the first untouched
// Lektion, in catalog order. Returns null once every Lektion is mastered.
export const suggestNextStep = (
  lektionProgress: Record<string, LektionProgressEntry>,
): NextStepSuggestion | null => {
  const progressFor = (lektionId: string) => lektionProgress[lektionId] ?? emptyLektionProgress();

  const inProgress = ALL_LEKTIONEN.find((l) => progressFor(l.lektionId).status === 'yellow');
  const vocabStarted = ALL_LEKTIONEN.find((l) => {
    const p = progressFor(l.lektionId);
    return p.status === 'red' && p.vocabCompleted;
  });
  const untouched = ALL_LEKTIONEN.find((l) => {
    const p = progressFor(l.lektionId);
    return p.status === 'red' && !p.vocabCompleted;
  });

  const pick = inProgress ?? vocabStarted ?? untouched;
  if (!pick) return null;

  return {
    lektionId: pick.lektionId,
    modulTitle: pick.modulTitle,
    lektionTitle: pick.title,
    hasStarted: pick !== untouched,
  };
};

export const allLektionenMastered = (lektionProgress: Record<string, LektionProgressEntry>): boolean =>
  ALL_LEKTIONEN.every((l) => (lektionProgress[l.lektionId] ?? emptyLektionProgress()).status === 'green');
