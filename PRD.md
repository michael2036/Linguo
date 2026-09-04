# Product Requirement Document (PRD): Linguo

**Title:** Linguo — Zero-Cost, Local-First Language Practice Platform
**Target Environments:** Standalone Mobile PWA (iOS/iPadOS Safari, Android Chrome) & Desktop Web App (macOS, Windows, Linux)
**Distribution:** GitHub Pages (Static Hosting, Zero Backend Infrastructure)
**UI Framework:** Microsoft Fluent UI v9 (`@fluentui/react-components`)
**Scope:** CEFR Levels A1 to C1 (German as initial target; Spanish as base/native interface)
**Document Purpose:** Functional & Technical Specification for Autonomous Code Generation Benchmark

---

## 1. Product Vision & Value Proposition

Linguo is a decentralized, zero-operating-cost language practice platform designed to transform textbook syllabi and workbook answer keys (*Lösungsschlüssel*) into high-retention digital training modules.

The platform targets learners who need intensive, structured drill cycles to bridge the gap between classroom theory and real-time linguistic retrieval. The system completely decouples content authoring from client runtime:

- **Offline Content Authoring:** A dual-agent AI pipeline ingests answer key PDFs, audits copyright boundaries, and outputs standardized static JSON files.
- **Client Runtime:** A static Single Page Application hosted on GitHub Pages, styled with Fluent UI v9, operating local-first with optional cross-device synchronization directly to the user's personal Google Drive.

---

## 2. Technical Stack & Infrastructure Requirements

### 2.1 Static Hosting Architecture (GitHub Pages)

- **TR-01 (Zero-Cost Hosting):** The application must compile entirely to static assets (HTML, CSS, JS, WASM, JSON) deployable to GitHub Pages under a sub-path (`https://<user>.github.io/<repo>/`).
- **TR-02 (Sub-Path Routing & Base Assets):** All asset URLs, scripts, and internal routes must support custom base path resolution (e.g., Vite `base: '/<repo>/'`) to avoid broken asset references when served from a GitHub Pages repository root.
- **TR-03 (Automated CI/CD):** Deployments must be orchestrated via GitHub Actions triggered on push to `main`, running dependency installation, build verification, and static deployment to the GitHub Pages environment.

### 2.2 Design System & Ergonomics (Fluent UI v9)

- **TR-04 (UI Library Integration):** The interface must be constructed using Microsoft Fluent UI v9 (`@fluentui/react-components` and `@fluentui/react-icons`).
- **TR-05 (Dynamic Theme Switching):** The UI must wrap all views within `FluentProvider` and dynamically toggle between light and dark themes based on system media queries (`prefers-color-scheme`).
- **TR-06 (Ergonomic Styling Pipeline):** All custom responsive styles, grids, and touch areas must be written using Fluent UI's native styling solution (`makeStyles`, `tokens`, and `shorthands`) without introducing conflicting utility CSS frameworks.

### 2.3 Identity & Decentralized Persistence (Google Drive API)

- **TR-07 (Client-Side Authentication):** User authentication must use Google Identity Services (GIS, `https://accounts.google.com/gsi/client`) via the browser-based Token Model (`google.accounts.oauth2.initTokenClient`), requiring only a public OAuth `client_id` (no client secrets).
- **TR-08 (Restricted App Scope):** The authorization request must be strictly confined to the `https://www.googleapis.com/auth/drive.appdata` scope. The application must never request access to the user's general Drive storage.
- **TR-09 (Dedicated Cloud Container):** Authenticated persistence must write to and read from a single file (`app_state.json`) stored within the hidden `appDataFolder` using direct browser `fetch` calls against the Google Drive REST API v3.
- **TR-10 (Silent Token Lifecycle):** Access tokens must be managed in memory. The system must attempt silent background refresh before issuing sync requests to prevent session disruption.

---

## 3. User Personas & Core Journeys

### 3.1 Personas

- **The Structured Student (Autonomous):** Enrolled in language courses or self-studying using structured textbooks. Requires systematic drills matching chapter curriculum without manual tracking overhead.
- **The Offline Commuter (Mobile-First):** Practices on an iPhone or iPad during transit without reliable internet. Demands instant touch responses, zero loading spinners, and full standalone Home Screen execution.
- **The Open-Source Contributor:** Teachers or developers who want to expand curriculum content by submitting modular JSON files via GitHub Pull Requests.

### 3.2 Core User Flows

