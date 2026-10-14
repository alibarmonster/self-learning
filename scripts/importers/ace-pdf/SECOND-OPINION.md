# Second opinion on ACE answer keys

Each item has a question, the PDF dump's key (`pdf_key`), the key a first
reviewer proposes (`proposed_key`, sometimes different from the PDF) and that
reviewer's note. Give an **independent** judgement of the single best answer
under current Google Cloud documentation and Google-recommended practice, the
way the real Associate Cloud Engineer exam would grade it. Do not defer to
either key; reason from the stem's constraints (fewest steps, least
privilege, cost, recommended practice, managed/serverless preference).

Output `/home/claude/work/ace/verify/out_N.json`: a JSON array, one object per
item, same order:

{"n": 33, "best": "A", "agree_with": "pdf" | "proposed" | "both" | "neither", "certainty": "high" | "medium" | "low", "why": "one or two sentences"}

`best` has the same number of letters as the keys (multi-select stays
multi-select), alphabetical. Validate the JSON before finishing. Reply with a
list of items where `best` differs from `proposed_key`, with one-line reasons.
