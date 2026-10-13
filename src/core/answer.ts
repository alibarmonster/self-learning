/**
 * Answer checking. A question's `answer` is either an index into `options`
 * (single choice) or a sorted array of indices (multiple select, "choose two").
 * A sitter's answer follows the same shape; `isCorrect` compares the two.
 */
import type { Given, Question } from '@/types';

type Keyed = Pick<Question, 'answer'>;

export function isMulti<Q extends Keyed>(question: Q): question is Q & { answer: number[] } {
  return Array.isArray(question.answer);
}

/** How many options a question expects the sitter to pick. */
export function pickCount(question: Keyed): number {
  return isMulti(question) ? question.answer.length : 1;
}

export function isCorrect(question: Keyed, given: Given | undefined): boolean {
  if (given === null || given === undefined) return false;
  if (!isMulti(question)) return given === question.answer;
  if (!Array.isArray(given) || given.length !== question.answer.length) return false;
  const want = new Set(question.answer);
  return given.every((i) => want.has(i));
}

/** True when option `i` is one of the correct answers. */
export function isAnswerOption(question: Keyed, i: number): boolean {
  return isMulti(question) ? question.answer.includes(i) : question.answer === i;
}

/** True when option `i` is among what the sitter chose. */
export function isChosen(given: Given | undefined, i: number): boolean {
  return Array.isArray(given) ? given.includes(i) : given === i;
}