1. **Zero-Friction First Run:** The user navigates to the GitHub Pages URL, selects a textbook/chapter, and begins practicing immediately in Guest Mode without sign-up screens or forms.
2. **Scaffolded Chapter Mastery:** The user completes the prerequisite Stage 0 vocabulary primer, which unlocks progressive exercise tiers (Easy → Medium → Hard). Dynamic traffic-light badges update chapter progress.
3. **Cloud State Linking:** The user connects their personal Google account. The client locates or initializes `app_state.json` in the user's `appDataFolder`, synchronizing offline and multi-device progress seamlessly.

---

## 4. Functional Requirements

### 4.1 Mode of Operation & Authentication

- **FR-01 (Guest Access):** The application must be 100% operational in local guest mode without requiring a login, authentication token, or remote network request.
- **FR-02 (Google Sign-In Trigger):** A prominent Fluent UI action button must initiate the Google GIS popup flow.
- **FR-03 (Account Decoupling):** Disconnecting the Google account must return the client to local-only guest mode without purging existing local progress unless explicitly requested by the user.

### 4.2 Offline Capability & State Synchronization

- **FR-04 (Local-First Priority):** Every state mutation (e.g., question answered, flashcard flipped, score updated) must write immediately to local browser storage (`IndexedDB` / `localStorage`) before any cloud synchronization attempt.
- **FR-05 (Offline Resilience):** The application must remain fully functional in offline environments (e.g., Airplane Mode). Network failures during synchronization must fail silently without blocking user progression.
- **FR-06 (Deferred Sync Trigger):** When mutations occur offline while connected to a Google account, the client must set an internal `syncPending: true` flag and flush pending mutations to Google Drive upon detecting the browser's `online` event.
- **FR-07 (Conflict Resolution Policy):** Cloud synchronization must adhere to a Last-Write-Wins strategy driven by an ISO-8601 `updatedAt` timestamp. Remote data overwrites local state only when its timestamp is strictly newer.

### 4.3 Pedagogical Engine & Scaffolding Model

Each chapter enforces a four-stage cognitive progression:

```
[Chapter Entry]
      │
      ▼
[Stage 0: Vocabulary Primer] ─────────> Lexical Flashcards (Must achieve ≥ 80% recognition)
      │
      ▼
[Stage 1: Foundation (Easy)] ─────────> Isolated rule recognition (Score ≥ 80% to advance)
      │
      ▼
[Stage 2: Application (Medium)] ──────> Contextual syntax & conjugation (Score ≥ 75% to advance)
      │
      ▼
[Stage 3: Cognitive Peak (Hard)] ─────> Structural transformation & error correction (Score ≥ 85%)
      │
      ▼
[Chapter Traffic Light: GREEN]
```

- **FR-08 (Stage 0: Vocabulary Primer):**
  - Present 15–25 curated terms per chapter.
  - Require a minimum mastery threshold (≥ 80%) before unlocking grammatical exercise tiers.
  - Display grammatical attributes: part of speech, grammatical gender, plural markers, native-language translation (Spanish), and an illustrative German context sentence.
  - Provide visual color coding for grammatical gender: Blue (*der*), Red (*die*), Green (*das*).
- **FR-09 (Stage 1: Foundation Tier):**
  - Present 10–15 items isolating a single structural rule (e.g., case recognition, preposition pairing).
  - Formats: Multiple-choice with plausible grammatical distractors or single-blank fills with word banks.
- **FR-10 (Stage 2: Application Tier):**
  - Present 10–15 items requiring active sentence construction matching workbook difficulty.
  - Formats: `sentence-scramble` (reconstructing valid clause order respecting *TeKaMoLo* and verb-final syntax) and `cloze-conjugation` (inflecting irregular verbs or adjectives from root stems without word banks).
- **FR-11 (Stage 3: Cognitive Peak Tier):**
  - Present 10–15 items requiring holistic rule synthesis and error detection.
  - Formats: `targeted-transformation` (e.g., active to passive voice, indirect speech to *Konjunktiv I*, nominalization) and `error-correction` (identifying and correcting planted errors in full sentences).
- **FR-12 (Formative Feedback & Hinting):**
  - Every exercise must provide an optional *Hint* that recalls the underlying rule without revealing the answer.
  - Upon submission, the interface must display an *Explanation* detailing the linguistic rule, explaining why the correct answer is valid and why alternatives fail.
