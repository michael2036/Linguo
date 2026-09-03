export const PRACTICE_XP_PER_CORRECT = 10;
export const TEST_XP_PER_CORRECT = 15;
export const XP_PER_LEVEL = 200;
export const DEFAULT_SESSION_SIZE = 20;

export const levelForXp = (xp: number): number => Math.floor(xp / XP_PER_LEVEL) + 1;
export const xpIntoLevel = (xp: number): number => xp % XP_PER_LEVEL;
