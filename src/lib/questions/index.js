import { logic } from './logic.js';
import { figural } from './figural.js';
import { inductive } from './inductive.js';
import { programming } from './programming.js';
import { oop } from './oop.js';
import { design } from './design.js';

/**
 * The two parts the real paper is split into for the Tech division:
 * Section 1 — Logic Test, Section 2 — Programming Test, 120 minutes in total.
 * Sections of the bank map onto a part; the ones with no `partId` (inductive
 * reasoning, design) are extra practice that the Tech paper does not include.
 */
export const PARTS = [
  {
    id: 'logic-test',
    number: 1,
    name: 'Logic Test',
    blurb:
      'Written and picture-based reasoning, mixed together. Applicants describe it as very close to an IQ test.'
  },
  {
    id: 'programming-test',
    number: 2,
    name: 'Programming Test',
    blurb:
      'Variables and data types, if-else, loops, output prediction and OOP concepts. Applicants call the level "still very learnable" even without an IT background.'
  }
];

export const PART_BY_ID = Object.fromEntries(PARTS.map((p) => [p.id, p]));

/**
 * Section metadata. `partId` says which half of the real paper a section
 * belongs to; on the paper itself the two sections inside a part are not
 * separated, which is why `buildPaper` mixes them.
 */
export const SECTIONS = [
  {
    id: 'logic',
    partId: 'logic-test',
    name: 'Logic & Reasoning',
    short: 'Logic',
    icon: '◇',
    blurb:
      'Number and letter series in the style of SNBT quantitative reasoning, syllogisms, analogies, odd-one-out, probability, and seating-and-ordering puzzles with conditional constraints. Applicants describe this part as feeling like an IQ test.',
    questions: logic
  },
  {
    id: 'figural',
    partId: 'logic-test',
    name: 'Visual & Figural Reasoning',
    short: 'Visual',
    icon: '▣',
    blurb:
      'The picture half of the logic block: matrix puzzles, shape series, rotations and mirrors, odd-one-out, folded paper and cube nets. On the real paper these are mixed in with the written logic questions.',
    questions: figural
  },
  {
    id: 'inductive',
    name: 'Inductive Reasoning',
    short: 'Inductive',
    icon: '⠿',
    blurb:
      'The hardest picture format: a 3×3 grid of symbols with one cell missing and twelve candidate tiles. Two rules run at once — one down the rows, one across the columns — and with twelve options, guessing is close to worthless.',
    questions: inductive
  },
  {
    id: 'programming',
    partId: 'programming-test',
    name: 'Programming Fundamentals',
    short: 'Programming',
    icon: '{ }',
    blurb:
      'Language-agnostic pseudocode plus some Swift. Variables, data types, conditionals, loops, arrays, recursion, complexity, and a little Git, terminal and backend.',
    questions: programming
  },
  {
    id: 'oop',
    partId: 'programming-test',
    name: 'Object-Oriented Programming',
    short: 'OOP',
    icon: '◻︎',
    blurb:
      'The four pillars, constructors, inheritance, polymorphism, protocols, access control and value vs reference types.',
    questions: oop
  },
  {
    id: 'design',
    name: 'Design, UX & Product',
    short: 'Design',
    icon: '✳︎',
    blurb:
      'Not on the Tech-division paper — kept as optional practice. Design thinking, usability, accessibility, Apple’s Human Interface Guidelines, product sense and Challenge Based Learning. Useful for the group interview, and for the Design category paper.',
    questions: design
  }
];

export const SECTION_BY_ID = Object.fromEntries(SECTIONS.map((s) => [s.id, s]));

export const BANK_SIZE = SECTIONS.reduce((n, s) => n + s.questions.length, 0);

/**
 * Test presets. The Tech-division paper is two sections in 120 minutes — Logic
 * then Programming — with no design or product block, so that is the shape the
 * presets follow; the shorter ones are the same paper scaled down.
 */
export const MODES = [
  {
    id: 'tech',
    name: 'Tech Division · Full Test',
    tagline: '50 questions · 120 minutes',
    minutes: 120,
    blueprint: { logic: 25, figural: 10, programming: 10, oop: 5 },
    description:
      '50 questions in 120 minutes, in the real running order: 35 in Section 1 Logic, then 15 in Section 2 Programming. That is roughly 2½ minutes a question, so the clock is not the hard part — the reasoning is. No design questions. This is the one to sit under exam conditions.'
  },
  {
    id: 'half',
    name: 'Half Sitting',
    tagline: 'Same shape, half the clock',
    minutes: 60,
    blueprint: { logic: 13, figural: 5, programming: 5, oop: 2 },
    description:
      '25 questions in 60 minutes — the full paper cut in half, section for section. For a weeknight rep when two hours is too much.'
  },
  {
    id: 'quick',
    name: 'Quick Drill',
    tagline: 'A short warm-up',
    minutes: 12,
    blueprint: { logic: 7, figural: 3, programming: 3, oop: 2 },
    description: '15 mixed questions in 12 minutes, in the same 7:3 ratio as the real paper. Good for a daily rep.'
  },
  {
    id: 'inductive',
    name: 'Inductive Reasoning',
    tagline: 'Grid of symbols · 12 options',
    minutes: 11,
    blueprint: { inductive: 10 },
    description:
      '10 questions in 11 minutes, in the AssessmentDay / Talent Q format: a grid of symbols with one cell missing and twelve possible answers. Deliberately kept out of the Academy presets, which applicants describe as four-option questions.'
  }
];

