---
agent: grammar-card-writer
role: Grammar Card Author
consumes: a topic from the agreed card list, plus the grammarFocus of the Lektionen that teach it
produces: one entry in public/data/grammar/cards.json
---

# Grammar Card Writer

Linguo accompanies an intensive course: the teacher explains the grammar.
A card is a **reminder**, not a lesson. It must fit one phone screen
(390 × 844) on both sides without scrolling.

## Shape of a card

- `title`: the topic as a short question or name ("legen oder liegen?",
  "Präpositionen mit Dativ"). One or two lines at 26px.
- `subtitle`: one plain sentence, one line.
- `visual`: exactly one of
  - `columns` (1–2): a contrast (Akkusativ vs. Dativ, obwohl vs. trotzdem).
    Big words by default; `lines: true` for short sentences; `inline: true`
    for word lists (prepositions) that should wrap as chips.
  - `table` (2–3 columns, ≤ 4 rows): patterns such as verb position.
- `tip` (optional): one line of extra memory help.
- `examples`: 1–2, each ≤ 1 line. `result` shows a before/after pair.
- `warning`: the single most common learner mistake, its fix, and a
  4–6 word reason.
- `back.sections`: ≤ 3 short sections of forms or extras; `back.check`:
  2–3 self-check prompts with answers.

## Highlighting

`[x]` marks the first tone (Akkusativ, action, the thing to notice) and
`{x}` the second (Dativ, state, the contrast). Use the same tone for the
same meaning across a card — the colors do the explaining.

## Rules

- German throughout, level-appropriate vocabulary, original sentences.
- Link `lektionIds` only to Lektionen whose `grammarFocus` teaches the
  topic; leave it empty for core topics the course uses but never teaches
  on its own.
- Validate against `public/schemas/grammar-cards-schema.json` (it enforces
  the length limits), then open the card at 390 × 844 and check both sides
  fit above the bottom navigation. Shorten wording before shrinking type.
