# Input drop folder

Put the source material here before running
[Agent 1](../didactic-generator.md) — the Kursbuch and Arbeitsbuch
answer-key (*Lösungsschlüssel*) PDFs, or their extracted text.

## Naming

Source PDFs are typically published per half-book (12 Lektionen / 4 Moduln
at a time), not per Modul, so name them after the level and book type
rather than trying to match one Modul:

```
.agents/input/a1-1-kb.pdf     # Kursbuch, Lektion 1-12 (Modul 1-4)
.agents/input/a1-1-ab.pdf     # Arbeitsbuch, same range
.agents/input/a1-2-kb.pdf     # Kursbuch, Lektion 13-24 (Modul 5-8)
.agents/input/a1-2-ab.pdf     # Arbeitsbuch, same range
```

When running the pipeline for one Modul, just read the 3 Lektionen's worth
of pages you need out of the relevant PDF — no need to split the file
itself first.

**Watch for duplicate editions.** Some levels (B1 in particular) ship a
second Arbeitsbuch PDF branded for a specific exam track (e.g. "Ausgabe
DTZ") that turns out to be identical content to the standard Arbeitsbuch.
Spot-check a page or two before treating two similarly-named PDFs as two
different sources — running the pipeline twice on the same content wastes a
pass and can introduce needless near-duplicate exercises.

## This folder's contents are never committed

Everything here except this README is gitignored on purpose (see the
`.agents/input/` rule in [`.gitignore`](../../.gitignore)). Answer-key PDFs
are copyrighted workbook material — per [`didactic-generator.md`](../didactic-generator.md)
they're only ever used as ephemeral input to infer *what* to teach, never
copied from, and the output (100% original exercises) is the only thing
that's meant to persist in the repo. Committing the source PDFs themselves
would defeat that boundary, so don't force-add them.

Once you've run the [pipeline](../pipeline.md) for every Modul a PDF covers,
it can be deleted — nothing downstream depends on it sticking around.