export const MODE_BY_ID = Object.fromEntries(MODES.map((m) => [m.id, m]));

export function modeQuestionCount(mode) {
  return Object.values(mode.blueprint).reduce((a, b) => a + b, 0);
}

function shuffle(items) {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

/**
 * Shuffles the options of a question and remaps the answer index, so sitting
 * the same paper twice does not reward memorising letter positions.
 */
function withShuffledOptions(question) {
  const order = shuffle(question.options.map((_, i) => i));
  const shuffled = {
    ...question,
    options: order.map((i) => question.options[i]),
    answer: order.indexOf(question.answer)
  };
  // Picture answers must travel with the description they belong to.
  if (question.optionFigures) {
    shuffled.optionFigures = order.map((i) => question.optionFigures[i]);
  }
  return shuffled;
}

/**
 * Draws a paper for the given mode, one block per part in test order. Inside a
 * block the sections are mixed — on the real paper a picture question can
 * follow a written one, and an OOP question can follow a pseudocode trace.
 */
export function buildPaper(mode) {
  const blocks = new Map();
  for (const section of SECTIONS) {
    const want = mode.blueprint[section.id] ?? 0;
    if (want === 0) continue;
    const key = section.partId ?? `section:${section.id}`;
    const drawn = shuffle(section.questions)
      .slice(0, want)
      .map((q) => ({ ...withShuffledOptions(q), sectionId: section.id }));
    blocks.set(key, [...(blocks.get(key) ?? []), ...drawn]);
  }
  // Map keeps insertion order, so the blocks stay in SECTIONS order.
  return [...blocks.values()].flatMap((block) => shuffle(block));
}

/** Draws a single-section practice set. */
export function buildSectionPaper(sectionId, count) {
  const section = SECTION_BY_ID[sectionId];
  const drawn = shuffle(section.questions).slice(0, Math.min(count, section.questions.length));
  return drawn.map((q) => ({ ...withShuffledOptions(q), sectionId }));
}

// ── Topic drills ───────────────────────────────────────────────────────────

/**
 * Every topic in the bank as its own drillable set. Topics are derived from
 * the questions rather than declared, so writing a question with a new topic
 * creates a drill for it automatically.
 */
export const TOPICS = SECTIONS.flatMap((section) => {
  const counts = new Map();
  for (const q of section.questions) {
    const entry = counts.get(q.topic) ?? { count: 0, easy: 0, medium: 0, hard: 0 };
    entry.count += 1;
    entry[q.difficulty] += 1;
    counts.set(q.topic, entry);
  }
  return [...counts].map(([topic, entry]) => ({
    id: `${section.id}:${topic}`,
    section,
    topic,
    ...entry
  }));
});

export const TOPIC_BY_ID = Object.fromEntries(TOPICS.map((t) => [t.id, t]));

/**
 * How many questions a topic needs before it is worth sitting on its own. Below
 * this a "drill" is over in a minute and repeats itself on the second attempt.
 */
export const DRILL_MIN = 8;

/**
 * How many questions a topic card draws. A drill is meant to be a short sitting
 * you can repeat — a fresh random ten out of the pool each time, rather than
 * the same sixty questions in the same order.
 */
export const DRILL_SIZE = 10;

/** Topics thick enough to be their own paper, biggest first inside a section. */
export const DRILL_TOPICS = SECTIONS.flatMap((section) =>
  TOPICS.filter((t) => t.section.id === section.id && t.count >= DRILL_MIN).sort(
    (a, b) => b.count - a.count
  )
);

/** The topics that must stay drillable — the validator fails if one goes thin. */
export const FOCUS_TOPIC_IDS = [
  'logic:Number series',
  'logic:Arithmetic reasoning',
  'logic:Probability',
  'logic:Blood relations'
];

/** Draws a practice set from a single topic. */
export function buildTopicPaper(sectionId, topic, count) {
  const pool = SECTION_BY_ID[sectionId].questions.filter((q) => q.topic === topic);
  return shuffle(pool)
    .slice(0, Math.min(count, pool.length))
    .map((q) => ({ ...withShuffledOptions(q), sectionId }));
}
