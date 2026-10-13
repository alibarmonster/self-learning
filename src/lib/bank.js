/**
 * Exam-agnostic question-bank machinery. An exam (see `exams/index.js`) declares
 * its parts, sections and modes; `defineExam` derives everything the app needs
 * from that — lookup tables, the topic list, which topics are thick enough to
 * drill — and the paper builders below draw from it.
 *
 * A question's `answer` is either an index into `options` (single choice) or a
 * sorted array of indices (multiple select, "choose two"). A sitter's answer
 * follows the same shape; `isCorrect` compares the two.
 */

/** How many questions a topic needs before it is worth sitting on its own. */
export const DEFAULT_DRILL_MIN = 8;

/** How many questions a topic card draws — a short, repeatable sitting. */
export const DEFAULT_DRILL_SIZE = 10;

export function isMulti(question) {
  return Array.isArray(question.answer);
}

/** How many options a question expects the sitter to pick. */
export function pickCount(question) {
  return isMulti(question) ? question.answer.length : 1;
}

export function isCorrect(question, given) {
  if (given === null || given === undefined) return false;
  if (!isMulti(question)) return given === question.answer;
  if (!Array.isArray(given) || given.length !== question.answer.length) return false;
  const want = new Set(question.answer);
  return given.every((i) => want.has(i));
}

/** True when option `i` is one of the correct answers. */
export function isAnswerOption(question, i) {
  return isMulti(question) ? question.answer.includes(i) : question.answer === i;
}

/** True when option `i` is among what the sitter chose. */
export function isChosen(given, i) {
  return Array.isArray(given) ? given.includes(i) : given === i;
}

export function shuffle(items) {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

/**
 * Shuffles the options of a question and remaps the answer, so sitting the
 * same paper twice does not reward memorising letter positions.
 */
export function withShuffledOptions(question) {
  const order = shuffle(question.options.map((_, i) => i));
  const shuffled = {
    ...question,
    options: order.map((i) => question.options[i]),
    answer: isMulti(question)
      ? question.answer.map((a) => order.indexOf(a)).sort((a, b) => a - b)
      : order.indexOf(question.answer)
  };
  // Picture answers must travel with the description they belong to.
  if (question.optionFigures) {
    shuffled.optionFigures = order.map((i) => question.optionFigures[i]);
  }
  // Published vote rows are stored against the original option order.
  if (question.votes) {
    shuffled.votes = question.votes.map((v) => ({
      ...v,
      pick: v.pick.map((i) => order.indexOf(i)).sort((a, b) => a - b)
    }));
  }
  return shuffled;
}

/**
 * A blueprint entry is either a fixed count or `[min, max]` — a paper whose
 * length varies from sitting to sitting, the way the real Cloud Digital Leader
 * exam hands out somewhere between 50 and 60 questions.
 */
function blueprintMin(want) {
  return Array.isArray(want) ? want[0] : want;
}

function blueprintMax(want) {
  return Array.isArray(want) ? want[1] : want;
}

function drawCount(want) {
  if (!Array.isArray(want)) return want;
  const [min, max] = want;
  return min + Math.floor(Math.random() * (max - min + 1));
}

/** The longest a paper can run — what capacity checks should use. */
export function modeQuestionCount(mode) {
  return Object.values(mode.blueprint).reduce((n, want) => n + blueprintMax(want), 0);
}

/** How the length reads on a card: "50" for a fixed paper, "50–60" for a range. */
export function modeQuestionLabel(mode) {
  const min = Object.values(mode.blueprint).reduce((n, want) => n + blueprintMin(want), 0);
  const max = modeQuestionCount(mode);
  return min === max ? `${max}` : `${min}–${max}`;
}

/** The same, per section, for the blueprint list on a mode card. */
export function blueprintLabel(want) {
  return Array.isArray(want) ? `${want[0]}–${want[1]}` : `${want}`;
}

/**
 * Fills in the derived tables of an exam definition. Everything the views need
 * to look up by id lives here, so an exam file only has to declare its data.
 */
export function defineExam(def) {
  const parts = def.parts ?? [];
  // An exam may arrive with only a cheat sheet — its bank and presets come
  // later — so both lists default to empty and everything derived copes with
  // that. `studyOnly` is what the views check before offering a paper.
  const sections = def.sections ?? [];
  const modes = def.modes ?? [];
  const drillMin = def.drillMin ?? DEFAULT_DRILL_MIN;
  const drillSize = def.drillSize ?? DEFAULT_DRILL_SIZE;

  const topics = sections.flatMap((section) => {
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

  const drillTopics = sections.flatMap((section) =>
    topics
      .filter((t) => t.section.id === section.id && t.count >= drillMin)
      .sort((a, b) => b.count - a.count)
  );

  return {
    ...def,
    parts,
    drillMin,
    drillSize,
    partById: Object.fromEntries(parts.map((p) => [p.id, p])),
    sectionById: Object.fromEntries(sections.map((s) => [s.id, s])),
    modeById: Object.fromEntries(modes.map((m) => [m.id, m])),
    bankSize: sections.reduce((n, s) => n + s.questions.length, 0),
    studyOnly: modes.length === 0,
    topics,
    topicById: Object.fromEntries(topics.map((t) => [t.id, t])),
    drillTopics,
    focusTopicIds: def.focusTopicIds ?? []
  };
}

/**
 * Draws a paper for a mode. With `exam.mixed`, every drawn question goes into
 * one shuffled pile — the way a certification exam interleaves its domains.
 * Otherwise the paper is one block per part in test order, with the sections
 * inside a block mixed; a section with no part stands as its own block.
 */
export function buildPaper(exam, mode) {
  const blocks = new Map();
  for (const section of exam.sections) {
    const want = drawCount(mode.blueprint[section.id] ?? 0);
    if (want === 0) continue;
    const key = exam.mixed ? 'all' : (section.partId ?? `section:${section.id}`);
    const drawn = shuffle(section.questions)
      .slice(0, want)
      .map((q) => ({ ...withShuffledOptions(q), sectionId: section.id }));
    blocks.set(key, [...(blocks.get(key) ?? []), ...drawn]);
  }
  // Map keeps insertion order, so the blocks stay in section order.
  return [...blocks.values()].flatMap((block) => shuffle(block));
}

/** Draws a single-section practice set. */
export function buildSectionPaper(exam, sectionId, count) {
  const section = exam.sectionById[sectionId];
  const drawn = shuffle(section.questions).slice(0, Math.min(count, section.questions.length));
  return drawn.map((q) => ({ ...withShuffledOptions(q), sectionId }));
}

/** Draws a practice set from a single topic. */
export function buildTopicPaper(exam, sectionId, topic, count) {
  const pool = exam.sectionById[sectionId].questions.filter((q) => q.topic === topic);
  return shuffle(pool)
    .slice(0, Math.min(count, pool.length))
    .map((q) => ({ ...withShuffledOptions(q), sectionId }));
}
