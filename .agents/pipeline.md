---
pipeline: content-authoring
stages:
  - didactic-generator.md
  - pedagogical-critic.md (pass 1: vocabulary + practice)
  - test-item-writer.md
  - pedagogical-critic.md (pass 2: test)
output: public/data/<level>/modul-<N>.json
---

# Content Authoring Pipeline — Run Book

End-to-end steps for turning one Modul's worth of Kursbuch + Arbeitsbuch
answer keys into a Modul pack the app can load. This runs offline, once per
Modul, before anything is committed — there is no server-side agent in the
shipped product.

A Modul is always exactly 3 Lektionen (see [AGENTS.md](../AGENTS.md) for
why). Run steps 1–4 once **per Lektion**, then assemble all 3 into one Modul
file (step 5).

## 0. Prerequisites

- Both source books' answer-key pages for this Modul — drop the PDFs into
  [`.agents/input/`](input) named after the level and book type, e.g.
  `.agents/input/a1-modul1-kb.pdf` and `.agents/input/a1-modul1-ab.pdf`. See
  [`.agents/input/README.md`](input/README.md) — that folder is gitignored
  on purpose, since the source material is copyrighted and only ever used as
  ephemeral input.
- Metadata decided up front for the Modul: `level` (A1/A2/B1), `modulNumber`
  (1–8), a thematic `title`, and each of its 3 Lektionen's number + title.

## 1. Run Agent 1 — Didactic Generator

For each Lektion, give an AI coding agent
[`didactic-generator.md`](didactic-generator.md) as its instructions, along
with that Lektion's KB + AB answer-key content and metadata from step 0. It
returns one raw `{ vocabulary, practice }` object (no `test` yet — see that
file for the exact shape).

Do not skip straight to writing this into the repo — it hasn't been audited
yet.

## 2. Run Agent 2 — Pedagogical Critic & Auditor (pass 1)

Hand the raw output from step 1 to a fresh agent run using
[`pedagogical-critic.md`](pedagogical-critic.md) as its instructions. It
returns corrected, validated `vocabulary` + `practice` — this is what Agent
3 will build the test bank against.

Treat this as a genuinely independent pass: don't let the generator self-
grade its own output in the same breath it wrote it.

## 3. Run Agent 3 — Test Item Writer

Give a fresh agent [`test-item-writer.md`](test-item-writer.md) as its
instructions, along with the *validated* `grammarFocus` + `vocabulary` from
step 2 — deliberately **not** the `practice` items (see that file's
Directive 1 for why). It returns the `test` array.

## 4. Run Agent 2 again — Pedagogical Critic & Auditor (pass 2)

Hand Agent 3's `test` output, plus the finished `practice` content, to
another fresh Agent 2 run. This pass adds the independence check (§7 in
[`pedagogical-critic.md`](pedagogical-critic.md)): reject anything in `test`
that's a near-paraphrase of a specific `practice` item.

You now have one complete, validated Lektion object:
`{ lektionId, level, modulNumber, lektionNumber, title, grammarFocus,
vocabulary, practice, test }`.

## 5. Assemble the Modul and validate structurally

Combine all 3 Lektion objects into one Modul object:

```json
{
  "modulId": "<level>-m<modulNumber>",
  "level": "<A1|A2|B1>",
  "modulNumber": <N>,
  "title": "<thematic title>",
  "lektionen": [ /* exactly 3 Lektion objects */ ]
}
```

Then confirm it matches
[`modul-schema.json`](../public/schemas/modul-schema.json). Any JSON Schema
validator works, e.g.:

```bash
npx ajv-cli validate -s public/schemas/modul-schema.json -d path/to/new-modul.json
```

(Agent 2's checklist covers this by hand, but a structural validator catches
typos — a missing `id`, an `options` array missing the `solution` — that are
easy to miss on a careful read.)

## 6. Place the file

Save the validated JSON as:

```
public/data/<level>/modul-<N>.json
```

lowercased, matching the pattern of the existing pilot,
[`public/data/a1/modul-1.json`](../public/data/a1/modul-1.json).

## 7. Register the Modul in the app

Add an entry to `MODUL_CATALOG` in
[`src/lib/curriculumLoader.ts`](../src/lib/curriculumLoader.ts):

```ts
{
  modulId: '<level>-m<N>',
  level: '<A1|A2|B1>',
  modulNumber: <N>,
  title: '<thematic title>',
  path: 'data/<level>/modul-<N>.json',
  lektionen: [
    { lektionId: '<...-l1>', lektionNumber: <N>, title: '<...>' },
    { lektionId: '<...-l2>', lektionNumber: <N>, title: '<...>' },
    { lektionId: '<...-l3>', lektionNumber: <N>, title: '<...>' },
  ],
}
```

If it's the first Modul for a new `level`, also add that level to
`LEVEL_CATALOG` in the same file. The app fetches Modul packs at runtime
relative to `import.meta.env.BASE_URL`, so no other wiring is needed — the
new Moduln appear on the home page as soon as this entry exists and the dev
server / build picks up the new JSON file under `public/`.

## 8. Smoke-test it

Run the app (`npm run dev`) and play through each new Lektion once: the
vocabulary primer, all three practice tiers, and — separately — Direct Test
Mode entered straight from the Lektion screen without touching practice
first. Confirm:

- Practice tiers gate as expected (vocab → easy → medium → hard).
- Test Mode is reachable immediately, with no gating.
- A strong Test score alone can move the Lektion to Green (see
  `TEST_MASTERY_THRESHOLD` in `src/lib/scoring.ts`).
- Nothing renders empty (missing `hint`, malformed `scrambleChunks`, etc.
  tend to show up immediately in the UI).