- **FR-13 (Traffic-Light Mastery Tracking):**
  - **Red (Needs Work):** Overall score < 60% or incomplete vocabulary primer.
  - **Yellow (In Progress):** Vocabulary primer cleared; Stage 1 passed; Stage 2 completed with ≥ 60%.
  - **Green (Mastered):** Stages 1, 2, and 3 completed with individual scores meeting their respective passing thresholds.

---

## 5. UI/UX & Mobile Ergonomics Requirements

### 5.1 Form Factor & Viewport Ergonomics

- **UR-01 (Standalone Display Mode):** When launched from an iOS/iPadOS Home Screen or macOS Dock shortcut, the application must run in `standalone` display mode without Safari browser controls.
- **UR-02 (Hardware Obstruction Insetting):** The layout must use `viewport-fit=cover` and dynamically inset content around display cutouts, notches, Dynamic Islands, and the iOS Home Indicator using CSS safe-area boundaries:
  - Top navigation header: `padding-top: max(12px, env(safe-area-inset-top))`
  - Bottom thumb-navigation bar: `padding-bottom: max(8px, env(safe-area-inset-bottom))`
  - Lateral margins: `padding-left: env(safe-area-inset-left)`, `padding-right: env(safe-area-inset-right)`
- **UR-03 (Touch Target Minimums):** All interactive buttons, cards, and choice chips must provide an active tap area of at least 44 × 44 pt.
- **UR-04 (WebKit Touch Resets):** The viewport must suppress unintended double-tap zoom triggers, rubber-band page bounces, and tap-highlight flashes on interactive controls:

  ```css
  -webkit-touch-callout: none;
  -webkit-tap-highlight-color: transparent;
  user-select: none;
  overscroll-behavior-y: none;
  ```

- **UR-05 (Responsive Breakpoints):**
  - Mobile (iPhone Portrait): Single-column layout with primary interaction buttons anchored to the bottom thumb zone.
  - Tablet (iPad Portrait/Landscape): Two-column master-detail layout (chapter navigation list on the left, exercise card deck on the right).
  - Desktop (macOS / Chrome): Centered workspace container (`max-width: 960px`) with full keyboard navigation (Space to flip cards, 1–4 to select options, Enter to submit).

---

## 6. Data Contracts & Schemas

### 6.1 Application State Schema (`app-state-schema.json`)

