import { MODUL_CATALOG, loadModul } from './curriculumLoader';
import { parseVerb, type Verb } from './verbConjugation';

// Aggregates every conjugatable verb from the selected Lektionen's
// vocabulary, deduplicated by verb (the same verb is often taught again in
// a later Lektion — "sich freuen", then "sich freuen auf"). Governed
// prepositions from each occurrence are merged onto the single entry.
export const buildVerbPool = async (lektionIds: Set<string>): Promise<Verb[]> => {
  if (lektionIds.size === 0) return [];
  const neededModuln = MODUL_CATALOG.filter((m) => m.lektionen.some((l) => lektionIds.has(l.lektionId)));
  const packs = await Promise.all(neededModuln.map(loadModul));
  const seen = new Map<string, Verb>();
  for (const pack of packs) {
    for (const lektion of pack.lektionen) {
      if (!lektionIds.has(lektion.lektionId)) continue;
      for (const item of lektion.vocabulary) {
        const verb = parseVerb(item);
        if (!verb) continue;
        const existing = seen.get(verb.key);
        if (!existing) {
          seen.set(verb.key, verb);
        } else {
          const merged = [...new Set([...existing.prepositions, ...verb.prepositions])];
          seen.set(verb.key, { ...existing, prepositions: merged });
        }
      }
    }
  }
  return [...seen.values()].sort((a, b) => a.infinitive.localeCompare(b.infinitive, 'de'));
};
