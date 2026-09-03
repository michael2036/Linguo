# AGENTS.md

Orientation for any coding agent working in this repo. Read this first; it
points to the deeper docs rather than duplicating them.

## What this is

**Linguo** — a zero-backend, local-first German practice PWA. Static React +
Fluent UI v9 app deployed to GitHub Pages, with optional Google Drive sync
(no server, no client secret). Full spec: [`PRD.md`](PRD.md). Setup/deploy
instructions: [`README.md`](README.md).

Two separate kinds of "agent" exist in this project — don't conflate them:

- **This file** is about agents that write/modify the *app's code*.
- [`.agents/`](.agents) documents agents that generate *chapter content*
  (vocabulary + exercises) offline, before it's committed to the repo. If
  you're asked to author a new chapter, start at
  [`.agents/pipeline.md`](.agents/pipeline.md), not here.

## Repo map

```
src/
  components/
    layout/AppShell.tsx        # header, bottom nav, safe-area insets
    exercises/                 # one component per exercise type + shared runner
    vocab/VocabFlashcards.tsx  # Stage 0 flip-card primer
    badges/                    # TrafficLightBadge, GenderBadge, ScoreRing
    celebration/Confetti.tsx   # one-shot burst on Lektion mastery
    legal/LegalDocument.tsx    # shared layout for Privacy/Terms
    ErrorBoundary.tsx          # crash guard around the routed pages
  pages/                       # HomePage, LektionPage, SettingsPage,
                                # AboutPage, PrivacyPage, TermsPage, NotFoundPage
  store/appState.ts            # zustand store — single source of truth for progress
  lib/
    scoring.ts                 # tier pass thresholds + traffic-light status logic
    recommendation.ts          # "Weiter lernen" next-Lektion suggestion
    curriculumLoader.ts        # fetches Modul JSON; LEVEL_CATALOG + MODUL_CATALOG live here
    googleAuth.ts / driveSync.ts  # optional cloud sync, appdata-scoped
    localStore.ts              # localStorage persistence
  types/
    content.ts                 # shared primitives: VocabularyItem, ExerciseItem
    curriculum.ts               # Level -> Modul -> Lektion hierarchy types
    appState.ts                 # persisted app state (progress, preferences)
  theme/brand.ts                # custom Fluent brand ramp (light + dark)
public/
  schemas/                     # the two JSON Schemas (app state, modul)
  data/<level>/modul-<N>.json  # curriculum content packs (level lowercase: a1, a2, b1)
  og-image.png                 # social preview image (excluded from SW precache)
design/                        # source design assets (e.g. icon master), not shipped
.agents/                       # content-authoring agent specs (see above)
.github/workflows/deploy.yml   # GitHub Pages CI/CD
```

Routes: `/` (home, grouped by Level → Modul → Lektion), `/lektion/:lektionId`
(mode-select → Übung or Test), `/settings`, `/about`, `/privacy`, `/terms`,
and a `*` catch-all `NotFoundPage`. The Privacy/Terms pages are real,
live-linked pages — they're what Google's OAuth consent screen configuration
points at, so don't remove or break their routes without updating that
consent screen too.

## Curriculum architecture

