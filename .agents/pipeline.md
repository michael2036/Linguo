---
pipeline: content-authoring
stages:
  - didactic-generator.md
  - pedagogical-critic.md
output: public/data/<course-id>/chapter-XX.json
---

# Content Authoring Pipeline — Run Book

End-to-end steps for turning one workbook chapter's answer key into a
chapter pack the app can load. This runs offline, once per chapter, before
anything is committed — there is no server-side agent in the shipped product.

## 0. Prerequisites

- The answer key (*Lösungsschlüssel*) pages for the chapter, as extracted
  text (OCR/PDF-to-text is fine — Agent 1 only needs the text, not the
  layout).
- Chapter metadata decided up front: `book`, `chapterNumber`, `title`,
  `targetLevel` (A1–C1), and a short list of `grammarFocus` points for the
  chapter.
- A `courseId` for where this chapter lives, e.g. `deutsch-a1` — reuse an
  existing one under `public/data/` or introduce a new one for a new
  book/level track.

## 1. Run Agent 1 — Didactic Generator

Give an AI coding agent the contents of
[`didactic-generator.md`](didactic-generator.md) as its instructions, along
with the answer-key text and chapter metadata from step 0. It returns one
raw chapter JSON object (see that file for the exact shape).

Do not skip straight to writing this into the repo — it hasn't been audited
yet.

## 2. Run Agent 2 — Pedagogical Critic & Auditor

Hand the raw JSON from step 1 to a fresh agent run using
[`pedagogical-critic.md`](pedagogical-critic.md) as its instructions. It
returns the corrected, validated chapter JSON — this is the artifact that
ships.

If you're running both stages in one session with the same agent, still
treat them as two distinct passes with two distinct instruction sets: don't
let the generator self-grade its own output in the same breath it wrote it.
The value of the second pass is a genuinely independent read.

## 3. Validate structurally

Before committing, confirm the output actually matches
[`chapter-schema.json`](../public/schemas/chapter-schema.json). Any JSON
Schema validator works, e.g.:

```bash
npx ajv-cli validate -s public/schemas/chapter-schema.json -d path/to/new-chapter.json
```

(Agent 2's checklist covers this by hand, but a structural validator catches
typos — a missing `id`, an `options` array missing the `solution` — that are
easy to miss on a careful read.)

## 4. Place the file

Save the validated JSON as:

```
public/data/<courseId>/chapter-<NN>.json
```

matching the pattern of the existing sample,
[`public/data/deutsch-a1/chapter-01.json`](../public/data/deutsch-a1/chapter-01.json).

## 5. Register the chapter in the app

Add an entry to `CHAPTER_CATALOG` in
[`src/lib/chapterLoader.ts`](../src/lib/chapterLoader.ts):

```ts
{
  courseId: '<courseId>',
  chapterId: '<chapterId>',       // must match chapterId inside the JSON
  chapterNumber: <N>,
  title: '<title>',
  targetLevel: '<A1|A2|B1|B1+|B2|C1>',
  path: 'data/<courseId>/chapter-<NN>.json',
}
```

The app fetches chapter packs at runtime relative to `import.meta.env.BASE_URL`,
so no other wiring is needed — the new chapter appears on the home page as
soon as this entry exists and the dev server / build picks up the new JSON
file under `public/`.

## 6. Smoke-test it

Run the app (`npm run dev`) and play through the new chapter once: Stage 0
vocabulary primer, then all three exercise tiers. Confirm scores gate
progression as expected (see [PRD §4.3](../PRD.md#43-pedagogical-engine--scaffolding-model))
and that nothing renders empty (missing `hint`, malformed `scrambleChunks`,
etc. tend to show up immediately in the UI).
