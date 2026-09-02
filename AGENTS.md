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
  pages/                       # HomePage, ChapterPage, SettingsPage
  store/appState.ts            # zustand store — single source of truth for progress
  lib/
    scoring.ts                 # tier pass thresholds + traffic-light status logic
    chapterLoader.ts           # fetches chapter JSON, CHAPTER_CATALOG lives here
    googleAuth.ts / driveSync.ts  # optional cloud sync, appdata-scoped
    localStore.ts              # localStorage persistence
  types/                       # TS types mirroring the two JSON schemas
  theme/brand.ts                # custom Fluent brand ramp (light + dark)
public/
  schemas/                     # the two JSON Schemas (app state, chapter)
  data/<course-id>/chapter-*.json  # chapter content packs
.agents/                       # content-authoring agent specs (see above)
.github/workflows/deploy.yml   # GitHub Pages CI/CD
```

## Stack quick reference

- Vite + React 19 + TypeScript, strict mode.
- Fluent UI v9 (`@fluentui/react-components`) — `makeStyles` + `tokens` +
  `shorthands` only, no other CSS framework.
- Zustand for state (`src/store/appState.ts`), persisted to `localStorage`.
- `react-router-dom` with `HashRouter` — deliberate, not an oversight: GitHub
  Pages serves no server rewrites, so hash routes are what survive a hard
  refresh under the `/linguo/` sub-path.
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
  with `useMemo` in the component instead (see `ChapterPage.tsx` for the
  pattern).
- **Traffic-light status, tier pass thresholds, and stage-unlock logic all
  live in `src/lib/scoring.ts`** — it's the one place that encodes PRD
  §4.3/FR-13. Don't reimplement that logic elsewhere.
- **Chapter content is data, not code.** Don't hand-add exercises inside
  components; author them as a chapter JSON pack via the
  [`.agents/`](.agents) pipeline and register it in `CHAPTER_CATALOG`
  (`src/lib/chapterLoader.ts`).
- **`GOOGLE_CLIENT_ID` in `src/lib/googleAuth.ts` is a real client ID**, not a
  placeholder — don't overwrite it casually. It only works from origins
  listed as Authorized JavaScript origins for that OAuth client in Google
  Cloud Console (see README's Google Drive sync section); a sign-in failure
  from an unlisted origin (e.g. a different port, or before Pages is
  deployed) is expected, not a code bug.
- **GitHub Pages base path** is set in `vite.config.ts` (`REPO_BASE =
  '/linguo/'`) — keep it in sync with the actual repo name if that ever
  changes.

## Definition of done for a UI change

1. `npm run build` passes (type-check + production build).
2. `npm run lint` is clean.
3. You ran the app and clicked through the actual flow you changed —
   screenshots/build output alone don't confirm a feature works.
4. Both light and dark theme still look right if you touched styling.
