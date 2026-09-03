import type { VocabularyItem } from '../types/content';
import { MODUL_CATALOG, loadModul } from './curriculumLoader';

// The stable identity of a "word" for trainer purposes. Vocabulary item ids
// are only unique within a single Lektion (see VocabWordProgress), so
// aggregation and progress tracking both key off the term itself instead.
export const normalizeTermKey = (term: string): string => term.trim().toLowerCase();

// Aggregates and deduplicates (by normalized term) the vocabulary of every
// selected Lektion, fetching only the Moduln that actually contain a
// selected Lektion. Modul JSON is cached by `loadModul`, so re-aggregating
// after a selection change is cheap.
export const buildVocabPool = async (lektionIds: Set<string>): Promise<VocabularyItem[]> => {
  if (lektionIds.size === 0) return [];
  const neededModuln = MODUL_CATALOG.filter((m) => m.lektionen.some((l) => lektionIds.has(l.lektionId)));
  const packs = await Promise.all(neededModuln.map(loadModul));
  const seen = new Map<string, VocabularyItem>();
  for (const pack of packs) {
    for (const lektion of pack.lektionen) {
      if (!lektionIds.has(lektion.lektionId)) continue;
      for (const item of lektion.vocabulary) {
        const key = normalizeTermKey(item.term);
        if (!seen.has(key)) seen.set(key, item);
      }
    }
  }
  return [...seen.values()];
};
