# Content Authoring Agents

Linguo ships with zero backend, so there is no runtime "agent" inside the
product — Linguo the character is alive in the app's voice and UI, not as a
server process. The agents documented here run **offline, before a chapter is
committed to the repo**, and their only job is to turn a workbook answer key
into a validated `chapter-XX.json` file under `public/data/<course-id>/`.

This directory is the machine-readable spec for that pipeline — written so
any coding agent (Claude, or otherwise) can pick it up and execute the
workflow directly, without a human re-explaining it first.

## Roster

| File | Role | Consumes | Produces |
|---|---|---|---|
| [`didactic-generator.md`](didactic-generator.md) | Agent 1 — Senior DaF Curriculum Designer | Answer-key PDF text, chapter syllabus | Raw (unvalidated) chapter JSON |
| [`pedagogical-critic.md`](pedagogical-critic.md) | Agent 2 — CEFR Quality Inspector & Linguistic Auditor | Raw chapter JSON | Validated, schema-conformant chapter JSON |

## Orchestration

See [`pipeline.md`](pipeline.md) for the end-to-end run book: how the two
agents chain together, the handoff contract between them, where the output
lands in the repo, and how to wire a finished chapter into the app.

## Contract this pipeline must satisfy

This is the executable form of PRD [§7 "Agentic Content Authoring
Pipeline"](../PRD.md#7-agentic-content-authoring-pipeline). Any output must:

1. Validate against [`public/schemas/chapter-schema.json`](../public/schemas/chapter-schema.json).
2. Contain zero verbatim text reproduced from the source workbook — every
   sentence is original and merely targets the same grammar point.
3. Match its declared `targetLevel` (A1–C1) — no structures the learner
   hasn't been introduced to yet at that level.
4. Have exactly one unambiguous correct `solution` per exercise item.
5. Carry a rule-based `explanation` (and usually a `hint`) for every item —
   see [FR-12](../PRD.md#43-pedagogical-engine--scaffolding-model).
