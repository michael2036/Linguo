import type { ChapterProgressEntry } from '../types/appState';
import { emptyChapterProgress } from '../types/appState';
import type { ChapterSummary } from '../types/chapter';
import { CHAPTER_CATALOG, COURSE_CATALOG } from './chapterLoader';

export interface NextStepSuggestion {
  chapter: ChapterSummary;
  courseTitle: string;
  hasStarted: boolean;
}

// Picks one chapter to resume on the home page's "Weiter lernen" card:
// prefer something already in progress, then something with the vocab
// primer done but no tier attempted yet, then the first untouched chapter,
// in catalog order. Returns null once every chapter is mastered.
export const suggestNextStep = (
  chapterProgress: Record<string, ChapterProgressEntry>,
): NextStepSuggestion | null => {
  const progressFor = (chapterId: string) => chapterProgress[chapterId] ?? emptyChapterProgress();

  const inProgress = CHAPTER_CATALOG.find((c) => progressFor(c.chapterId).status === 'yellow');
  const vocabStarted = CHAPTER_CATALOG.find((c) => {
    const p = progressFor(c.chapterId);
    return p.status === 'red' && p.vocabCompleted;
  });
  const untouched = CHAPTER_CATALOG.find((c) => progressFor(c.chapterId).status === 'red' && !progressFor(c.chapterId).vocabCompleted);

  const pick = inProgress ?? vocabStarted ?? untouched;
  if (!pick) return null;

  const course = COURSE_CATALOG.find((c) => c.courseId === pick.courseId);
  return {
    chapter: pick,
    courseTitle: course?.title ?? pick.courseId,
    hasStarted: pick !== untouched,
  };
};

export const allChaptersMastered = (chapterProgress: Record<string, ChapterProgressEntry>): boolean =>
  CHAPTER_CATALOG.every((c) => (chapterProgress[c.chapterId] ?? emptyChapterProgress()).status === 'green');
