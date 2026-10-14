# Exam Prep

A personal, timed practice simulator for the exams I am sitting, built with Vite, Svelte 5 and TypeScript. Open
`http://localhost:5173`, pick an exam, and each one has its own question bank, timed presets, topic
drills, review screen and attempt history.

| Exam | Route | Shape of the full paper | Bank |
| ---- | ----- | ----------------------- | ---- |
| **Apple Developer Academy Indonesia** — Tech division online entry test | `#/apple` | 50 q · 120 min · Section 1 Logic then Section 2 Programming | 448 |
| **Google Cloud Digital Leader** certification | `#/cdl` | 50 q · 90 min · six domains mixed, multiple choice + multiple select | 475 |
| **Google Cloud Associate Cloud Engineer** certification | `#/ace` | 50–60 q · 120 min · five sections mixed, multiple choice + multiple select | 666 |

An exam can also ship with only a cheat sheet: with no `modes`, `defineExam` marks it `studyOnly` and
entering it opens the sheet. ACE started that way; it now has a full bank (see *The ACE bank* below).
JLPT is next — see *Adding an exam* below.

> Unofficial study aids. Not affiliated with, endorsed by, or produced by Apple Inc., the Apple
> Developer Academy, or Google LLC. None of the questions are real test questions — they are written
> to match the published exam guide (CDL) or the topics applicants report (Academy).

## Running it

