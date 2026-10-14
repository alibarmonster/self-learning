/**
 * Paper builders: draw questions from an exam's bank and shuffle their options
 * so sitting the same paper twice does not reward memorising letter positions.
 */
import type { Exam, Mode, PaperQuestion, PaperSet, Question } from '@/types';
import { drawCount } from './blueprint';

export function shuffle<T>(items: readonly T[]): T[] {
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
export function withShuffledOptions<Q extends Question>(question: Q): Q {
  const order = shuffle(question.options.map((_, i) => i));
  const shuffled: Q = {
    ...question,
    options: order.map((i) => question.options[i]),
    answer:
      typeof question.answer === 'number'
        ? order.indexOf(question.answer)
        : question.answer.map((a) => order.indexOf(a)).sort((a, b) => a - b)
  };
  // Picture answers must travel with the description they belong to.
  const figures = question.optionFigures;
  if (figures) shuffled.optionFigures = order.map((i) => figures[i]);
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
export function buildPaper(exam: Exam, mode: Mode): PaperQuestion[] {
  const blocks = new Map<string, PaperQuestion[]>();
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
export function buildSectionPaper(exam: Exam, sectionId: string, count: number): PaperQuestion[] {
  const section = exam.sectionById[sectionId];
  const drawn = shuffle(section.questions).slice(0, Math.min(count, section.questions.length));
  return drawn.map((q) => ({ ...withShuffledOptions(q), sectionId }));
}

/** Draws a practice set from a single topic. */
export function buildTopicPaper(
  exam: Exam,
  sectionId: string,
  topic: string,
  count: number
): PaperQuestion[] {
  const pool = exam.sectionById[sectionId].questions.filter((q) => q.topic === topic);
  return shuffle(pool)
    .slice(0, Math.min(count, pool.length))
    .map((q) => ({ ...withShuffledOptions(q), sectionId }));
}

/**
 * Draws a fixed set: always the same questions, shuffled into a new order with
 * their options reshuffled. Ids that no longer exist in the bank are skipped,
 * so editing the bank can shrink a set but never break it.
 */
export function buildSetPaper(exam: Exam, set: PaperSet): PaperQuestion[] {
  const where = new Map<string, { question: Question; sectionId: string }>();
  for (const section of exam.sections) {
    for (const question of section.questions) where.set(question.id, { question, sectionId: section.id });
  }
  const drawn = set.questionIds.flatMap((id) => {
    const hit = where.get(id);
    return hit ? [{ ...withShuffledOptions(hit.question), sectionId: hit.sectionId }] : [];
  });
  return shuffle(drawn);
}
