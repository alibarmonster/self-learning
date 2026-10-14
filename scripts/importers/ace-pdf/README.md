# ACE PDF importer

Turns the community "GCP ACE Questions Dumps" PDF (667 questions) into
`src/exams/ace/questions/*.ts`. Kept for provenance and for regenerating the
bank; it is not part of the build.

1. `pdftotext -layout <pdf> ace.txt`
2. `python3 parse.py` → `parsed.json` — questions, options and keys. Explanations
   the PDF prints after some keys are dropped.
3. `python3 clean.py` → `clean.json` — strips quiz-site residue ("Your answer is
   incorrect", leading `*`) and mis-encoded quotes.
4. `python3 fixups.py` → `final-input.json` — hand fixes: the two diagram
   questions (23, 254) get the diagram described in words, 360 gets its YAML
   as a code block, 136 loses a duplicated option, and 567 (a word-for-word
   repeat of 419) is dropped.
5. Review: `final-input.json` was split into chunks of 56 and each chunk reviewed
   by following `INSTRUCTIONS.md` (key check, section, topic, difficulty,
   explanation). Every question that was changed or rated below high
   confidence then got an independent pass following `SECOND-OPINION.md`.
6. `python3 adjudicate.py` → `final.json` — the final decisions where the two
   passes disagreed (33, 257, 530).
7. `python3 build.py <repo>/src/exams/ace/questions` writes one file per section.

The intermediate JSON files are not committed, so the generated question files
are now the source of truth: fix a key or an explanation by editing them
directly.