Defines the structure of the data object stored locally and synchronized with Google Drive's `appDataFolder/app_state.json`:

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "title": "AppState",
  "type": "object",
  "required": ["version", "updatedAt", "preferences", "vocabularyProgress", "chapterProgress"],
  "properties": {
    "version": { "type": "integer", "enum": [1] },
    "updatedAt": { "type": "string", "format": "date-time" },
    "preferences": {
      "type": "object",
      "required": ["theme", "targetLanguage", "nativeLanguage"],
      "properties": {
        "theme": { "enum": ["system", "light", "dark"] },
        "targetLanguage": { "type": "string", "enum": ["de"] },
        "nativeLanguage": { "type": "string", "enum": ["es", "en"] }
      }
    },
    "vocabularyProgress": {
      "type": "object",
      "additionalProperties": {
        "type": "object",
        "required": ["repetitions", "lastReviewed", "mastered"],
        "properties": {
          "repetitions": { "type": "integer", "minimum": 0 },
          "lastReviewed": { "type": "string", "format": "date-time" },
          "mastered": { "type": "boolean" }
        }
      }
    },
    "chapterProgress": {
      "type": "object",
      "additionalProperties": {
        "type": "object",
        "required": ["vocabCompleted", "status", "levels"],
        "properties": {
          "vocabCompleted": { "type": "boolean" },
          "status": { "enum": ["red", "yellow", "green"] },
          "levels": {
            "type": "object",
            "required": ["easy", "medium", "hard"],
            "properties": {
              "easy": { "$ref": "#/definitions/tierScore" },
              "medium": { "$ref": "#/definitions/tierScore" },
              "hard": { "$ref": "#/definitions/tierScore" }
            }
          }
        }
      }
    }
  },
  "definitions": {
    "tierScore": {
      "type": "object",
      "required": ["completed", "score", "attempts"],
      "properties": {
        "completed": { "type": "boolean" },
        "score": { "type": "number", "minimum": 0, "maximum": 100 },
        "attempts": { "type": "integer", "minimum": 0 }
      }
    }
  }
}
```

### 6.2 Curriculum Chapter Schema (`chapter-schema.json`)

Defines the contract for static chapter packs generated by the content authoring pipeline and stored under `public/data/<course-id>/chapter-XX.json`:

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "title": "ChapterPackage",
  "type": "object",
  "required": [
    "chapterId",
    "book",
    "chapterNumber",
    "title",
    "targetLevel",
    "grammarFocus",
    "vocabulary",
    "exercises"
  ],
  "properties": {
    "chapterId": { "type": "string" },
    "book": { "type": "string" },
    "chapterNumber": { "type": "integer", "minimum": 1 },
    "title": { "type": "string" },
    "targetLevel": { "enum": ["A1", "A2", "B1", "B1+", "B2", "C1"] },
    "grammarFocus": {
      "type": "array",
      "items": { "type": "string" }
    },
    "vocabulary": {
      "type": "array",
      "minItems": 15,
      "maxItems": 30,
      "items": {
        "type": "object",
        "required": ["id", "term", "translation", "partOfSpeech", "example"],
        "properties": {
          "id": { "type": "string" },
          "term": { "type": "string" },
          "translation": { "type": "string" },
          "partOfSpeech": { "enum": ["noun", "verb", "adjective", "adverb", "phrase"] },
          "gender": { "enum": ["der", "die", "das", null] },
          "plural": { "type": "string" },
          "example": { "type": "string" }
        }
      }
    },
    "exercises": {
      "type": "object",
      "required": ["easy", "medium", "hard"],
      "properties": {
        "easy": {
          "type": "array",
          "minItems": 10,
          "maxItems": 15,
          "items": { "$ref": "#/definitions/exerciseItem" }
        },
        "medium": {
          "type": "array",
          "minItems": 10,
          "maxItems": 15,
          "items": { "$ref": "#/definitions/exerciseItem" }
        },
        "hard": {
          "type": "array",
          "minItems": 10,
          "maxItems": 15,
          "items": { "$ref": "#/definitions/exerciseItem" }
        }
      }
    }
  },
  "definitions": {
    "exerciseItem": {
      "type": "object",
      "required": ["id", "type", "instruction", "prompt", "solution", "explanation"],
      "properties": {
        "id": { "type": "string" },
        "type": {
          "enum": [
            "multiple-choice",
            "fill-in-blank",
            "sentence-scramble",
            "cloze-conjugation",
            "targeted-transformation",
            "error-correction"
          ]
        },
        "instruction": { "type": "string" },
        "prompt": { "type": "string" },
        "options": {
          "type": "array",
          "items": { "type": "string" }
        },
        "scrambleChunks": {
          "type": "array",
          "items": { "type": "string" }
        },
        "solution": { "type": "string" },
        "hint": { "type": "string" },
        "explanation": { "type": "string" }
      }
    }
  }
}
```

---

## 7. Agentic Content Authoring Pipeline

Content generation is executed entirely offline using an automated AI agent pair. The pipeline ingests workbook answer key PDFs (*Lösungsschlüssel*) and syllabi, synthesizes exercise drills, audits linguistic correctness, and produces validated static JSON files.

The implementation of this pipeline — as concrete, invokable agent specs — lives in [`.agents/`](.agents); this section defines the contract those specs must satisfy.

```
+-----------------------------------------------------------------------------+
| AGENT 1: Didactic Generator Agent                                           |
+-----------------------------------------------------------------------------+
| Input: Chapter Syllabus + Answer Key PDF Text Extraction                    |
| Operations:                                                                 |
|   1. Extract target grammar rules and key vocabulary.                       |
|   2. Create 100% original exercise sentences (strictly zero verbatim        |
|      reproduction of protected workbook texts).                             |
|   3. Structure content across Easy, Medium, and Hard tiers.                 |
|   4. Supply hints and formative linguistic explanations for every item.     |
| Output: Unvalidated Raw Chapter JSON.                                       |
+-----------------------------------------------------------------------------+
                                      │
                                      ▼
+-----------------------------------------------------------------------------+
| AGENT 2: Pedagogical Critic & Auditor Agent                                 |
+-----------------------------------------------------------------------------+
| Input: Unvalidated Raw Chapter JSON                                         |
| Audit Protocol:                                                             |
|   1. Verify linguistic accuracy against official Duden standards.           |
|   2. Eliminate ambiguity (prompt must allow ONLY the specified solution).   |
|   3. Verify alignment with target CEFR level (A1 to C1).                    |
|   4. Confirm absence of copyrighted textbook phrases.                       |
|   5. Validate structural adherence to chapter-schema.json.                  |
| Output: Validated Production-Ready Chapter JSON.                            |
+-----------------------------------------------------------------------------+
```

