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
  {
    modulId: 'a1-m2',
    level: 'A1',
    modulNumber: 2,
    title: 'Wohnen und Einkaufen',
    path: 'data/a1/modul-2.json',
    lektionen: [
      { lektionId: 'a1-m2-l4', lektionNumber: 4, title: 'Meine Wohnung' },
      { lektionId: 'a1-m2-l5', lektionNumber: 5, title: 'Einkaufen' },
      { lektionId: 'a1-m2-l6', lektionNumber: 6, title: 'Verabredungen' },
    ],
  },
  {
    modulId: 'a1-m3',
    level: 'A1',
    modulNumber: 3,
    title: 'Freizeit und Essen',
    path: 'data/a1/modul-3.json',
    lektionen: [
      { lektionId: 'a1-m3-l7', lektionNumber: 7, title: 'Hobbys' },
      { lektionId: 'a1-m3-l8', lektionNumber: 8, title: 'Verabredungen im Kino' },
      { lektionId: 'a1-m3-l9', lektionNumber: 9, title: 'Essen' },
    ],
  },
  {
    modulId: 'a1-m4',
    level: 'A1',
    modulNumber: 4,
    title: 'Unterwegs und Vergangenheit',
    path: 'data/a1/modul-4.json',
    lektionen: [
      { lektionId: 'a1-m4-l10', lektionNumber: 10, title: 'Verkehrsmittel' },
      { lektionId: 'a1-m4-l11', lektionNumber: 11, title: 'Ein normaler Tag' },
      { lektionId: 'a1-m4-l12', lektionNumber: 12, title: 'Ein besonderer Tag' },
    ],
  },
  {
    modulId: 'a1-m5',
    level: 'A1',
    modulNumber: 5,
    title: 'Wohnen und Orientierung',
    path: 'data/a1/modul-5.json',
    lektionen: [
      { lektionId: 'a1-m5-l13', lektionNumber: 13, title: 'Mein Blog' },
      { lektionId: 'a1-m5-l14', lektionNumber: 14, title: 'Nach dem Weg fragen' },
      { lektionId: 'a1-m5-l15', lektionNumber: 15, title: 'WG-Zimmer' },
    ],
  },
  {
    modulId: 'a1-m6',
    level: 'A1',
    modulNumber: 6,
    title: 'Probleme, Berufe und Gesundheit',
    path: 'data/a1/modul-6.json',
    lektionen: [
      { lektionId: 'a1-m6-l16', lektionNumber: 16, title: 'Hilfe anbieten' },
      { lektionId: 'a1-m6-l17', lektionNumber: 17, title: 'Zukunftspläne' },
      { lektionId: 'a1-m6-l18', lektionNumber: 18, title: 'Gesundheit' },
    ],
  },
  {
    modulId: 'a1-m7',
    level: 'A1',
    modulNumber: 7,
    title: 'Haushalt, Arbeit und Regeln',
    path: 'data/a1/modul-7.json',
    lektionen: [
      { lektionId: 'a1-m7-l19', lektionNumber: 19, title: 'Haushalt' },
      { lektionId: 'a1-m7-l20', lektionNumber: 20, title: 'Bewerbung' },
      { lektionId: 'a1-m7-l21', lektionNumber: 21, title: 'Regeln' },
    ],
  },
  {
    modulId: 'a1-m8',
    level: 'A1',
    modulNumber: 8,
    title: 'Konsum, Wetter und Feste',
    path: 'data/a1/modul-8.json',
    lektionen: [
      { lektionId: 'a1-m8-l22', lektionNumber: 22, title: 'Kleidertausch' },
      { lektionId: 'a1-m8-l23', lektionNumber: 23, title: 'Wetter' },
      { lektionId: 'a1-m8-l24', lektionNumber: 24, title: 'Feste und Feiertage' },
    ],
  },
  {
    modulId: 'a2-m1',
    level: 'A2',
    modulNumber: 1,
    title: 'Alltag und Familie',
    path: 'data/a2/modul-1.json',
    lektionen: [
      { lektionId: 'a2-m1-l1', lektionNumber: 1, title: 'Ein Jubiläum' },
      { lektionId: 'a2-m1-l2', lektionNumber: 2, title: 'Eine Panne' },
      { lektionId: 'a2-m1-l3', lektionNumber: 3, title: 'Umzug' },
    ],
  },
  {
    modulId: 'a2-m2',
    level: 'A2',
    modulNumber: 2,
    title: 'Arbeit und Freizeit',
    path: 'data/a2/modul-2.json',
    lektionen: [
      { lektionId: 'a2-m2-l4', lektionNumber: 4, title: 'Im Büro' },
      { lektionId: 'a2-m2-l5', lektionNumber: 5, title: 'Freizeit' },
      { lektionId: 'a2-m2-l6', lektionNumber: 6, title: 'Fitness' },
    ],
  },
  {
    modulId: 'a2-m3',
    level: 'A2',
    modulNumber: 3,
    title: 'Meinung und Orientierung',
    path: 'data/a2/modul-3.json',
    lektionen: [
      { lektionId: 'a2-m3-l7', lektionNumber: 7, title: 'Meine Meinung' },
      { lektionId: 'a2-m3-l8', lektionNumber: 8, title: 'Im Krankenhaus' },
      { lektionId: 'a2-m3-l9', lektionNumber: 9, title: 'Zuhause' },
    ],
  },
  {
    modulId: 'a2-m4',
    level: 'A2',
    modulNumber: 4,
    title: 'Unterwegs und Wünsche',
    path: 'data/a2/modul-4.json',
    lektionen: [
      { lektionId: 'a2-m4-l10', lektionNumber: 10, title: 'Unterwegs' },
      { lektionId: 'a2-m4-l11', lektionNumber: 11, title: 'Träume und Wünsche' },
      { lektionId: 'a2-m4-l12', lektionNumber: 12, title: 'Entscheidungen' },
    ],
  },
  {
    modulId: 'a2-m5',
    level: 'A2',
    modulNumber: 5,
    title: 'Geben und Helfen',
    path: 'data/a2/modul-5.json',
    lektionen: [
      { lektionId: 'a2-m5-l13', lektionNumber: 13, title: 'Geschenke' },
      { lektionId: 'a2-m5-l14', lektionNumber: 14, title: 'Hilfe anbieten' },
      { lektionId: 'a2-m5-l15', lektionNumber: 15, title: 'Guter Rat' },
    ],
  },
  {
    modulId: 'a2-m6',
    level: 'A2',
    modulNumber: 6,
    title: 'Medien und Kommunikation',
    path: 'data/a2/modul-6.json',
    lektionen: [
      { lektionId: 'a2-m6-l16', lektionNumber: 16, title: 'Medien' },
      { lektionId: 'a2-m6-l17', lektionNumber: 17, title: 'Gefühle und Reaktionen' },
      { lektionId: 'a2-m6-l18', lektionNumber: 18, title: 'Digitale Kommunikation' },
    ],
  },
  {
    modulId: 'a2-m7',
    level: 'A2',
    modulNumber: 7,
    title: 'Rückblick und Beziehungen',
    path: 'data/a2/modul-7.json',
    lektionen: [
      { lektionId: 'a2-m7-l19', lektionNumber: 19, title: 'Als ich jung war' },
      { lektionId: 'a2-m7-l20', lektionNumber: 20, title: 'Zu Hause und unterwegs' },
      { lektionId: 'a2-m7-l21', lektionNumber: 21, title: 'Was ich mir wünsche' },
    ],
  },
  {
    modulId: 'a2-m8',
    level: 'A2',
    modulNumber: 8,
    title: 'Erzählen und Regeln',
    path: 'data/a2/modul-8.json',
    lektionen: [
      { lektionId: 'a2-m8-l22', lektionNumber: 22, title: 'In der Fabrik' },
      { lektionId: 'a2-m8-l23', lektionNumber: 23, title: 'Eine Geschichte erzählen' },
      { lektionId: 'a2-m8-l24', lektionNumber: 24, title: 'Regeln und Gesetze' },
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