The app's content follows the real structure of the "Momente" (Hueber)
textbook series it's sourced from, discovered by auditing all 14 available
Kursbuch + Arbeitsbuch answer-key PDFs — see [PRD §7](PRD.md#7-agentic-content-authoring-pipeline)
and [`.agents/`](.agents) for the full rationale:

```
Level (A1 / A2 / B1)
 └─ Modul (1-8, numbered continuously across the level's two half-books)
     └─ Lektion (exactly 3 per Modul)
         ├─ vocabulary                       Stage 0 primer
         ├─ practice.easy/medium/hard        merges both source books:
         │                                   easy = Kursbuch (thematic),
         │                                   medium/hard = Arbeitsbuch's
         │                                   native leicht/schwer drill tiers
         └─ test                             separate, originally-authored
                                              bank for Direct Test Mode —
                                              never gated by, or reachable
                                              through, `practice`
```

Two decoupled pathways per Lektion, both reachable from `LektionPage`'s
mode-select screen with zero prior clicks: **Übung** (Practice — vocab, then
gated easy → medium → hard, same scaffolding model as before) and **Test**
(Direct Test Mode — instantly accessible, no gating, and a strong score
alone can move the Lektion to Green via `TEST_MASTERY_THRESHOLD` in
`scoring.ts`).

Only `a1-m1` (3 Lektionen) is built as of this writing — a deliberate pilot
to validate the architecture before scaling to all 8 Moduln × 3 levels. See
[`.agents/pipeline.md`](.agents/pipeline.md) to author more.

## Stack quick reference

- Vite + React 19 + TypeScript, strict mode.
- Fluent UI v9 (`@fluentui/react-components`) — `makeStyles` + `tokens` +
  `shorthands` only, no other CSS framework.
- Zustand for state (`src/store/appState.ts`), persisted to `localStorage`.
- `react-router-dom` with `HashRouter` — deliberate, not an oversight: GitHub
  Pages serves no server rewrites, so hash routes are what survive a hard
  refresh under the `/Linguo/` sub-path.
- `vite-plugin-pwa` for the installable, offline-capable PWA.
- Self-hosted variable fonts (`@fontsource-variable/*`) — no external CDN
  calls, so the PWA looks right fully offline.

## Commands

```bash
npm run dev      # local dev server
npm run build    # tsc -b && vite build — do this before considering any change done
npm run lint     # oxlint
npm run preview  # serve the production build locally
```

There is no test suite yet. Verify UI changes by actually running the app
(`npm run dev`) and exercising the flow you touched — don't rely on the
build passing alone.

## Conventions worth knowing before you edit

- **Fluent's `makeStyles` blocks some raw longhand properties on purpose**
  (`borderColor`, `border`, etc. — Griffel types them as `undefined` to force
  RTL-safe usage). Use `...shorthands.borderColor(...)` etc. instead of the
  raw CSS property, including inside `:hover`/pseudo blocks. If `tsc` reports
  `Type 'string' is not assignable to type 'undefined'` on a style property,
  this is almost always why.
- **Never build a zustand selector that constructs a new object/array
  inline** (e.g. `useAppStore(s => s.someMethod(id))` returning a fresh
  literal each call) — it re-triggers on every render and can produce an
  infinite update loop. Select the raw stored value and derive/default it
  with `useMemo` in the component instead (see `LektionPage.tsx` for the
  pattern).
- **Traffic-light status, tier pass thresholds, stage-unlock logic, and the
  Test-Mode mastery threshold all live in `src/lib/scoring.ts`** — it's the
  one place that encodes PRD §4.3/FR-13 plus the Practice/Test decoupling
  from Phase 3. Don't reimplement that logic elsewhere.
- **Curriculum content is data, not code.** Don't hand-add exercises inside
  components; author them as a Modul JSON pack via the [`.agents/`](.agents)
  pipeline and register it in `MODUL_CATALOG` (`src/lib/curriculumLoader.ts`).
  If it's the first Modul for a new `level`, also add that level to
  `LEVEL_CATALOG` in the same file — the home page groups Moduln by `level`
  and renders nothing for an unregistered one.
- **`GOOGLE_CLIENT_ID` in `src/lib/googleAuth.ts` is a real client ID**, not a
  placeholder — don't overwrite it casually. It only works from origins
  listed as Authorized JavaScript origins for that OAuth client in Google
  Cloud Console (see README's Google Drive sync section); a sign-in failure
  from an unlisted origin (e.g. a different port, or before Pages is
  deployed) is expected, not a code bug.
- **GitHub Pages base path is case-sensitive.** `REPO_BASE` in
  `vite.config.ts` must exactly match the repo's actual name casing
  (`/Linguo/`, capital L) — a mismatch 404s every asset while the root HTML
  still loads fine, which made the very first deploy silently broken. Keep
  it in sync if the repo is ever renamed.

## Definition of done for a UI change

1. `npm run build` passes (type-check + production build).
2. `npm run lint` is clean.
3. You ran the app and clicked through the actual flow you changed —
   screenshots/build output alone don't confirm a feature works.
4. Both light and dark theme still look right if you touched styling.