### 7.1 Agent 1 Specification: Didactic Generator

- **Role:** Senior DaF Curriculum Designer & Content Creator.
- **Directives:**
  - Ingest the raw textual output from workbook answer keys.
  - Synthesize original contextual scenarios targeting the grammatical concepts tested in the answer keys (e.g., dual prepositions, passive voice with modals, two-part connectors).
  - Ensure all vocabulary items contain complete morphological markers (gender, plural forms).
  - Never copy original textbook sentences verbatim; produce derivative, original drill items.

### 7.2 Agent 2 Specification: Pedagogical Critic & Quality Auditor

- **Role:** CEFR Quality Inspector & Linguistic Auditor.
- **Directives:**
  - Confirm that solutions are unique and unambiguous within the given prompt context.
  - Audit target language level to ensure lower-level chapters do not include unintroduced advanced structures.
  - Verify that explanations explicitly state the underlying grammatical rule.
  - Return exclusively the finalized, sanitized JSON artifact conforming to `chapter-schema.json`.

---

## 8. Benchmark Acceptance Criteria

An autonomous agent tasked with generating the complete web application from this PRD must meet the following criteria:

1. **Static Build & Sub-Path Deployment:** The project builds into static assets deployable to GitHub Pages under a sub-path (`/<repo>/`) with zero server-side infrastructure.
2. **Design System Adherence:** The UI strictly uses Fluent UI v9 (`@fluentui/react-components`), respects system light/dark modes dynamically, and provides responsive layouts for mobile, tablet, and desktop viewports.
3. **Ergonomic Safe-Area Compliance:** When launched in standalone PWA mode on iOS/iPadOS, the application dynamically insets around notches and home indicators, respecting minimum 44 × 44 pt touch bounding targets.
4. **Offline Autonomy:** The PWA remains fully functional in Airplane Mode, running vocabulary flashcards and evaluating exercises with zero network requests.
5. **Decentralized Cloud Sync:** Connecting a Google account requests only the `drive.appdata` scope, successfully reads and writes `app_state.json` inside the hidden `appDataFolder`, and applies Last-Write-Wins conflict resolution based on `updatedAt`.
6. **Scaffolding Progression Enforcement:** Chapter exercises remain locked until the Stage 0 vocabulary primer achieves ≥ 80% mastery; completing all three tiers with passing scores updates the chapter indicator to Green.

---

## 9. Architecture Revision: Level → Modul → Lektion

Following a full audit of 14 real Kursbuch + Arbeitsbuch answer-key PDFs
(the "Momente" series, Hueber Verlag) across A1, A2, and B1, the original
flat "course → chapter" content model in §6.2 was replaced with a hierarchy
matching the source material's own structure, and the single-track
scaffolding model in §4.3 was split into two independent pathways. This
section is authoritative where it conflicts with §4.3/§6/§7; those sections
otherwise still describe the underlying pedagogical philosophy correctly.

### 9.1 Content hierarchy

```
Level (A1 / A2 / B1)
 └─ Modul (1-8, numbered continuously across the level's two half-books)
     └─ Lektion (exactly 3 per Modul — a fixed structural fact of the
         source series, not a design choice)
```

