import type { GrammarCard, GrammarCategory } from '../types/grammar';

export const CATEGORY_LABEL: Record<GrammarCategory, string> = {
  satzbau: 'Satzbau',
  verben: 'Verben',
  nomen: 'Nomen & Pronomen',
  praepositionen: 'Präpositionen',
  adjektive: 'Adjektive',
  konnektoren: 'Konnektoren',
  redemittel: 'Redemittel',
};

let cache: Promise<GrammarCard[]> | null = null;

// One small JSON file for all cards, fetched once and precached by the
// service worker with the rest of public/data.
export const loadGrammarCards = (): Promise<GrammarCard[]> => {
  if (!cache) {
    cache = fetch(`${import.meta.env.BASE_URL}data/grammar/cards.json`)
      .then((res) => {
        if (!res.ok) throw new Error(`Failed to load grammar cards: ${res.status}`);
        return res.json() as Promise<{ cards: GrammarCard[] }>;
      })
      .then((data) => data.cards)
      .catch((err) => {
        cache = null;
        throw err;
      });
  }
  return cache;
};

export type MarkedPart = { text: string; tone: 'plain' | 'accent' | 'success' };

// Card text marks highlights inline: [x] = first tone (Akkusativ / action /
// the thing to notice), {x} = second tone (Dativ / state / the contrast).
export const parseMarked = (text: string): MarkedPart[] => {
  const parts: MarkedPart[] = [];
  const pattern = /\[([^\]]+)\]|\{([^}]+)\}/g;
  let last = 0;
  for (const match of text.matchAll(pattern)) {
    const index = match.index ?? 0;
    if (index > last) parts.push({ text: text.slice(last, index), tone: 'plain' });
    parts.push({ text: match[1] ?? match[2], tone: match[1] !== undefined ? 'accent' : 'success' });
    last = index + match[0].length;
  }
  if (last < text.length) parts.push({ text: text.slice(last), tone: 'plain' });
  return parts;
};
