# Input drop folder

Put the source material for a chapter here before running
[Agent 1](../didactic-generator.md) — the answer-key (*Lösungsschlüssel*) PDF
itself, or its extracted text.

## Naming

Match the `chapterId` the chapter will use, so it's obvious which input
produced which output:

```
.agents/input/deutsch-a1-ch02.pdf
.agents/input/deutsch-a1-ch02.txt   # or the extracted text, if you pre-extract it
```

## This folder's contents are never committed

Everything here except this README is gitignored on purpose (see the
`.agents/input/` rule in [`.gitignore`](../../.gitignore)). Answer-key PDFs
are copyrighted workbook material — per [`didactic-generator.md`](../didactic-generator.md)
they're only ever used as ephemeral input to infer *what* to teach, never
copied from, and the output (100% original exercises) is the only thing
that's meant to persist in the repo. Committing the source PDFs themselves
would defeat that boundary, so don't force-add them.

Once you've run the [pipeline](../pipeline.md) for a chapter, its input file
here can be deleted — nothing downstream depends on it sticking around.
