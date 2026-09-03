import type { ExerciseItem, VocabularyItem } from './content';

// Only the levels we hold real source material (Momente Kursbuch +
// Arbeitsbuch) for. Extend when a new level's PDFs are ingested.
export type Level = 'A1' | 'A2' | 'B1';

export interface LevelInfo {
  level: Level;
  title: string;
  // Short, encouraging one-liner Linguo uses to introduce the level on the
  // dashboard — presentational copy only, not part of the curriculum itself.
  tagline: string;
}

// One Lektion — the smallest directly-selectable unit (PRD's "Direct Lesson
// Access" requirement). `practice` merges both source books into one pool:
// `easy` draws on Kursbuch's thematic/contextual exercises, `medium`/`hard`
// on the Arbeitsbuch's native leicht/schwer drill tiers. `test` is a
// separate, originally-authored assessment bank for Direct Test Mode —
// deliberately not reachable through `practice`, and not gated by it.
export interface LektionPackage {
  lektionId: string;
  level: Level;
  modulNumber: number;
  lektionNumber: number;
  title: string;
  grammarFocus: string[];
  vocabulary: VocabularyItem[];
  practice: {
    easy: ExerciseItem[];
    medium: ExerciseItem[];
    hard: ExerciseItem[];
  };
  test: ExerciseItem[];
}

// One Modul — a thematic umbrella over exactly 3 Lektionen, matching the
// source series' own structure. Modul numbers run 1-8 continuously across
// a level's two half-books (.1 = Modul 1-4 / Lektion 1-12, .2 = Modul 5-8 /
// Lektion 13-24) — that split is a publishing artifact, not something the
// app surfaces as a separate navigation layer.
export interface ModulPackage {
  modulId: string;
  level: Level;
  modulNumber: number;
  title: string;
  lektionen: LektionPackage[];
}

// Lightweight manifest entry — enough to render the home page's Level →
// Modul → Lektion tree and fetch a Modul's full content on demand.
export interface ModulSummary {
  modulId: string;
  level: Level;
  modulNumber: number;
  title: string;
  path: string;
  lektionen: { lektionId: string; lektionNumber: number; title: string }[];
}