A Lektion is the smallest directly-selectable unit — the user reaches it in
at most two taps from the home page (Level section is already expanded;
tap a Modul card's Lektion row). No separate "choose Kursbuch or
Arbeitsbuch" navigation step exists: both source books feed one merged
content pool per Lektion (§9.2), so the learner never has to decide which
book they want to practice from.

### 9.2 Practice content sourcing

Each Lektion's `practice` tiers merge both source books, rather than
treating Kursbuch and Arbeitsbuch as parallel, separately-navigable content:

- **`easy`** draws on the **Kursbuch's** thematic, contextual exercises.
- **`medium`** / **`hard`** draw on the **Arbeitsbuch's** own native
  `leicht` / `schwer` difficulty split — a real, source-provided tiering
  rather than one invented for the app.

The Stage 0 → easy → medium → hard gating from §4.3 is unchanged within
Practice mode.

### 9.3 Direct Test Mode

Each Lektion additionally has a `test` item bank: a separate, originally-
authored assessment (never derived from, or overlapping with, `practice`)
that is reachable **instantly, with zero gating** — no vocabulary primer or
practice tier is required first. This is a deliberate second pathway
alongside Practice, not a reward for completing it:

- Entering Test Mode does not require any Practice progress.
- A sufficiently strong Test score (see `TEST_MASTERY_THRESHOLD` in
  `src/lib/scoring.ts`) can move a Lektion's mastery status to Green on its
  own, independent of Practice tier completion — giving the diagnostic
  "fast-track" value described in the original Phase 3 requirement.
- Test content is authored by a dedicated third pipeline agent (Test Item
  Writer) that never sees the Practice items, so the two stay genuinely
  independent rather than one being a reshuffle of the other. See
  [`.agents/test-item-writer.md`](.agents/test-item-writer.md).

### 9.4 Rollout

The architecture was validated with a single pilot Modul (`a1-m1`, 3
Lektionen) before any further content was authored. Scaling to the full 8
Moduln × 3 levels is expected to happen incrementally via the pipeline in
[`.agents/pipeline.md`](.agents/pipeline.md), not as a single batch.

---

## 10. v1 Revision: Vocabulary Linguistic Profiles & Student Simulation

Moving from functional MVP to a shippable v1 surfaced two gaps: the
vocabulary model only stored bare term↔translation pairs (no way to test a
noun's plural or a verb's principal parts), and the content-authoring
pipeline's quality gate reviewed exercises with the answer already in view,
which misses items that are only ambiguous or trivially guessable to
someone actually attempting them cold. This section is authoritative where
it conflicts with §6.2/§7; those sections otherwise still describe the
underlying content model and pipeline structure correctly.

### 10.1 Vocabulary schema extension

`vocabularyItem` (§6.2, and the authoritative `public/schemas/modul-schema.json`)
gains four optional properties, all additive and backward-compatible —
existing content without them is still valid and renders exactly as before:

```json
"preterite": { "type": "string" },
"participle": { "type": "string" },
"auxiliary": { "enum": ["haben", "sein"] },
"irregular": { "type": "boolean" }
```

`preterite` is the 3rd-person-singular Präteritum (e.g. `"sah"`);
`participle` is the Partizip II alone, without its auxiliary (e.g.
`"gesehen"`, not `"hat gesehen"` — the app composes the two using
`auxiliary`). `plural` (already part of the schema) becomes the expected
norm for common countable nouns going forward, not just an occasional
extra. Nouns without a natural plural (abstract/mass nouns like *das
Vertrauen*, *die Politik*) correctly omit it, same as the existing allowance
for articleless nouns to omit `gender`.

The Wortschatz-Trainer's flashcard primer displays the fuller profile when
present (principal-parts row, regularity tag); its graded Test Mode
generates one additional grammatical item per eligible word — article,
plural, Präteritum, Partizip II, or auxiliary, chosen at random rather than
all at once — alongside the existing translation item, reusing the
`multiple-choice`/`fill-in-blank` exercise shapes rather than introducing
new ones.

As of this revision, B1's vocabulary (8 Moduln, 24 Lektionen) carries the
full profile; A1/A2 do not yet and are unaffected (the new fields are
optional, so existing content simply doesn't generate the extra quiz item
types until backfilled). Backfilling the remaining two levels is expected
to happen incrementally, the same rollout philosophy as §9.4.

### 10.2 Student simulation in the Pedagogical Critic

Rather than introduce a fourth pipeline agent, [Agent 2's
spec](.agents/pedagogical-critic.md) was extended with an explicit
methodology: before running its audit checklist on any item, it first
attempts to solve that item *blind* — `type`/`instruction`/`prompt`/
`options` only, with `solution`/`hint`/`explanation` covered, the way an
active learner at the target CEFR level actually would sitting down to it
cold. Only after that blind attempt does it reveal the real solution and
compare. Two checks are built directly on this evidence rather than a
read-through judgment call:

- **Unambiguous solutions** (§7.2, existing) — did the blind attempt
  converge on the one credited answer?
- **Answer leakage** (new) — did the blind attempt land on the right answer
  *without actually applying the grammar point being tested* (a single
  grammatically well-formed option, the answer legible in the instruction
  or a parenthetical, a surface pattern giving it away)? An item can pass
  the ambiguity check and still fail this one — leakage means the item
  isn't testing anything, regardless of whether it has one clean answer.

The pipeline's stage count, roster, and hand-off contract (§7, `.agents/pipeline.md`)
are otherwise unchanged — this is a strengthening of Agent 2's existing
audit protocol, not a new stage.
