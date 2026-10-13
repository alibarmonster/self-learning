# ExamTopics importer

One-off scripts that turned pasted ExamTopics dumps into
`src/exams/cdl/questions/community.js`. They are kept for provenance, not as
part of the build.

- `import-examtopics-parseN.py` reads one raw dump and writes `parsedN.json`.
  Parses 1–5 point at the paste files of the session they were written in;
  only `examtopics-dump6.txt` is kept here.
- `import-examtopics.py` built the first 100 questions; each
  `import-examtopics-mergeN.py` execs the previous script's data section
  (everything above `def js(s):`) and appends the next dump, so the latest
  merge script holds every hand-written explanation.
- Output is `community.js` in the working directory; copy it over the bank.

When you edit an explanation by hand, change it in `community.js` (escape
`'` as `\'`) and in the merge script that owns that question, or the next
regeneration will undo it.
