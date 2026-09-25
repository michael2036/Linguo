import type { Level } from './curriculum';

export type GrammarCategory =
  | 'satzbau'
  | 'verben'
  | 'nomen'
  | 'praepositionen'
  | 'adjektive'
  | 'konnektoren'
  | 'redemittel';

export type HighlightTone = 'accent' | 'success' | 'neutral';

// Text fields may carry two highlight marks: [x] for the first tone (e.g.
// Akkusativ, action) and {x} for the second (Dativ, state) — see
// components/grammar/Marked.tsx.
export interface GrammarColumn {
  label: string;
  sublabel?: string;
  tone: HighlightTone;
  items: string[];
  // Render items as sentence lines (smaller type) rather than big words.
  lines?: boolean;
  // Short word lists (prepositions) as a wrapping row of chips.
  inline?: boolean;
}

export type GrammarVisual =
  | { kind: 'columns'; columns: GrammarColumn[] }
  | { kind: 'table'; headers: string[]; rows: string[][]; highlightColumn?: number };

export interface GrammarExample {
  text: string;
  result?: string;
}

export interface GrammarCard {
  id: string;
  level: Level;
  category: GrammarCategory;
  title: string;
  subtitle: string;
  // Lektionen that teach this topic; empty for core topics the course uses
  // but never teaches on their own.
  lektionIds: string[];
  visual: GrammarVisual;
  tip?: string;
  examples: GrammarExample[];
  warning: { wrong: string; right: string; note: string };
  back: {
    sections: { title: string; lines: string[] }[];
    check: { prompt: string; answer: string }[];
  };
}
