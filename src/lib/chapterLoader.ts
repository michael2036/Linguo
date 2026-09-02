import type { ChapterPackage, ChapterSummary } from '../types/chapter';

// Static manifest of available chapter packs. In a larger course catalog this
// would itself be a fetched JSON index; a couple of hard-coded entries are
// enough for the current sample courses.
export const CHAPTER_CATALOG: ChapterSummary[] = [
  {
    courseId: 'deutsch-a1',
    chapterId: 'deutsch-a1-ch01',
    chapterNumber: 1,
    title: 'Erste Schritte: Sich vorstellen',
    targetLevel: 'A1',
    path: 'data/deutsch-a1/chapter-01.json',
  },
  {
    courseId: 'momente-a2-1',
    chapterId: 'momente-a2-1-l01',
    chapterNumber: 1,
    title: 'Ein Tag, den ich nie vergesse',
    targetLevel: 'A2',
    path: 'data/momente-a2-1/chapter-01.json',
  },
  {
    courseId: 'momente-a2-2',
    chapterId: 'momente-a2-2-l13',
    chapterNumber: 13,
    title: 'Ich gebe es ihm',
    targetLevel: 'A2',
    path: 'data/momente-a2-2/chapter-13.json',
  },
  {
    courseId: 'momente-b1-1',
    chapterId: 'momente-b1-1-l01',
    chapterNumber: 1,
    title: 'Als ich klein war',
    targetLevel: 'B1',
    path: 'data/momente-b1-1/chapter-01.json',
  },
  {
    courseId: 'momente-b1-2',
    chapterId: 'momente-b1-2-l13',
    chapterNumber: 13,
    title: 'Nicht nur stark, sondern auch schnell',
    targetLevel: 'B1+',
    path: 'data/momente-b1-2/chapter-13.json',
  },
];

const chapterCache = new Map<string, ChapterPackage>();

// `import.meta.env.BASE_URL` resolves to the configured GitHub Pages
// sub-path (see TR-02), so this works both at `/` in dev and `/linguo/` in
// production without hard-coding the repo name here.
export const loadChapter = async (summary: ChapterSummary): Promise<ChapterPackage> => {
  const cached = chapterCache.get(summary.chapterId);
  if (cached) return cached;

  const url = `${import.meta.env.BASE_URL}${summary.path}`;
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Failed to load chapter ${summary.chapterId}: ${res.status}`);
  }
  const pack = (await res.json()) as ChapterPackage;
  chapterCache.set(summary.chapterId, pack);
  return pack;
};