The project uses [Bun](https://bun.sh) (1.3 or newer) as its package manager and script runner.

```bash
bun install
bun run dev       # http://localhost:5173 — the exam picker
bun run build     # production bundle in dist/
bun run preview   # serve the production bundle
bun run check     # svelte-check + tsc — zero type errors expected
bun run validate  # sanity-check every exam's question bank
```

## Deploying

It is a static site with hash routing, so any static host works and no SPA rewrite rules are
needed. **Put the password on the host, never in the app** — everything in `dist/` is public by
definition. The repo is set up for **Vercel**: `vercel.json` holds the build and security headers, and
`middleware.ts` asks for a username and password (`BASIC_AUTH_USER` / `BASIC_AUTH_PASSWORD`, set as
Vercel environment variables) before any file is served — free on the Hobby plan. See
[docs/deployment.md](docs/deployment.md) for the steps, and for Cloudflare Pages + Access as the
alternative.

## Storage — why there is no database

There is no database, no server and no API. The app is a static site: `bun run build`
produces one JS file, one CSS file and an `index.html`, and once that is loaded it makes **no
network requests at all**. The question banks are plain JavaScript modules compiled into the
bundle, so a paper is drawn in the browser from data that is already there.

Everything you generate is kept in `localStorage`, four keys per exam, namespaced by the exam's
`storagePrefix` (`ada-`, `cdl-`, `ace-`):

| Key | Holds |
| --- | ----- |
| `<prefix>-quiz-session-v1` | the paper in progress, so it can be resumed |
| `<prefix>-quiz-history-v1` | the score row for the last 25 attempts |
| `<prefix>-quiz-papers-v1` | the last 6 finished papers in full, so they can be reviewed again |
| `<prefix>-quiz-picks-v1` | how you have answered each question across sittings |

Why this is the right shape here, not a shortcut:

- **One person, one browser.** A database earns its place when several people share data, or one
  person needs the same data on several devices. Neither is true: this is a study tool for one
  person, and the data is small — six CDL papers come to roughly 250 KB against a 5 MB quota.
- **The expensive part is already static.** The 923 questions never change at runtime. Putting
  them in a database would mean a server, a schema, a query layer and a deploy pipeline to serve
  content that a CDN serves for free.
- **It stays free and cannot break.** No backend means nothing to pay for, patch, back up or wake
  up. The site works offline once loaded.

What you give up, stated plainly:

- **Clearing site data erases your progress.** There is no copy anywhere else.
- **Devices do not sync.** Your phone and your laptop keep separate histories.
- **Private windows forget everything** when closed.

Every read and write is wrapped in try/catch, so the app still works when storage is unavailable —
it simply cannot resume or remember. If cross-device sync ever matters, that is the point at which
a backend and a database become worth adding; nothing in the current design blocks it.

## Project layout

```
src/
  main.ts                    entry point — mounts App
  App.svelte                 shell, header, hash routing (#/, #/cdl, #/cdl/about, #/ace/cheatsheet), theme
  styles/global.css          design tokens (light/dark), per-exam accent, shared primitives
  core/                      exam-agnostic logic, no Svelte, no DOM
    answer.ts                isMulti, pickCount, isCorrect — single and multiple select
    blueprint.ts             fixed and [min, max] section counts, length labels
    exam.ts                  defineExam: lookup tables, topics, drillable topics
    paper.ts                 shuffling and the paper builders (mode, section, topic)
    index.ts                 re-exports the above as `@/core`
  state/
    quiz.svelte.ts           the Quiz store: current exam, paper, timer, scoring, review
    storage.ts               localStorage keys and safe read/write per exam
  utils/format.ts            clock, duration and date formatting, option letters
  types/                     the domain model: Question, Section, Mode, Exam, Cheatsheet, saved sessions
  components/
    QuestionView.svelte      one question, single or multiple select, answering or reveal mode
  views/                     one component per screen
    Picker.svelte            the landing page — one card per exam with its attempts and best score
    Home.svelte              an exam's start page: presets, topic drills, section drills, history
    Quiz.svelte              the test itself — timer, navigator, shortcuts
    Results.svelte           score ring and per-section breakdown
    Review.svelte            answer review with filters
    Cheatsheet.svelte        the per-exam cheat sheet with filter and jump nav
  exams/
    registry.ts              the list of exams (plain data — loadable by the validator)
    index.ts                 the same list with each exam's About page attached
    apple/                   index.ts, About.svelte, questions/
    cdl/                     index.ts, About.svelte, cheatsheet.ts, questions/
    ace/                     index.ts, cheatsheet.ts, questions/ (one file per exam-guide section)
scripts/
  validate-bank.ts           question bank sanity checks, across every exam
  importers/examtopics/      the CDL community-bank importer (one parse per dump, one merge)
  tools/rebalance-options.py one-off option-length rebalancer for the CDL bank
middleware.ts                Vercel Basic Auth in front of the whole site (never bundled by Vite)
vercel.json                  Vercel build settings and security headers
docs/
  deployment.md              hosting and password protection
  design-guideline.md        colours, type, components — derived from Kira Learning
```

Imports use the `@/` alias for `src/` (set in `vite.config.ts` and `tsconfig.json`), so a file
never climbs out of its folder with `../../`.

## The ACE bank

`src/exams/ace/questions/*.ts` holds 666 Associate Cloud Engineer questions from a community PDF
dump (667 questions; one word-for-word repeat dropped), one file per exam-guide section. `ace-NNN` is
the question's number in that PDF. Each question was assigned to the section and topic its decision
belongs to, given a difficulty, and given an explanation.

Dump keys are often wrong, so every key was reviewed against current Google Cloud documentation, and
the doubtful ones got an independent second opinion. Thirteen keys were corrected (ace-005, 006, 033,
218, 257, 291, 335, 382, 457, 530, 576, 593, 635); each of those explanations opens with "The PDF's key
says …" and gives the reason. Where two options are defensible the PDF key was kept and the
explanation says what makes it debatable.

The pipeline that produced them is in `scripts/importers/ace-pdf/` (see its README). Its intermediate
data is not kept, so the question files are now the source: edit them directly.

Presets: Full Exam (50 q / 2 h in the guide's weights), Real-length Exam (50–60 q / 2 h), Renewal
Exam (20 q / 1 h) and Quick Drill (15 q / 20 min); every section and topic can also be drilled
untimed.

## The CDL community bank

`src/exams/cdl/questions/community.ts` holds 289 Cloud Digital Leader questions as they
circulate in the public community question banks, imported verbatim by
`scripts/importers/examtopics/*.py` — one `-parseN.py` per raw dump writes `parsedN.json`, and the
latest `-mergeN.py` execs the previous one's data section and writes the combined bank, so the
hand-written explanations are never retyped. Two things are deliberate:

- **The answer is the community's most-voted choice**, not the "Correct Answer" the dumps print. On
  15 of them the two disagree and the printed one is wrong (it claims the Natural Language API
  question is Recommendations AI, for instance).
- **`votes` carries the published vote split**, stored as option *indices* so it survives the
  per-attempt option shuffle, and rendered as a "Community vote distribution" bar on reveal. It is
  present on the 45 questions whose dump published percentages; the rest were published with only a
  *Most Voted* marker, so they reveal the suggested answer and explanation without a bar.

The numbering runs 1 to 289 with no gaps, so `et-NNN` is that question's number on the site.

These questions are flagged `verbatim: true`, which tells `bun run validate` not to complain that
their options are uneven — they are quoted, not written here. They sit in their own section and a
dedicated **Community Exam** preset (50–60 q / 90 min — a blueprint entry may be `[min, max]`, and
the paper draws a different length in that range every sitting, the way the real exam does); the guide-weighted Full Exam and Renewal presets
are unchanged, so the two ways of practising stay separate.

## Reviewing a finished paper

Handing in shows the score, and **Review every question** opens the whole paper with the right
answer and explanation on each one. That review is no longer lost when you leave the screen: the
last `REVIEWABLE_ATTEMPTS` (6) handed-in papers are stored whole — questions, the shuffled option
order and what you picked — under `<prefix>-quiz-papers-v1`, so every recent row under *Your
attempts* carries a **Review** button that still works after a reload or a restart. Papers are
stored rather than question ids so a review survives edits and renumbering in the bank. Six CDL
papers come to roughly 250 KB; if the browser refuses the write, the oldest are dropped until it
fits, so a row only offers Review when there is really a paper behind it.

## Answer reveal (ExamTopics-style)

Untimed papers (section and topic drills) run in **study mode**: every question has a *Show
suggested answer* button that opens a green *Suggested answer: B* strip, a bar of how you have
picked on that question across sittings, and the explanation. Timed papers keep the answers hidden
until you hand in; the review screen then shows the same strip for every question. Pick history is
stored per exam in `localStorage` (`<prefix>-quiz-picks-v1`), keyed by option text so it survives
shuffling.

## Cheat sheet

An exam can carry a `cheatsheet` — plain data in `src/exams/<id>/cheatsheet.ts`, rendered by
`src/views/Cheatsheet.svelte` at `#/<id>/cheatsheet`. One keyword filter narrows the whole sheet, and
the jump nav is grouped by part.

The CDL sheet runs in three parts, declared in `cheatsheet.parts` with each group naming its `part`:

- **Choosing between the services** — eleven groups covering compute, storage and databases, storage
  classes, data pipelines and BI, AI approach and pre-trained APIs, migration paths, service and
  deployment models, security, and operations vocabulary. The "which product would you recommend"
  questions that make up most of the paper.
- **Concepts and vocabulary** — what the exam defines rather than applies: the paper's own format and
  domain weights, cloud against on-premises, CapEx against OpEx, core terminology, data and AI
  concepts, compute trade-offs, APIs, threats, trust and compliance, and cost vocabulary.
- **Sitting the exam** — technique, common mistakes, and where to study next.

A group may carry any of four block kinds, all optional: `path` (the decision path — read top to
bottom, stop at the first match), one table as `columns`/`rows`, several captioned tables as
`tables` (a table may set `mono: true` to render its values in the mono face, as the ACE command
table does), and `bullets`, whose entries are either a string or a `[term, text]` pair. Notes render
after the tables unless the group sets `notesFirst`. A `tip` renders as a highlighted exam-tip line
at the end of the group.

## Design system

The look is taken from Kira Learning and written up in
[docs/design-guideline.md](docs/design-guideline.md): an editorial serif (Newsreader) over a quiet
grotesk (Hanken Grotesk), ink on white, stone and cream, square corners, no shadows, and one mint
highlighter for the thing to look at — the chosen option, the current question, the progress bar,
the suggested answer. Dark mode keeps the same structure on warm near-black. Both fonts are
self-hosted from `@fontsource-variable/*`, so the app still makes no request to another origin. All
tokens live at the top of `src/styles/global.css`.

## Adding an exam

1. Create `src/exams/<id>/index.ts` and export a `defineExam({...})` with an `id`, a
   `storagePrefix` (its localStorage namespace), `name`, `subtitle`, `tagline`, `blurb`, `icon`,
   `sections`, `modes`, `fullModeId`, the `home` copy, a `verdict(percent)` function and a `footer`.
   Give it `parts` if the real paper has ordered sections (Academy) or `mixed: true` if it
   interleaves everything (CDL). `drillMin` and `drillSize` are optional.
2. Put the question files under `src/exams/<id>/questions/`.
3. Write `src/exams/<id>/About.svelte` (copy the CDL one as a starting point).
4. List the exam in `src/exams/registry.ts` and attach its About page in `src/exams/index.ts`.
5. Optionally give it an accent colour in `src/styles/global.css` (see the `data-exam='cdl'` block).
6. `bun run validate`.

## Question format

```js
{
  id: 'data-07',
  topic: 'Data management solutions',   // topics become drills automatically
  difficulty: 'medium',                 // easy | medium | hard
  prompt: 'What is BigQuery?',
  options: ['…', '…', '…', '…'],
  answer: 1,                            // index into options, BEFORE shuffling
  explanation: '…',
  tip: '…'                              // optional method note
}
```

A **multiple select** question uses an array: `answer: [0, 2]`. The prompt should say how many to
choose; the app enforces that many picks, scores all-or-nothing (as the CDL exam does), and shows
"1 of 2 right" on review. Picture options (`optionFigures`) are single-select only.

Questions and answer options are reshuffled on every attempt. A paper in progress is saved to
`localStorage` under the exam's own prefix, so switching exams mid-paper keeps it resumable.

---

# Apple Developer Academy

The notes below are specific to the Academy paper.

## What it does

- **The real shape of the paper.** Tech Division · Full Test is 50 questions in 120 minutes in the
  running order the test uses: 35 in Section 1 Logic (written and picture-based, mixed), then 15 in
  Section 2 Programming (pseudocode and OOP, mixed). No design or product block — the Tech paper
  does not ask for one. Half Sitting (25 q / 60 min) and Quick Drill (15 q / 12 min) are the same
  paper scaled down.
- **Picture-based logic questions.** Matrix reasoning, shape series, rotations and mirrors, folded
  paper, cube nets — drawn as inline SVG that follows the theme.
- **An inductive reasoning paper.** A fourth preset in the AssessmentDay / Talent Q / Raven's
  format: 10 questions in 11 minutes, each a 3×3 grid of symbols with one cell missing and
  **twelve** candidate tiles. Kept out of the Academy presets on purpose — those are reported as
  four-option questions — but it is the best training there is for the four-option version.
- **Topic drills.** Every `topic` in the bank is its own untimed paper, derived from the questions
  rather than declared — write a question with a new topic and its drill appears. Any topic holding
  `DRILL_MIN` (8) questions or more gets a card of its own on the home page; all 20 logic topics
  now do, from Seating arrangement (58) and Blood relations (61) down to Calendars and Clocks (8 each), and so does the
  picture-based Matrix reasoning set (32). A card draws
  `DRILL_SIZE` (10) at random from the pool, so repeat sittings are different papers — or take the
  whole pool with the "All N" button. Each card shows the easy/medium/hard split behind it.
  Thinner topics in the other sections stay as chips under "Smaller topics" on the section row.
- **Section drills.** Any whole section, untimed, grouped under the paper's own two sections, with
  everything the Tech paper does not ask kept under a clearly-labelled "Extra practice" heading.
- **Real test conditions.** Countdown clock that auto-submits at zero, question navigator, flag for
  review, keyboard shortcuts (letters or digits to answer, `←`/`→` to move, `M` to flag).
- **Resumable.** A paper in progress is saved to `localStorage`, so an accidental refresh or a
  closed tab does not lose it — the same way the real test lets you rejoin after a disconnect.
- **Scoring and review.** Overall percentage, a breakdown per test section (with the written /
  picture and fundamentals / OOP split inside each one), and a review screen filtered
  by missed / flagged / correct, with a written explanation on every question.
- **Shuffling.** Questions and answer options are reshuffled on every attempt, so repeat sittings
  do not reward memorising letter positions.

## The question bank

448 questions across six sections, each with `topic`, `difficulty` and a written `explanation`;
some also carry a `tip` — a one-line method note shown under the explanation on review.
`partId` says which half of the real paper a section belongs to — `logic-test`, `programming-test`,
or none for the two extras that the Tech paper does not ask:

| Section                    | On the paper | Questions | Covers                                                                                              |
| -------------------------- | ------------ | --------- | --------------------------------------------------------------------------------------------------- |
| Logic & Reasoning          | Section 1    | 286       | Number/letter series, coding-decoding, syllogisms, analogies, odd-one-out, arithmetic reasoning, probability, blood relations, sets, direction, seating/ordering, truth-and-lies, matrix patterns, propositional logic, clocks, calendars and deduction puzzles |
| Visual & Figural Reasoning | Section 1    | 53        | Matrix puzzles, shape series, rotations, mirrors, visual odd-one-out, paper folding, cube nets, figure counting, symmetry |
| Programming Fundamentals   | Section 2    | 49        | Pseudocode tracing, loops, arrays, recursion, data types (number vs numeral-as-text), operators, complexity, data structures, Git, terminal, backend basics |
| Object-Oriented Programming| Section 2    | 28        | The four pillars, constructors, inheritance, polymorphism, protocols, access control, value vs reference types, SOLID |
| Inductive Reasoning        | extra        | 12        | 3×3 symbol grids with 12 options: shape × fill, shape × count, direction × frame, size, position, Latin squares, union/difference overlays, line counts, rotating shading |
| Design, UX & Product       | extra        | 20        | Design thinking, usability heuristics, accessibility, Apple's HIG, product and business sense, Challenge Based Learning |

The real paper does not separate the sections inside a part — a picture question can follow a
written one, and an OOP question can follow a pseudocode trace — so `buildPaper` draws each part
as one block and shuffles it. The bank keeps them apart only so they can be drilled one at a time.

### Figures

Every diagram is **inline SVG generated in `svg.ts`** — no image files. Small builders (`series`,
`matrix`, `grid3`, `analogy`, `net`, `polygon`, `motif`, `pie`, `lines`, `arrow`, …) compose shape
fragments, and each stroke uses `currentColor`, so the figures stay sharp at any size and follow
the light/dark theme automatically. Questions whose *answers* are pictures carry `optionFigures`;
their `options` strings become the screen-reader descriptions.

The inductive grids go one step further: each is generated from an explicit `(row, col) → tile`
rule via `grid3`, and the twelve options are built as a **cross-product** of the two attributes in
play, with the answer looked up *by description* rather than by a hand-counted index:

```js
figure: grid3((r, c) => motif(['circle', 'square', 'triangle'][r], FILLS[c])),
...bank(cross(SHAPE_SET, FILLS, (s, f) => `${FILL_WORD[f]} ${s}`, motif), 'Solid triangle')
```

So the pattern is guaranteed self-consistent, and a typo in the answer string yields index `-1`,
which `bun run validate` rejects.

`figure-matrix.ts` takes the same idea further for the 3x3 figure-matrix format — a grid with the
bottom-right cell missing and four candidate tiles. A paper is declared as two attribute lists, one
running down the rows and one across the columns, plus a `draw(row, col)` that renders a cell; the
grid, the four options, their screen-reader descriptions and the explanation are all derived from
that. Each list carries a spare fourth value used only for wrong answers, so neither "the tile I can
already see in the grid" nor "the tile I cannot" is a shortcut to the answer. Nine rule families —
shape x shading, shape x size, sides x dots, rotation, line direction x count, shaded quarters,
added surrounds, nesting depth and inner marks — currently produce 20 papers, and a new one is a
five-line entry in `PAPERS`.

### Adding questions

Drop a new object into the relevant file in `src/exams/apple/questions/`:

```js
{
  id: 'log-242',
  topic: 'Number series',
  difficulty: 'medium',        // easy | medium | hard
  prompt: 'What comes next?\n\n2, 4, 8, ?',
  lang: 'pseudocode',          // optional, only with `code`
  code: '...',                 // optional
  options: ['12', '16', '18', '20'],
  answer: 1,                   // index into options, BEFORE shuffling
  explanation: 'Each term doubles.',
  tip: 'Compute the differences first.'   // optional method note
}
```

Then run `bun run validate` — it checks for duplicate ids, out-of-range answer indices, duplicate or
blank options, missing explanations, presets that ask for more questions than a section holds, and
for figures: unbalanced SVG tags, `NaN`/`undefined` coordinates, and identical option art. It also
prints — without failing — any pair of questions in the same topic that share more than 68% of their
word pairs across prompt, code and options, which is how a reworded duplicate gets caught before it
lands in a drill. It compares word pairs rather than single words because whole families here are
built from one sentence pattern (seating clues, clock angles, series prompts), and it reads the
options and the code as well as the prompt — "Which one does not belong?" is the same prompt in a
dozen questions, and the struct/class pair in the OOP section differs only in its code.

## Where the format came from

The Academy does not publish a syllabus. The structure here is assembled from its own knowledge
base and from first-hand accounts by people who sat the test — all linked on the **About the test**
page in the app. The paper varies between batches and campuses, which is why the app offers more
than one preset rather than claiming a single definitive format.
