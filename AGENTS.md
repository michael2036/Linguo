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
    vocabTrainer/               # cross-Lektion Wortschatz-Trainer (select tree, stats)
    mascot/                     # LinguoAvatar (sprite-sliced), LinguoFeedbackDrawer,
                                 # LinguoLevelBanner, LinguoLaunchOverlay — see
                                 # "Linguo the mascot" below
    dashboard/                  # LevelCard (portal), ModulPathCard (level hub)
    badges/                     # LessonStatusBadge, GenderBadge, ScoreRing
    celebration/Confetti.tsx   # one-shot burst on Lektion mastery
    legal/LegalDocument.tsx    # shared layout for Privacy/Terms
    InstallAppPrompt.tsx        # "add to home screen" / PWA install nudge
    ErrorBoundary.tsx          # crash guard around the routed pages
  pages/                       # HomePage (portal), LevelHubPage, LektionPage,
                                # VocabTrainerPage, SettingsPage, AboutPage,
                                # PrivacyPage, TermsPage, NotFoundPage
  store/appState.ts            # zustand store — single source of truth for progress
  lib/
    scoring.ts                 # tier pass thresholds + green/yellow/red status logic
    dashboardStatus.ts          # UI-only re-read of progress into 4 display buckets
                                 # (unattempted/in-progress/completed/needs-review) —
                                 # does NOT change scoring.ts, see "UI status" below
    recommendation.ts          # "Weiter lernen" next-Lektion suggestion
    curriculumLoader.ts        # fetches Modul JSON; LEVEL_CATALOG + MODUL_CATALOG live here
    vocabPool.ts / vocabSrs.ts / vocabQuiz.ts / vocabGame.ts  # Wortschatz-Trainer engine
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

Routes: `/` (portal — three level cards, no lesson detail), `/levels/:levelId`
(one level's Moduln/Lektionen, `levelId` lowercase e.g. `a1`), `/lektion/:lektionId`
(mode-select → Übung or Test), `/vocab-trainer`, `/settings`, `/about`,
`/privacy`, `/terms`, and a `*` catch-all `NotFoundPage`. The Privacy/Terms pages are real,
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
all three tiers) and **Test** (instantly accessible). Navigation is
intentionally open end to end — vocab, all three practice tiers, and Test
are all reachable in any order, no lock icons, nothing disabled (adult
self-directed learners jump around freely). `scoring.ts` still computes
*mastery* the same way it always has (`TEST_MASTERY_THRESHOLD`, tier pass
thresholds); only the old navigation *gate* (`isTierUnlocked`) was removed —
don't reintroduce it. `LektionPage.tsx`'s practice-overview does keep one
soft, non-restrictive cue: the first not-yet-done tier gets a brand-accent
highlight as a "start here" suggestion, but every row is equally clickable.

All 8 Moduln (24 Lektionen) are built for A1, A2, and B1 as of this
writing — the pilot (`a1-m1`) validated the architecture before scaling to
the rest. C1/C2 aren't authored yet; `LEVEL_CATALOG`/the modul schema's
`level` enum only cover A1–B1 today. See
[`.agents/pipeline.md`](.agents/pipeline.md) to author more.

### Vocabulary linguistic profiles

`VocabularyItem` (`src/types/content.ts`) carries more than term↔translation:
nouns get `gender` + `plural` (the `term` string already includes the
article, e.g. `"das Vertrauen"` — don't re-prepend it when building a
prompt, see `vocabQuiz.ts`'s gender-quiz item for the pattern), and verbs get
`preterite` (3rd-person Präteritum), `participle` (Partizip II *alone*,
without its auxiliary), `auxiliary` (`'haben' | 'sein'`), and `irregular`.
All four verb fields and `plural` are optional — omitted for content that
hasn't been backfilled yet (only B1's vocabulary carries the full profile as
of this writing; A1/A2 are unaffected and still work, they just don't
generate the extra quiz item types below). `VocabFlashcards.tsx` renders the
principal-parts row when present; `vocabQuiz.ts`'s `buildVocabQuizItems`
generates one bonus graded item per eligible word (article, plural,
Präteritum, Partizip II, or auxiliary — chosen at random, not all at once,
to keep session length bounded) alongside the base translation item, reusing
the existing `multiple-choice`/`fill-in-blank` `ExerciseItem` shapes rather
than adding new exercise types.

### UI status vs. scoring status

`LektionStatus` (`red`/`yellow`/`green`, `scoring.ts`) is the real,
persisted mastery state — don't touch it for a UI-only change.
`dashboardStatus.ts`'s `getDisplayStatus` is a separate, purely
presentational re-read of `LektionProgressEntry` into four UI buckets
(`unattempted`/`in-progress`/`completed`/`needs-review`), used by
`LessonStatusBadge`/`LessonStatusNode` everywhere a status shows on screen.
The point is to never show red on content nobody has touched yet — red is
reserved for `needs-review`, a *mastered* Lektion whose representative score
fell under a threshold. If you add a new place that displays Lektion status,
go through `getDisplayStatus`, not raw `progress.status`.

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
- **Linguo the mascot** (`src/components/mascot/`) is one sprite sheet
  (`src/linguo_sprites.jpeg`, a 4x4 grid of expressions) sliced purely via
  CSS `background-position` in `LinguoAvatar.tsx` — no per-expression image
  assets to keep in sync. `animate="pop"` is a one-shot settle-in animation
  for a fresh mount; there's no looping/idle animation on purpose (an
  earlier infinite rock/tilt loop read as an animation bug, not "alive" —
  don't reintroduce a continuous loop here). `LinguoFeedbackDrawer` is the
  bottom-sheet reaction after grading an `ExerciseRunner` item;
  `LinguoLevelBanner` is the speech-bubble intro at the top of a Level Hub
  page; `LinguoLaunchOverlay` is the brief full-screen "presenting the
  activity" beat shown before vocab/a practice tier/Test actually mounts —
  wired in via each page's own `launchTarget` state (see `LektionPage.tsx`'s
  `enterActivity` and `VocabTrainerPage.tsx`'s equivalent), not a route-level
  transition. Only use it for genuine "opening an activity" moments, not
  plain page navigation (mode-select ↔ practice-overview stays instant).
- **Multiple-choice auto-submits on selection** (`ExerciseRunner.tsx`) —
  clicking an option or pressing its 1–4 digit shortcut grades it
  immediately, no separate "Prüfen" confirmation step (that button is only
  rendered for free-text/scramble types, which do need an explicit submit).
  `handleSubmit` takes an optional answer-override parameter for exactly
  this — it's called with the just-clicked option directly rather than
  relying on `choiceValue` state, which wouldn't have updated yet in the
  same synchronous handler.
- **`ExerciseRunner`'s Enter-key listener is registered on the capture
  phase**, not bubble (`{ capture: true }`) — deliberate, so it fires
  regardless of anything downstream (e.g. Fluent's `Input`) potentially
  stopping propagation on its way back up. If you add another window-level
  keydown handler in an exercise-adjacent component, prefer capture there
  too rather than assuming bubble-phase will reach you.
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
