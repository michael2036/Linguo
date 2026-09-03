# Content Authoring Agents

Linguo ships with zero backend, so there is no runtime "agent" inside the
product — Linguo the character is alive in the app's voice and UI, not as a
server process. The agents documented here run **offline, before a Modul is
committed to the repo**, and their job is to turn one Modul's Kursbuch +
Arbeitsbuch answer keys into a validated `modul-<N>.json` file under
`public/data/<level>/`.

This directory is the machine-readable spec for that pipeline — written so
any coding agent (Claude, or otherwise) can pick it up and execute the
workflow directly, without a human re-explaining it first.

## Roster

| File | Role | Consumes | Produces |
|---|---|---|---|
| [`didactic-generator.md`](didactic-generator.md) | Agent 1 — Senior DaF Curriculum Designer | Kursbuch + Arbeitsbuch answer keys, Lektion syllabus | Raw `vocabulary` + `practice` (unvalidated) |
| [`pedagogical-critic.md`](pedagogical-critic.md) | Agent 2 — CEFR Quality Inspector & Linguistic Auditor | Raw output from Agent 1 or Agent 3 | Validated, schema-conformant JSON — runs twice per Lektion |
| [`test-item-writer.md`](test-item-writer.md) | Agent 3 — Assessment Item Writer | Validated `grammarFocus` + `vocabulary` only (never `practice`) | Raw `test` bank for Direct Test Mode |

## Orchestration

See [`pipeline.md`](pipeline.md) for the end-to-end run book: how the three
agents chain together (Agent 2 runs twice — once auditing Agent 1, once
auditing Agent 3), the handoff contract between them, where the output lands
in the repo, and how to wire a finished Modul into the app.

## Contract this pipeline must satisfy

This is the executable form of PRD [§7 "Agentic Content Authoring
Pipeline"](../PRD.md#7-agentic-content-authoring-pipeline), extended for the
Level → Modul → Lektion architecture (see [AGENTS.md](../AGENTS.md) for why
that architecture exists). Any output must:

1. Validate against [`public/schemas/modul-schema.json`](../public/schemas/modul-schema.json).
2. Contain zero verbatim text reproduced from either source book — every
   sentence is original and merely targets the same grammar point.
3. Match its declared `level` (A1/A2/B1) — no structures the learner hasn't
   been introduced to yet at that level.
4. Have exactly one unambiguous correct `solution` per exercise item.
5. Carry a rule-based `explanation` for every item, and a `hint` for most
   `practice` items — see
   [PRD §4.3](../PRD.md#43-pedagogical-engine--scaffolding-model).
6. Keep `test` genuinely independent of `practice` — not a reworded rerun of
   the same items (see `pedagogical-critic.md`'s §7).
