const normalize = (value: string): string =>
  value
    .trim()
    .replace(/\s+/g, ' ')
    .replace(/[.,!?]+$/, '')
    .toLowerCase();

export const isCorrectAnswer = (userAnswer: string, solution: string): boolean =>
  normalize(userAnswer) === normalize(solution);
