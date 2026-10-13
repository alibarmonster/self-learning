/**
 * Paper builders: draw questions from an exam's bank and shuffle their options
 * so sitting the same paper twice does not reward memorising letter positions.
 */
import { isMulti } from './answer.js';
import { drawCount } from './blueprint.js';

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
