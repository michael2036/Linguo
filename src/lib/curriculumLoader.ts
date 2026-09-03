import type { LevelInfo, ModulPackage, ModulSummary } from '../types/curriculum';

// Levels the app has real Kursbuch+Arbeitsbuch source material for. Order
// here is display order on the home page.
export const LEVEL_CATALOG: LevelInfo[] = [
  { level: 'A1', title: 'Deutsch A1' },
  { level: 'A2', title: 'Deutsch A2' },
  { level: 'B1', title: 'Deutsch B1' },
];

// Static manifest of available Moduln. In a larger catalog this would be a
// fetched index; a single pilot entry is enough while the new Level ->
// Modul -> Lektion architecture is being validated (see .agents/pipeline.md).
export const MODUL_CATALOG: ModulSummary[] = [
  {
    modulId: 'a1-m1',
    level: 'A1',
    modulNumber: 1,
    title: 'Ankommen',
    path: 'data/a1/modul-1.json',
    lektionen: [
      { lektionId: 'a1-m1-l1', lektionNumber: 1, title: 'Sich vorstellen' },
      { lektionId: 'a1-m1-l2', lektionNumber: 2, title: 'Berufe' },
      { lektionId: 'a1-m1-l3', lektionNumber: 3, title: 'Familie' },
    ],
  },
];

const modulCache = new Map<string, ModulPackage>();

// `import.meta.env.BASE_URL` resolves to the configured GitHub Pages
// sub-path (see TR-02), so this works both at `/` in dev and `/Linguo/` in
// production without hard-coding the repo name here.
export const loadModul = async (summary: ModulSummary): Promise<ModulPackage> => {
  const cached = modulCache.get(summary.modulId);
  if (cached) return cached;

  const url = `${import.meta.env.BASE_URL}${summary.path}`;
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Failed to load Modul ${summary.modulId}: ${res.status}`);
  }
  const pack = (await res.json()) as ModulPackage;
  modulCache.set(summary.modulId, pack);
  return pack;
};
