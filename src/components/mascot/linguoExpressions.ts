// Linguo's face sheet (src/linguo_sprites.jpeg) is a 4x4 grid of hand-drawn
// reactions. Each entry here maps a semantic expression name to its
// [row, col] cell (0-indexed) so LinguoAvatar can slice it out with a plain
// CSS background-position — no build-time image splitting required.
export type LinguoExpression =
  | 'idle'
  | 'happy'
  | 'skeptical'
  | 'annoyed'
  | 'surprised'
  | 'smug'
  | 'celebrating'
  | 'sad'
  | 'encouraging'
  | 'bored'
  | 'thinking'
  | 'confident'
  | 'loving'
  | 'shocked'
  | 'confused'
  | 'glitch';

export const LINGUO_GRID: Record<LinguoExpression, [row: number, col: number]> = {
  idle: [0, 0],
  happy: [0, 1],
  skeptical: [0, 2],
  annoyed: [0, 3],
  surprised: [1, 0],
  smug: [1, 1],
  celebrating: [1, 2],
  sad: [1, 3],
  encouraging: [2, 0],
  bored: [2, 1],
  thinking: [2, 2],
  confident: [2, 3],
  loving: [3, 0],
  shocked: [3, 1],
  confused: [3, 2],
  glitch: [3, 3],
};

export const LINGUO_GRID_SIZE = 4;

// Short, warm micro-copy in Linguo's voice — curious, tech-savvy, never
// punitive. One is picked at random each time an answer is graded so the
// drawer doesn't feel like it's reading from a script.
const CORRECT_LINES = [
  'Genau richtig!',
  'Stark gemacht!',
  'Du hast den Dreh raus!',
  'Perfekt kalibriert!',
  'Volltreffer!',
  'Klasse gelöst!',
  'Das saß!',
  'Weiter so!',
];

const INCORRECT_LINES = [
  'Fast geschafft — schau mal hier:',
  'Kein Problem, das üben wir gleich fest.',
  'Kleiner Stolperer, kein Drama.',
  'Guter Versuch! Hier die richtige Spur:',
  'Das merken wir uns für nächstes Mal.',
  'Nicht ganz — aber du bist nah dran.',
];

const STREAK_LINES = [
  'Serie läuft! 🔥',
  'Du bist nicht zu stoppen!',
  'Das nenn ich Flow!',
  'Ein Treffer nach dem anderen!',
];

const pickRandom = (lines: string[]) => lines[Math.floor(Math.random() * lines.length)];

export const pickLinguoLine = (correct: boolean, streak: number): string => {
  if (correct && streak >= 3) return pickRandom(STREAK_LINES);
  return pickRandom(correct ? CORRECT_LINES : INCORRECT_LINES);
};
